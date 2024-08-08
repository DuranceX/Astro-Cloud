<template>
    <div class="flex flex-col w-full text-slate-800">
        <div class="h-12 flex flex-row justify-between items-center bg-white rounded-b-md px-6">
            <div class="flex items-center">
                <img class="w-10 h-10" src="../assets/icons/favicon.svg">
                <span>Title</span>
            </div>
            <div class="flex items-center" @click="isShowMenu = !isShowMenu">
                <img class="w-10 h-10" src="../assets/icons/favicon.svg">
                <span>Switch</span>
            </div>
        </div>
        <div class="absolute top-12 w-full" v-if="isShowMenu">
            <div v-for="(link,index) in links" :key="index" class="h-12 bg-[--menu-item-bg] active:bg-[--menu-item-bg-active]">
                <a class="px-2 w-full h-full text-center flex items-center justify-center" :href="link.url">{{ link.name }}</a>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const links = [
    { name: '首页', url: '/' },
    { name: '关于我', url: '/about' },
    { name: '博客', url: '/blog' },
    { name: '记录', url: '/record' },
    { name: '友链', url: '/friend' },
]
const isShowMenu = ref(false)
</script>

<style scoped>
</style>