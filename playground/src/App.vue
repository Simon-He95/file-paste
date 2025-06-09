<template>
  <div class="container mx-auto p-6">
    <h1 class="text-2xl font-bold text-center mb-6">
      文件粘贴上传预览
    </h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              class="object-cover w-full h-full cursor-pointer transition-opacity duration-300 hover:opacity-90 animate-fade-in"
              @click="preview(item)"
            >
          </template>
          <template v-else>
            <div class="flex justify-center items-center w-full h-full cursor-pointer" v-html="getFileTypeIcon(item.type)" @click="preview(item)"></div>
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
          {{ item.status === 'pending' ? '加载中' : '完成' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { filePaste } from '../../src/index'

const uploadFiles = ref([])

onMounted(() => {
  filePaste({
    onProgress(info) {
      console.log('onProgress', info)
      info.processedFiles.forEach((file) => {
        console.log('file', file)
        const index = uploadFiles.value.findIndex(f => f.id === file.id)
        if (index !== -1) {
          // 如果文件已存在，更新状态
          setTimeout(() => {
            uploadFiles.value[index] = file
          }, 1000)
        } else {
          uploadFiles.value.push(file)
        }
      })
    },
  })
})

function preview(item) {
  const previewUrl = item.previewUrl
  console.log('previewUrl', previewUrl)
  if (item.type.startsWith('image/')) {
    const win = window.open(previewUrl, '_blank')
    if (win) {
      win.focus()
    } else {
      alert('请允许弹出窗口')
    }
  } else if (item.type.startsWith('text/')) {
    const reader = new FileReader()
    reader.onload = () => {
      alert(`文件内容:\n${reader.result}`)
    }
    reader.readAsText(item.file)
  } else {
    const win = window.open(previewUrl, '_blank')
    if (win) {
      win.focus()
    } else {
      alert('请允许弹出窗口')
    }
  }
}

function getFileTypeName(type) {
  if (type.startsWith('application/pdf')) return 'PDF 文件'
  if (type.startsWith('application/msword') || type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) return 'Word 文件'
  if (type.startsWith('application/vnd.ms-excel') || type.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) return 'Excel 文件'
  if (type.startsWith('application/zip') || type.startsWith('application/x-rar-compressed')) return '压缩文件'
  return '其他文件'
}

function getFileTypeIcon(type) {
  if (type.startsWith('application/pdf')) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="48" height="48" rx="8" fill="#E53E3E"></rect>
        <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">PDF</text>
      </svg>
    `;
  }
  if (type.startsWith('application/msword') || type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="48" height="48" rx="8" fill="#3182CE"></rect>
        <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">Word</text>
      </svg>
    `;
  }
  if (type.startsWith('application/vnd.ms-excel') || type.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="48" height="48" rx="8" fill="#38A169"></rect>
        <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">Excel</text>
      </svg>
    `;
  }
  if (type.startsWith('application/zip') || type.startsWith('application/x-rar-compressed')) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
        <rect width="48" height="48" rx="8" fill="#DD6B20"></rect>
        <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">ZIP</text>
      </svg>
    `;
  }
  // Default placeholder icon
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
      <rect width="48" height="48" rx="8" fill="#A0AEC0"></rect>
      <text x="24" y="24" font-size="12" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif">File</text>
    </svg>
  `;
}
</script>

<style>
body {
  background-color: #f9fafb;
}
</style>
