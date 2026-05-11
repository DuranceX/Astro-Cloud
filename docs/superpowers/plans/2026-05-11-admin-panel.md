# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Astro-Cloud 博客中添加 `/admin` 设置页面，通过 GitHub API 读写 `config.yaml`，支持管理封面、Logo、引言、关于页面、社交链接、收藏等配置项。

**Architecture:** 纯静态 Astro 页面 + Vue 3 组件，页面加载时通过 GitHub REST API 读取仓库中的 `config.yaml`，用户编辑后一次性提交。Token 存储在 localStorage，仓库信息通过 Astro 环境变量注入。

**Tech Stack:** Astro 4, Vue 3, js-yaml, sortablejs, GitHub REST API

---

## 文件结构

| 文件 | 操作 | 职责 |
|------|------|------|
| `src/pages/admin.astro` | 新增 | 页面入口，注入环境变量，挂载 Vue 组件 |
| `src/components/admin/AdminPanel.vue` | 新增 | 主面板：顶部栏、左侧导航、右侧表单 |
| `src/components/admin/useGithubApi.ts` | 新增 | GitHub API 读取/提交逻辑（composable） |
| `src/components/admin/useConfig.ts` | 新增 | 配置数据状态管理、脏值检测、YAML 序列化 |
| `src/components/admin/SortableList.vue` | 新增 | 可拖拽排序的动态列表组件（social / collections 复用） |
| `.env.example` | 新增 | 环境变量示例 |
| `.gitignore` | 修改（已有 `.env` 条目，无需改动） | — |

---

## Task 1: 环境变量与页面骨架

**Files:**
- Create: `src/pages/admin.astro`
- Create: `.env.example`

- [ ] **Step 1: 创建 `.env.example`**

```
PUBLIC_GITHUB_OWNER=your-github-username
PUBLIC_GITHUB_REPO=your-repo-name
```

- [ ] **Step 2: 创建 `src/pages/admin.astro`**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AdminPanel from '@/components/admin/AdminPanel.vue';

const owner = import.meta.env.PUBLIC_GITHUB_OWNER ?? '';
const repo = import.meta.env.PUBLIC_GITHUB_REPO ?? '';
---

<BaseLayout pageTitle="博客设置">
  <div class="card-width mt-12 mb-12 w-full">
    <AdminPanel client:only="vue" owner={owner} repo={repo} />
  </div>
</BaseLayout>
```

- [ ] **Step 3: 安装 sortablejs**

```bash
cd /Users/cardy/Code/Demo/Astro-Cloud
npm install sortablejs
npm install --save-dev @types/sortablejs
```

- [ ] **Step 4: 验证构建无报错**

```bash
npm run build 2>&1 | tail -20
```

Expected: 构建成功，无 TypeScript 错误。

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin.astro .env.example package.json package-lock.json
git commit -m "feat: add admin page skeleton and sortablejs dependency"
```

---

## Task 2: GitHub API Composable

**Files:**
- Create: `src/components/admin/useGithubApi.ts`

- [ ] **Step 1: 创建 `src/components/admin/useGithubApi.ts`**

```typescript
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
```

- [ ] **Step 2: 验证 TypeScript 无报错**

```bash
cd /Users/cardy/Code/Demo/Astro-Cloud
npx tsc --noEmit 2>&1 | head -30
```

Expected: 无输出（无错误）。

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/useGithubApi.ts
git commit -m "feat: add GitHub API composable for config read/write"
```

---

## Task 3: 配置状态管理 Composable

**Files:**
- Create: `src/components/admin/useConfig.ts`

- [ ] **Step 1: 创建 `src/components/admin/useConfig.ts`**

```typescript
import { ref, computed } from 'vue'
import yaml from 'js-yaml'

export interface SocialItem {
  name: string
  url: string
}

export interface CollectionItem {
  name: string
  url: string
  favicon: string
  desc: string
}

export interface ConfigData {
  cover: string
  logo: string
  quote_card_content: string
  quote_card_source: string
  page_size: number
  avatar: string
  description: string
  social: SocialItem[]
  collections: CollectionItem[]
}

export function useConfig() {
  const original = ref<ConfigData | null>(null)
  const current = ref<ConfigData | null>(null)
  const sha = ref<string>('')

  const isDirty = computed(() => {
    if (!original.value || !current.value) return false
    return JSON.stringify(original.value) !== JSON.stringify(current.value)
  })

  function loadFromYaml(yamlStr: string, fileSha: string) {
    const raw = yaml.load(yamlStr) as any
    const data: ConfigData = {
      cover: raw.cover ?? '',
      logo: raw.logo ?? '',
      quote_card_content: raw.quote_card_content ?? '',
      quote_card_source: raw.quote_card_source ?? '',
      page_size: raw.page_size ?? 6,
      avatar: raw.avatar ?? '',
      description: raw.description ?? '',
      social: (raw.social ?? []).map((s: any) => ({ name: s.name ?? '', url: s.url ?? '' })),
      collections: (raw.collections ?? []).map((c: any) => ({
        name: c.name ?? '',
        url: c.url ?? '',
        favicon: c.favicon ?? '',
        desc: c.desc ?? '',
      })),
    }
    original.value = JSON.parse(JSON.stringify(data))
    current.value = data
    sha.value = fileSha
  }

  function serializeToYaml(fullRaw: any): string {
    if (!current.value) return ''
    // 保留原始 yaml 中不在编辑范围内的字段（sitename, author, primary_color 等）
    const merged = {
      ...fullRaw,
      cover: current.value.cover,
      logo: current.value.logo,
      quote_card_content: current.value.quote_card_content,
      quote_card_source: current.value.quote_card_source,
      page_size: current.value.page_size,
      avatar: current.value.avatar,
      description: current.value.description,
      social: current.value.social,
      collections: current.value.collections,
    }
    return yaml.dump(merged, { lineWidth: -1 })
  }

  function markSaved() {
    if (current.value) {
      original.value = JSON.parse(JSON.stringify(current.value))
    }
  }

  return { current, sha, isDirty, loadFromYaml, serializeToYaml, markSaved }
}
```

- [ ] **Step 2: 验证 TypeScript 无报错**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 无输出。

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/useConfig.ts
git commit -m "feat: add config state management composable"
```

---

## Task 4: SortableList 可拖拽列表组件

**Files:**
- Create: `src/components/admin/SortableList.vue`

- [ ] **Step 1: 创建 `src/components/admin/SortableList.vue`**

```vue
<template>
  <div>
    <div ref="listEl" class="space-y-2">
      <div
        v-for="(item, index) in modelValue"
        :key="index"
        class="flex items-start gap-2 p-3 bg-[--card-background-color] border border-[--sub-font-color]/20 rounded-lg"
      >
        <div class="drag-handle cursor-grab mt-1 text-[--sub-font-color] select-none">⠿</div>
        <div class="flex-1 grid gap-2" :class="fields.length === 2 ? 'grid-cols-2' : 'grid-cols-2'">
          <div v-for="field in fields" :key="field.key" :class="field.wide ? 'col-span-2' : ''">
            <label class="text-xs text-[--sub-font-color] mb-1 block">{{ field.label }}</label>
            <input
              :value="(item as any)[field.key]"
              @input="updateField(index, field.key, ($event.target as HTMLInputElement).value)"
              class="w-full px-2 py-1.5 text-sm rounded border border-[--sub-font-color]/20 bg-[--background-color] text-[--font-color] focus:outline-none focus:border-[--primary]"
              :placeholder="field.placeholder ?? ''"
            />
          </div>
        </div>
        <button
          @click="removeItem(index)"
          class="mt-1 text-[--sub-font-color] hover:text-red-500 transition-colors text-lg leading-none"
          title="删除"
        >×</button>
      </div>
    </div>
    <button
      @click="addItem"
      class="mt-3 text-sm text-[--primary] hover:underline"
    >+ 添加</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sortable from 'sortablejs'

interface FieldDef {
  key: string
  label: string
  placeholder?: string
  wide?: boolean
}

const props = defineProps<{
  modelValue: Record<string, any>[]
  fields: FieldDef[]
  emptyItem: Record<string, any>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>[]]
}>()

const listEl = ref<HTMLElement | null>(null)
let sortable: Sortable | null = null

onMounted(() => {
  if (listEl.value) {
    sortable = Sortable.create(listEl.value, {
      handle: '.drag-handle',
      animation: 150,
      onEnd(evt) {
        const arr = [...props.modelValue]
        const [moved] = arr.splice(evt.oldIndex!, 1)
        arr.splice(evt.newIndex!, 0, moved)
        emit('update:modelValue', arr)
      },
    })
  }
})

onUnmounted(() => {
  sortable?.destroy()
})

function updateField(index: number, key: string, value: string) {
  const arr = props.modelValue.map((item, i) =>
    i === index ? { ...item, [key]: value } : item
  )
  emit('update:modelValue', arr)
}

function removeItem(index: number) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index))
}

function addItem() {
  emit('update:modelValue', [...props.modelValue, { ...props.emptyItem }])
}
</script>
```

- [ ] **Step 2: 验证 TypeScript 无报错**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 无输出。

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/SortableList.vue
git commit -m "feat: add sortable list component for dynamic config fields"
```

---

## Task 5: AdminPanel 主组件

**Files:**
- Create: `src/components/admin/AdminPanel.vue`

- [ ] **Step 1: 创建 `src/components/admin/AdminPanel.vue`（第一部分：script）**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import yaml from 'js-yaml'
import { useGithubApi } from './useGithubApi'
import { useConfig } from './useConfig'
import SortableList from './SortableList.vue'

const props = defineProps<{ owner: string; repo: string }>()

const { token, saveToken, clearToken, fetchConfig, commitConfig } = useGithubApi(props.owner, props.repo)
const { current, sha, isDirty, loadFromYaml, serializeToYaml, markSaved } = useConfig()

const activeTab = ref<'basic' | 'about' | 'collections'>('basic')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const successMsg = ref('')
const showTokenModal = ref(false)
const tokenInput = ref(token.value)
const rawYaml = ref<any>(null)  // 保留原始完整 yaml 对象

async function loadConfig() {
  if (!token.value) return
  loading.value = true
  error.value = ''
  try {
    const { content, sha: fileSha } = await fetchConfig()
    rawYaml.value = yaml.load(content)
    loadFromYaml(content, fileSha)
  } catch (e: any) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

async function handleSave() {
  if (!isDirty.value || saving.value) return
  saving.value = true
  error.value = ''
  successMsg.value = ''
  try {
    const yamlStr = serializeToYaml(rawYaml.value)
    await commitConfig(yamlStr, sha.value)
    markSaved()
    successMsg.value = '已提交，等待 GitHub Actions 构建...'
    setTimeout(() => { successMsg.value = '' }, 4000)
  } catch (e: any) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}

function handleSaveToken() {
  saveToken(tokenInput.value.trim())
  showTokenModal.value = false
  loadConfig()
}

function handleClearToken() {
  clearToken()
  tokenInput.value = ''
  showTokenModal.value = false
}

onMounted(() => {
  if (token.value) loadConfig()
})

const socialFields = [
  { key: 'name', label: '平台名称（英文小写）', placeholder: 'github' },
  { key: 'url', label: 'URL', placeholder: 'https://github.com/...' },
]
const socialEmpty = { name: '', url: '' }

const collectionFields = [
  { key: 'name', label: '名称', placeholder: '网站名称' },
  { key: 'url', label: 'URL', placeholder: 'https://...' },
  { key: 'favicon', label: 'Favicon URL', placeholder: 'https://...' },
  { key: 'desc', label: '描述', placeholder: '简短描述', wide: true },
]
const collectionEmpty = { name: '', url: '', favicon: '', desc: '' }
</script>
```

- [ ] **Step 2: 追加 template 部分**

在同一文件 `src/components/admin/AdminPanel.vue` 的 `</script>` 后追加：

```vue
<template>
  <div class="min-h-[600px] bg-[--card-background-color] rounded-2xl shadow-sm overflow-hidden">

    <!-- 顶部栏 -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-[--sub-font-color]/20">
      <h1 class="text-xl font-bold text-[--font-color]">博客设置</h1>
      <div class="flex items-center gap-3">
        <span v-if="successMsg" class="text-sm text-green-500">{{ successMsg }}</span>
        <span v-if="error" class="text-sm text-red-500 max-w-xs truncate" :title="error">{{ error }}</span>
        <button
          @click="showTokenModal = true"
          class="w-8 h-8 flex items-center justify-center text-[--sub-font-color] hover:text-[--primary] transition-colors"
          title="GitHub Token 设置"
        >⚙</button>
        <button
          @click="handleSave"
          :disabled="!isDirty || saving"
          class="px-4 py-1.5 text-sm rounded-lg transition-colors"
          :class="isDirty && !saving
            ? 'bg-[--primary] text-white hover:opacity-90 cursor-pointer'
            : 'bg-[--sub-font-color]/20 text-[--sub-font-color] cursor-not-allowed'"
        >
          {{ saving ? '提交中...' : '保存并提交' }}
        </button>
      </div>
    </div>

    <!-- 主体 -->
    <div class="flex" style="min-height: 540px;">

      <!-- 左侧导航 -->
      <div class="w-40 flex-shrink-0 border-r border-[--sub-font-color]/20 py-4">
        <button
          v-for="tab in [
            { key: 'basic', label: '基础设置' },
            { key: 'about', label: '关于页面' },
            { key: 'collections', label: '收藏管理' },
          ]"
          :key="tab.key"
          @click="activeTab = tab.key as any"
          class="w-full text-left px-4 py-2.5 text-sm transition-colors"
          :class="activeTab === tab.key
            ? 'text-[--primary] bg-[--menu-item-bg] font-medium'
            : 'text-[--font-color] hover:bg-[--menu-item-bg]'"
        >{{ tab.label }}</button>
      </div>

      <!-- 右侧内容 -->
      <div class="flex-1 p-6 overflow-y-auto">

        <!-- 无 Token 提示 -->
        <div v-if="!token" class="flex flex-col items-center justify-center h-full gap-3 text-[--sub-font-color]">
          <p class="text-base">请先配置 GitHub Token 以加载设置</p>
          <button
            @click="showTokenModal = true"
            class="px-4 py-2 text-sm bg-[--primary] text-white rounded-lg hover:opacity-90"
          >配置 Token</button>
        </div>

        <!-- 加载中 -->
        <div v-else-if="loading" class="flex items-center justify-center h-full text-[--sub-font-color]">
          加载中...
        </div>

        <!-- 基础设置 -->
        <div v-else-if="current && activeTab === 'basic'" class="space-y-5 max-w-lg">
          <div v-for="field in [
            { key: 'cover', label: '封面图 URL', placeholder: '/cover.webp' },
            { key: 'logo', label: 'Logo URL', placeholder: '/favicon.svg' },
            { key: 'quote_card_content', label: '引言内容', placeholder: '希望你今后的每一次笑，都是真心的。' },
            { key: 'quote_card_source', label: '引言来源', placeholder: '-- 南河「深海」' },
          ]" :key="field.key">
            <label class="block text-sm text-[--sub-font-color] mb-1">{{ field.label }}</label>
            <input
              v-model="(current as any)[field.key]"
              :placeholder="field.placeholder"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[--sub-font-color]/20 bg-[--background-color] text-[--font-color] focus:outline-none focus:border-[--primary]"
            />
          </div>
          <div>
            <label class="block text-sm text-[--sub-font-color] mb-1">每页文章数</label>
            <input
              v-model.number="current.page_size"
              type="number"
              min="1"
              max="50"
              class="w-24 px-3 py-2 text-sm rounded-lg border border-[--sub-font-color]/20 bg-[--background-color] text-[--font-color] focus:outline-none focus:border-[--primary]"
            />
          </div>
        </div>

        <!-- 关于页面 -->
        <div v-else-if="current && activeTab === 'about'" class="space-y-5 max-w-lg">
          <div>
            <label class="block text-sm text-[--sub-font-color] mb-1">头像 URL</label>
            <input
              v-model="current.avatar"
              placeholder="/cover.webp"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[--sub-font-color]/20 bg-[--background-color] text-[--font-color] focus:outline-none focus:border-[--primary]"
            />
          </div>
          <div>
            <label class="block text-sm text-[--sub-font-color] mb-1">博客简介</label>
            <textarea
              v-model="current.description"
              rows="3"
              placeholder="一个简单的博客"
              class="w-full px-3 py-2 text-sm rounded-lg border border-[--sub-font-color]/20 bg-[--background-color] text-[--font-color] focus:outline-none focus:border-[--primary] resize-none"
            />
          </div>
          <div>
            <label class="block text-sm text-[--sub-font-color] mb-2">社交链接</label>
            <SortableList
              v-model="current.social"
              :fields="socialFields"
              :empty-item="socialEmpty"
            />
          </div>
        </div>

        <!-- 收藏管理 -->
        <div v-else-if="current && activeTab === 'collections'" class="space-y-3">
          <SortableList
            v-model="current.collections"
            :fields="collectionFields"
            :empty-item="collectionEmpty"
          />
        </div>

      </div>
    </div>

    <!-- Token Modal -->
    <div
      v-if="showTokenModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      @click.self="showTokenModal = false"
    >
      <div class="bg-[--card-background-color] rounded-2xl shadow-xl p-6 w-96">
        <h2 class="text-base font-bold mb-1 text-[--font-color]">GitHub Token</h2>
        <p class="text-xs text-[--sub-font-color] mb-4">需要 <code>repo</code> 权限。Token 仅存储在本地浏览器中。</p>
        <input
          v-model="tokenInput"
          type="password"
          placeholder="ghp_xxxxxxxxxxxx"
          class="w-full px-3 py-2 text-sm rounded-lg border border-[--sub-font-color]/20 bg-[--background-color] text-[--font-color] focus:outline-none focus:border-[--primary] mb-4"
        />
        <div class="flex justify-between">
          <button
            v-if="token"
            @click="handleClearToken"
            class="text-sm text-red-500 hover:underline"
          >清除 Token</button>
          <div class="flex gap-2 ml-auto">
            <button
              @click="showTokenModal = false"
              class="px-3 py-1.5 text-sm text-[--sub-font-color] hover:text-[--font-color]"
            >取消</button>
            <button
              @click="handleSaveToken"
              class="px-4 py-1.5 text-sm bg-[--primary] text-white rounded-lg hover:opacity-90"
            >保存</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
```

- [ ] **Step 3: 验证 TypeScript 无报错**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: 无输出。

- [ ] **Step 4: 本地启动验证页面可访问**

```bash
npm run dev 2>&1 &
sleep 3
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/admin
```

Expected: `200`

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminPanel.vue
git commit -m "feat: add AdminPanel Vue component with tab navigation and forms"
```

---

## Task 6: 集成验证与收尾

**Files:**
- Modify: `src/pages/admin.astro`（如有调整）

- [ ] **Step 1: 本地完整验证流程**

启动开发服务器后访问 `http://localhost:4321/admin`，手动验证：
1. 无 Token 时显示引导提示
2. 点击齿轮图标，输入 Token，保存后自动加载配置
3. 修改任意字段后"保存并提交"按钮变为蓝色可用
4. 未修改时按钮置灰
5. social / collections 列表可添加、删除、拖拽排序
6. 暗色模式下样式正常

- [ ] **Step 2: 构建验证**

```bash
npm run build 2>&1 | tail -20
```

Expected: `dist/` 生成成功，无报错。

- [ ] **Step 3: 确认 `.env` 已在 `.gitignore` 中**

```bash
grep "^\.env$" .gitignore
```

Expected: `.env`

- [ ] **Step 4: 最终 Commit**

```bash
git add .
git commit -m "feat: complete admin panel for config.yaml management via GitHub API"
```

---

## 自检备注

- `serializeToYaml` 接收 `rawYaml`（完整原始对象）并合并编辑字段，确保 `sitename`、`author`、`primary_color`、`menu` 等不在编辑范围内的字段不会丢失
- `atob` / `btoa` 处理中文时需要 `encodeURIComponent` + `unescape` 包装，已在 `commitConfig` 中处理
- `client:only="vue"` 确保 AdminPanel 只在客户端渲染，避免 SSG 阶段访问 localStorage 报错
