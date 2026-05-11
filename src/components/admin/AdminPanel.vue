<script setup lang="ts">
import { ref, onMounted } from 'vue'
import yaml from 'js-yaml'
import { useGithubApi } from './useGithubApi'
import { useConfig } from './useConfig'
import SortableList from './SortableList.vue'

const props = defineProps<{ owner: string; repo: string; show: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { token, saveToken, clearToken, fetchConfig, commitConfig } = useGithubApi(props.owner, props.repo)
const { current, sha, isDirty, loadFromYaml, serializeToYaml, markSaved } = useConfig()

const activeTab = ref<'basic' | 'about' | 'collections'>('basic')
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const successMsg = ref('')
const showTokenModal = ref(false)
const tokenInput = ref(token.value)
const rawYaml = ref<any>(null)

// 如果 owner/repo 未配置，显示配置提示
const missingEnv = !props.owner || !props.repo

async function loadConfig() {
  if (!token.value || missingEnv) return
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
    setTimeout(() => {
      successMsg.value = ''
      emit('close')
    }, 2000)
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

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      style="backdrop-filter: blur(2px);"
      @click.self="emit('close')"
    >
      <div class="w-full max-w-3xl mx-4 min-h-[560px] max-h-[85vh] flex flex-col bg-[--card-background-color] rounded-2xl shadow-xl overflow-hidden">

    <!-- 环境变量未配置提示 -->
    <div v-if="missingEnv" class="flex flex-col items-center justify-center h-96 gap-3 text-[--sub-font-color]">
      <p class="text-base">请在 <code>.env</code> 中配置 <code>PUBLIC_GITHUB_OWNER</code> 和 <code>PUBLIC_GITHUB_REPO</code></p>
      <p class="text-sm">参考 <code>.env.example</code></p>
    </div>

    <template v-else>
      <!-- 顶部栏 -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-[--sub-font-color]/20">
        <h1 class="text-xl font-bold text-[--font-color]">博客设置</h1>
        <div class="flex items-center gap-3">
          <span v-if="error" class="text-sm text-red-500 max-w-xs truncate" :title="error">{{ error }}</span>
          <button
            @click="showTokenModal = true"
            class="w-8 h-8 flex items-center justify-center text-[--sub-font-color] hover:text-[--primary] transition-colors"
            title="GitHub Token 设置"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="7.5" cy="15.5" r="5.5"/>
              <path d="M21 2l-9.6 9.6"/>
              <path d="M15.5 7.5l3 3L22 7l-3-3"/>
            </svg>
          </button>
          <button
            @click="handleSave"
            :disabled="!isDirty || saving"
            class="px-4 py-1.5 text-sm rounded-lg border transition-colors"
            :class="isDirty && !saving
              ? 'bg-[--primary] border-[--primary] text-white hover:opacity-90 cursor-pointer'
              : 'bg-transparent border-[--sub-font-color]/30 text-[--sub-font-color]/50 cursor-not-allowed'"
          >
            {{ saving ? '提交中...' : '保存并提交' }}
          </button>
          <button
            @click="emit('close')"
            class="w-8 h-8 flex items-center justify-center text-[--sub-font-color] hover:text-[--font-color] transition-colors text-xl leading-none"
            title="关闭"
          >×</button>
        </div>
      </div>

      <!-- 主体 -->
      <div class="flex flex-1 overflow-hidden relative">

        <!-- 提交成功遮罩 -->
        <div
          v-if="successMsg"
          class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[--card-background-color]/90 gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-green-500">
            <circle cx="12" cy="12" r="10"/><path d="M8 12l3 3 5-5"/>
          </svg>
          <p class="text-base font-medium text-[--font-color]">{{ successMsg }}</p>
        </div>

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
    </template>

      </div>
    </div>
  </Teleport>
</template>
