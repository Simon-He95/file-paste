<template>
  <div class="container mx-auto p-6">
    <!-- 错误消息弹窗 -->
    <transition name="fade">
      <div
        v-if="errorMessage"
        class="fixed top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9.172 9.172a4 4 0 015.656 0m0 0a4 4 0 010 5.656m0 0a4 4 0 01-5.656 0m0 0a4 4 0 010-5.656"
          />
        </svg>
        <div class="flex-grow">
          <p class="text-sm font-semibold">
            文件 <span class="font-bold underline">{{ errorMessage.fileName }}</span> 上传失败
          </p>
          <p class="text-xs mt-1">{{ errorMessage.reason }}</p>
        </div>
        <button
          @click="closeError"
          class="absolute top-2 right-2 text-white hover:text-gray-200 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </transition>

    <!-- 提示区域 -->
    <div class="text-center mb-4 p-4 bg-blue-100 text-blue-800 rounded-lg shadow-md">
      📋 提示：请复制文件或图片，然后在当前页面粘贴即可上传！
    </div>

    <h1 class="text-4xl font-extrabold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
      🚀 文件粘贴上传与预览 ✨
    </h1>
    <transition-group
      name="bubble-to-card"
      tag="div"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <div
        v-for="item in uploadFiles"
        :key="item.id"
        class="relative p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-md transform transition-transform duration-300 hover:scale-105 hover:shadow-lg"
      >
        <!-- 文件预览 -->
        <div class="flex justify-center items-center h-32 bg-white rounded-lg overflow-hidden shadow-inner">
          <template v-if="item.type.startsWith('image/')">
            <img
              :src="item.previewUrl"
              alt="预览图片"
              class="object-cover w-full h-full cursor-pointer transition-opacity duration-300 hover:opacity-90"
              @click="preview(item)"
            >
          </template>
          <template v-else>
            <div
              class="flex justify-center items-center w-full h-full cursor-pointer"
              @click="preview(item)"
              v-html="getFileTypeIcon(item.type)"
            />
          </template>
        </div>

        <!-- 文件信息 -->
        <div class="mt-4 text-center">
          <div class="text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">
            {{ item.name }}
          </div>
          <div class="text-sm text-gray-600 dark:text-gray-400">
            {{ item.type }}
          </div>
        </div>

        <!-- 状态 -->
        <div
          class="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full transition-colors duration-300"
          :class="item.status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'"
        >
          {{ item.status === 'pending' ? '加载中...' : '完成' }}
        </div>

        <!-- 删除按钮 -->
        <button
          class="absolute bottom-2 right-2 px-2 py-1 text-xs font-bold rounded bg-red-500 text-white hover:bg-red-600 transition"
          @click="deleteFile(item)"
        >
          删除
        </button>
      </div>
    </transition-group>

    <!-- 打印按钮 -->
    <div class="text-center mt-6">
      <button
        class="px-6 py-3 text-lg font-bold text-white rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 hover:from-blue-900 hover:via-purple-800 hover:to-black shadow-lg transform transition-all duration-500 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canPrint"
        @click="printData"
      >
        🌞 获取数据 🌙
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { filePaste } from '../../src/index'

const uploadFiles = ref([])
const errorMessage = ref(null)

function closeError() {
  errorMessage.value = null
}

onMounted(() => {
  filePaste({
    onProgress(info) {
      info.processedFiles.forEach((file) => {
        const existingFile = uploadFiles.value.find(f => f.id === file.id)
        if (existingFile) {
          if (file.isRemoved) {
            // 移除
            uploadFiles.value = uploadFiles.value.filter(f => f.id !== file.id)
          }
          else {
            // 如果文件已存在，更新状态
            setTimeout(() => {
              if (!file.isRemoved) {
                const fileToUpdate = uploadFiles.value.find(f => f.id === file.id)
                if (fileToUpdate) {
                  Object.assign(fileToUpdate, file)
                }
              }
            }, 5000)
          }
        }
        else if (!file.isRemoved) {
          uploadFiles.value.push(file)
        }
      })
    },
    maxSize: 100000,
    onError(err) {
      errorMessage.value = {
        fileName: err.file.name,
        reason: err.reason
      }
    }
  })
})

function preview(item) {
  const previewUrl = item.previewUrl
  if (item.type.startsWith('image/')) {
    const win = window.open(previewUrl, '_blank')
    if (win) {
      win.focus()
    }
  }
  else if (item.type.startsWith('text/')) {
    const reader = new FileReader()
    reader.onload = () => {
      errorMessage.value = `文件内容:\n${reader.result}`
    }
    reader.readAsText(item.file)
  }
  else {
    const win = window.open(previewUrl, '_blank')
    if (win) {
      win.focus()
    }
    else {
      errorMessage.value = '请允许弹出窗口'
    }
  }
}

function getFileTypeIcon(type) {
  if (type.startsWith('application/pdf')) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="48" height="48" rx="8" fill="#E53E3E"></rect>
        <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">PDF</text>
      </svg>
    `
  }
  if (type.startsWith('application/msword') || type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="48" height="48" rx="8" fill="#3182CE"></rect>
        <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">Word</text>
      </svg>
    `
  }
  if (type.startsWith('application/vnd.ms-excel') || type.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="48" height="48" rx="8" fill="#38A169"></rect>
        <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">Excel</text>
      </svg>
    `
  }
  if (type.startsWith('application/zip') || type.startsWith('application/x-rar-compressed')) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="48" height="48" rx="8" fill="#DD6B20"></rect>
        <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">ZIP</text>
      </svg>
    `
  }
  // Default placeholder icon
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <rect width="48" height="48" rx="8" fill="#A0AEC0"></rect>
      <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">File</text>
    </svg>
  `
}

function deleteFile(item) {
  console.log('deleteFile', item)
  item.removeFile()
  // const index = uploadFiles.value.findIndex(file => file.id === id)
  // if (index !== -1) {
  //   uploadFiles.value.splice(index, 1)
  // }
}

const canPrint = computed(() => {
  return uploadFiles.value.length > 0 && uploadFiles.value.every(file => file.status === 'done')
})

function printData() {
  console.log('上传文件数据:', uploadFiles.value)
}
</script>

<style>
body {
  background-color: #f9fafb;
}

.bubble-to-card-enter-active {
  animation: bubbleToCard 0.5s ease-out;
}
.bubble-to-card-leave-active {
  animation: fadeOut 0.3s ease-in;
}

@keyframes bubbleToCard {
  from {
    opacity: 0;
    transform: scale(0.5);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
