<template>
    <div class="cover">
        <!-- quote card -->
        <div class=" w-96 bg-[--card-background-color] shadow-lg absolute bottom-[-70px] left-20 rounded-2xl ">
            <div class="text-center m-8">
                <!-- content -->
                <div id="content" class=" font-normal text-lg italic mt-4 mb-8 z-10 relative min-h-24 flex justify-center items-center text-[--font-quote-color]" >
                    希望你今后的每一次笑，都是真心的。
                </div>
                <!-- source -->
                <div class=" text-sm text-[--font-quote-source-color]">
                    —— 南河「深海」
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
</script>

<style scoped>
.cover{
    background-image: url('/public/cover.jpg');
    background-size: cover;
    @apply h-[568px] bg-gray-300 w-5/6 md:w-3/4 2xl:w-1/2 mt-4 md:mt-6 rounded-2xl mb-24 shadow-sm relative
} 

#content:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    z-index: -5;
    opacity: 0.05;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70" width="70" height="70"><rect x="0" y="40" width="30" height="30"></rect><path d="M 0 40 q 0 -40 30 -40 v 15 q -15 0 -15 25"></path><rect x="40" y="40" width="30" height="30"></rect><path d="M 40 40 q 0 -40 30 -40 v 15 q -15 0 -15 25"></path></svg>'),
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70" width="70" height="70" transform="rotate(180)"><rect x="0" y="40" width="30" height="30"></rect><path d="M 0 40 q 0 -40 30 -40 v 15 q -15 0 -15 25"></path><rect x="40" y="40" width="30" height="30"></rect><path d="M 40 40 q 0 -40 30 -40 v 15 q -15 0 -15 25"></path></svg>');
    background-position: 20% 20%, 80% 80%;
    background-repeat: no-repeat;
}
</style>