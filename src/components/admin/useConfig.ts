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
