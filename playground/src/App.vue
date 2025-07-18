<template>
  <div class="container mx-auto p-6">
    <div class="flex gap-4 mb-8 justify-center">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        :class="['px-6 py-2 rounded-full font-bold transition',
          tab.path === $route.path
            ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
        @click="go(tab.path)"
      >
        {{ tab.label }}
      </button>
    </div>
    <router-view />
  </div>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const $route = useRoute()
const tabs = [
  { label: '粘贴上传 Demo', path: '/' },
  { label: '拖拽/选择上传 Demo', path: '/FilePasteDemo' },
]
function go(path: string) {
  if (path !== $route.path) router.push(path)
}
</script>
<style scoped>
button {
  outline: none;
}
</style>
