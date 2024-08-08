<template>
    <div class="w-full bg-[--card-background-color] rounded-2xl my-5 text-[--font-color] shadow-sm hover:translate-y-[-12px] transition-transform duration-300 relative">
        <div class="w-full flex justify-center">
            <div name="image" v-if="post.image" class=" max-h-64 flex justify-center items-center mt-4 mx-4 rounded-2xl overflow-hidden ">
            <img :src="post.image.url" :alt="post.image?.alt" class=" object-cover"/>
        </div>
        </div>
        <div class="px-10 pb-8 pt-6">
            <div name="title-bar" class="relative font-bold text-3xl ">
                <div class=" w-1 h-5 rounded-sm bg-[--primary] absolute top-2 left-[-10px]"></div>
                <a class="line-clamp-2 lg:line-clamp-1 text-ellipsis hover:text-[--primary] transition-colors duration-300" :href="'/posts/'+url">{{ post.title }}</a>
            </div>
            <div name="extra-info" class=" flex text-[--sub-font-color] py-1">
                <div>{{ post.date.toISOString().slice(0,10) }}</div>
            </div>
            <div name="content" class=" my-4 line-clamp-3 text-ellipsis break-words">
                {{ description }}
            </div>
            <div name="tag-bar" class="flex flex-wrap">
                <Tag v-for="(tag, index) in post.tags" :key="tag" :tag="tag" :index="index" />
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import Tag from './Tag.vue';

const props = defineProps<{
    post: any
}>();
const url = props.post.slug;
const post = props.post.data;
const description = post.description ? post.description : props.post.body.replaceAll(/[#`<>\[\]]/g,'').slice(0, 250);
</script>

<style scoped>
</style>