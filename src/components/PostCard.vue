<template>
    <div class="w-full h-60 bg-[--card-background-color] rounded-2xl my-5 text-[--font-color] px-10 py-6">
        <div name="title-bar" class=" font-bold text-3xl before:content-['|'] before:font-bold before:text-[--primary] before:translate-x-[-10px]">
            <a :href="url">{{ post.title }}</a>
        </div>
        <div name="extra-info">
            <div>{{ post.pubDate }}</div>
            <div>{{ post?.categories }}</div>
            <div>{{ post?.author }}</div>
        </div>
        <div name="tag-bar">
            <div>{{ post?.tags }}</div>
        </div>
        <div name="content">
            {{ post?.description }}
        </div>
        <div name="">

        </div>
    </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
    post: any
}>();

const url = props.post.url;
const post = props.post.frontmatter;
</script>

<style scoped>
</style>