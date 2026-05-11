<script setup lang="ts">
import { ref } from 'vue'
import AdminPanel from './AdminPanel.vue'

const props = defineProps<{ owner: string; repo: string }>()

const show = ref(false)

// Listen for open event from vanilla JS (Navbar button)
if (typeof window !== 'undefined') {
  window.addEventListener('open-admin-modal', () => { show.value = true })
}
</script>

<template>
  <AdminPanel :owner="props.owner" :repo="props.repo" :show="show" @close="show = false" />
</template>
