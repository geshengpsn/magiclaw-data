<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Header from './components/header/Header.vue';
import IphoneView from "./components/iphone_view.vue"
import { simcanvas } from "./lib/canvas"

const canvas = ref<HTMLCanvasElement | null>(null);

onMounted(() => {
  // set up threejs
  if (canvas.value) {
    simcanvas.init(canvas.value);
  }
});
</script>

<template>
  <div class="absolute top-0 left-0 ">
    <Header />
    <IphoneView />
  </div>
  <canvas ref="canvas"></canvas>
</template>

<style scoped></style>
