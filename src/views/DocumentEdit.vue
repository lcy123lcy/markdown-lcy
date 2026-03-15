<template>
  <div class="document-edit h-full flex flex-col">
    <MarkdownEditor :document-id="documentId" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownEditor from '@/components/MarkdownEditor.vue'

const route = useRoute()
const documentId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : ''
})
</script>
