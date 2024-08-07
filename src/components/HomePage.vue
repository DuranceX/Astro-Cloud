<template>
    <div class="flex flex-col py-60 w-5/6 md:w-3/4 2xl:w-1/2">
        <PostCard v-for="(post,index) in props.posts" :key="index" :post="post"/>
    </div>
</template>

<script lang="ts" setup>
import PostCard from './PostCard.vue'
const props = defineProps<{
    posts: any[]
}>();
</script>

<style scoped>
</style>