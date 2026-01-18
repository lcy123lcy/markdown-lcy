<template>
  <div class="min-h-screen bg-base-100 flex flex-col">
    <!-- 应用头部 -->
    <header class="navbar bg-base-200 shadow-lg flex-shrink-0">
      <div class="flex-1">
        <h1 class="text-2xl font-bold px-4">Markdown编辑器</h1>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="flex-1 overflow-hidden">
      <!-- Markdown编辑器组件 -->
      <MarkdownEditor />
    </main>
  </div>
</template>

<script setup lang="ts">
import MarkdownEditor from '@/components/MarkdownEditor.vue' // 导入Markdown编辑器组件
</script>

<style scoped>
/* 组件样式 */
</style>

