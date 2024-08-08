<template>
    <nav class=" w-full fixed z-10">
        <HamburNavBar  class="flex sm:hidden"/>
        <div class="justify-between items-center sm:flex hidden rounded-b-md h-16 px-20 bg-[--nav-background-color] text-[--font-color] shadow-md">
            <div class="flex items-center">
                <img class="w-10 h-10" src="/public/favicon.svg">
                <span>Title</span>
            </div>
            <div>
                <a class=" px-2 hover:text-[--primary]" v-for="link in links" :key="link.name" :href="link.url">{{ link.name }}</a>
            </div>
            <div class="flex items-center" @click="console.log('click')">
                <img class="w-10 h-10" src="/public/favicon.svg">
                <span>Switch</span>
            </div>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import HamburNavBar from './HamburNavBar.vue'
const links = [
    { name: '首页', url: '/' },
    { name: '关于我', url: '/about' },
    { name: '记录', url: '/record' },
    { name: '友链', url: '/friend' },
    { name: '标签', url: '/tags'}
]
</script>

<style scoped>
</style>