<template>
    <div :class="tagClass" class=" px-4 py-1 rounded-md mr-2 transition-colors cursor-pointer break-keep mb-2">
        <a :href="'/tags/'+tag">{{tag}}</a>
    </div>
</template>

<script lang="ts" setup>
import { getTags } from '@/constants/tagColor';
const props = defineProps<{
    tag: string
}>();

const tagClass = getTags()[props.tag];
</script>

<style scoped>
</style>