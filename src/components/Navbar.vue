<template>
    <nav>
        <HamburNavBar  class="flex sm:hidden"/>
        <div class="nav text-slate-800 w-full h-12 justify-between items-center bg-white rounded-b-md px-20 hidden sm:flex">
            <div class="flex items-center">
                <img class="w-10 h-10" src="../../public/favicon.svg">
                <span>Title</span>
            </div>
            <div>
                <a class=" px-2 hover:text-[--primary]" v-for="link in links" :key="link.name" :href="link.url">{{ link.name }}</a>
            </div>
            <div class="flex items-center" @click="console.log('click')">
                <img class="w-10 h-10" src="../../public/favicon.svg">
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
    { name: '博客', url: '/blog' },
    { name: '记录', url: '/record' },
    { name: '友链', url: '/friend' },
]
</script>

<style scoped>
</style>