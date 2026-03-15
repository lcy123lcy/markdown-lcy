<template>
  <aside class="document-sidebar w-64 bg-base-200 border-r border-base-300 flex flex-col flex-shrink-0">
    <div class="p-4 border-b border-base-300">
      <button
        class="btn btn-primary btn-sm w-full"
        @click="handleCreate"
        :disabled="creating"
      >
        {{ creating ? '创建中...' : '+ 新建文档' }}
      </button>
    </div>
    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="loading" class="text-base-content/60 text-sm p-2">加载中...</div>
      <div v-else-if="documents.length === 0" class="text-base-content/60 text-sm p-2">
        暂无文档
      </div>
      <ul v-else class="menu menu-sm">
        <li v-for="doc in documents" :key="doc.id">
          <a
            :class="{ active: currentId === doc.id }"
            @click="selectDoc(doc.id)"
            @contextmenu.prevent="showContextMenu($event, doc)"
            class="flex items-center"
          >
            <span class="truncate flex-1 min-w-0" :title="doc.title">{{ doc.title || '未命名' }}</span>
            <button
              class="btn btn-ghost btn-xs flex-shrink-0 ml-auto"
              @click.stop="handleDelete(doc)"
              title="删除"
            >
              🗑️
            </button>
          </a>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchDocuments,
  createDocument,
  deleteDocument,
  updateDocument,
  type Document,
} from '@/api/documents'

const router = useRouter()
const route = useRoute()

const documents = ref<Document[]>([])
const loading = ref(false)
const creating = ref(false)

const currentId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : null
})

async function loadDocuments() {
  loading.value = true
  try {
    documents.value = await fetchDocuments()
  } catch (e) {
    ElMessage.error('加载文档列表失败')
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  creating.value = true
  try {
    const doc = await createDocument()
    await loadDocuments()
    router.push(`/doc/${doc.id}`)
    ElMessage.success('文档已创建')
  } catch (e) {
    ElMessage.error('创建失败')
    console.error(e)
  } finally {
    creating.value = false
  }
}

function selectDoc(id: string) {
  router.push(`/doc/${id}`)
}

async function handleDelete(doc: Document) {
  try {
    await ElMessageBox.confirm(`确定删除「${doc.title || '未命名'}」？`, '删除确认')
  } catch {
    return
  }
  try {
    await deleteDocument(doc.id)
    await loadDocuments()
    if (currentId.value === doc.id) {
      router.push('/')
    }
    ElMessage.success('已删除')
  } catch (e) {
    ElMessage.error('删除失败')
    console.error(e)
  }
}

function showContextMenu(e: MouseEvent, doc: Document) {
  const menu = document.createElement('div')
  menu.className = 'fixed z-50 bg-base-200 border border-base-300 rounded-lg shadow-lg py-1 min-w-[120px]'
  menu.style.left = `${e.clientX}px`
  menu.style.top = `${e.clientY}px`
  const renameBtn = document.createElement('button')
  renameBtn.className = 'w-full px-4 py-2 text-left text-sm hover:bg-base-300'
  renameBtn.textContent = '重命名'
  renameBtn.onclick = (ev) => {
    ev.stopPropagation()
    closeMenu()
    handleRename(doc)
  }
  menu.appendChild(renameBtn)
  document.body.appendChild(menu)
  const closeMenu = () => {
    document.body.removeChild(menu)
    document.removeEventListener('click', closeMenu)
  }
  requestAnimationFrame(() => document.addEventListener('click', closeMenu))
}

async function handleRename(doc: Document) {
  try {
    const { value } = await ElMessageBox.prompt('输入新文件名', '重命名', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: doc.title || '未命名',
      inputValidator: (v) => (v?.trim() ? true : '文件名不能为空'),
    })
    const newTitle = (value ?? '').trim()
    if (!newTitle) return
    await updateDocument(doc.id, { title: newTitle })
    await loadDocuments()
    ElMessage.success('已重命名')
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('重命名失败')
      console.error(e)
    }
  }
}

watch(() => route.path, loadDocuments, { immediate: false })
onMounted(loadDocuments)

defineExpose({ refresh: loadDocuments })
</script>
