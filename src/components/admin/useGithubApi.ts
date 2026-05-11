import { ref } from 'vue'

export interface GithubFileResult {
  content: string  // decoded YAML string
  sha: string
}

export function useGithubApi(owner: string, repo: string) {
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
      `https://api.github.com/repos/${owner}/${repo}/contents/config.yaml`,
      { headers: { Authorization: `Bearer ${token.value}`, Accept: 'application/vnd.github+json' } }
    )
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
    const data = await res.json()
    const content = atob(data.content.replace(/\n/g, ''))
    return { content, sha: data.sha }
  }

  async function commitConfig(yamlContent: string, sha: string): Promise<void> {
    const encoded = btoa(unescape(encodeURIComponent(yamlContent)))
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/config.yaml`,
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
