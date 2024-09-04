<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { iphone_view } from "../lib/iphone_view"

const rgb = ref<HTMLCanvasElement | null>(null);
onMounted(() => {
    if (rgb.value) {
        iphone_view.init(rgb.value)
    }
});
</script>

<template>
    <div class=" relative">
        <div class=" absolute">
            <canvas ref="rgb" class="m-4 p-2 rounded-xl">

            </canvas>
        </div>
    </div>
</template>

<style scoped></style>