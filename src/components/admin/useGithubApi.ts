import { ref } from 'vue'

export interface GithubFileResult {
  content: string  // decoded YAML string
  sha: string
}

export function useGithubApi(owner: string, repo: string) {
  // Token 存储在 localStorage，可被同源 JS 读取。
  // 建议使用最小权限 token（仅 contents:write 单仓库）以降低泄露风险。
  const token = ref<string>(localStorage.getItem('admin_github_token') ?? '')

  function saveToken(t: string) {
    token.value = t
    localStorage.setItem('admin_github_token', t)
  }

  function clearToken() {
    token.value = ''
    localStorage.removeItem('admin_github_token')
  }

  async function fetchConfig(): Promise<GithubFileResult> {
    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/config.yaml`,
      { headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/vnd.github+json' } }
    )
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
    const data = await res.json()
    if (typeof data.content !== 'string' || typeof data.sha !== 'string') {
      throw new Error('Unexpected GitHub API response shape')
    }
    const bytes = Uint8Array.from(atob(data.content.replace(/\n/g, '')), c => c.charCodeAt(0))
    const content = new TextDecoder().decode(bytes)
    return { content, sha: data.sha }
  }

  async function commitConfig(yamlContent: string, sha: string): Promise<void> {
    const bytes = new TextEncoder().encode(yamlContent)
    let binary = ''
    bytes.forEach(b => (binary += String.fromCharCode(b)))
    const encoded = btoa(binary)
    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/config.yaml`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'chore: update config via admin panel',
          content: encoded,
          sha,
        }),
      }
    )
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message ?? `GitHub API error: ${res.status}`)
    }
  }

  return { token, saveToken, clearToken, fetchConfig, commitConfig }
}
