<template>
    <svg :class="'svg-icon ' + classes" :style="{
        width: `${width}px`,
        height: `${height}px`,
        color: color
    }" @click="$emit('click')">
        <use :xlink:href="`#icon-${name}`" />
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'VIcon',
    props: {
        name: {
            type: String,
            required: true
        },
        width: {
            type: Number,
            default: 60
        },
        height: {
            type: Number,
            default: 60
        },
        color: {
            type: String,
            default: 'deepgrey'
        },
        classes: {
            type: String,
            default: ''
        }
    },
    setup(props) {
        return {
            props
        }
    }
})
</script>

<style scoped>
.svg-icon {
    font-weight: 500;
    fill: currentColor;
    stroke: currentColor;
}
</style>
