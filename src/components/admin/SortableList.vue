<template>
  <div>
    <div ref="listEl" class="space-y-2">
      <div
        v-for="(item, index) in modelValue"
        :key="index"
        class="flex items-start gap-2 p-3 bg-[--card-background-color] border border-[--sub-font-color]/20 rounded-lg"
      >
        <div class="drag-handle cursor-grab mt-1 text-[--sub-font-color] select-none">⠿</div>
        <div class="flex-1 grid grid-cols-2 gap-2">
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
