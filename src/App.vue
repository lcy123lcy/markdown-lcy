<template>
  <div class="min-h-screen bg-base-100 flex flex-col">
    <template v-if="!hideLayout">
      <header class="navbar bg-base-200 shadow-lg flex-shrink-0">
        <div class="flex-1">
          <router-link to="/" class="text-2xl font-bold px-4 hover:opacity-80">
            豆豆相册
          </router-link>
        </div>
        <div v-if="authStore.isAuthenticated" class="flex items-center gap-2 px-4">
          <span class="text-sm text-base-content/80">
            {{ authStore.user?.username }}
            <span v-if="authStore.user?.role === 'ADMIN'" class="badge badge-sm badge-primary ml-1">管理员</span>
          </span>
          <button class="btn btn-ghost btn-sm" @click="handleLogout">退出</button>
        </div>
        <div v-else class="px-4">
          <router-link to="/lcylogin" class="btn btn-ghost btn-sm">登录</router-link>
          <router-link to="/lcyregister" class="btn btn-primary btn-sm">注册</router-link>
        </div>
      </header>

      <main class="flex-1 flex overflow-hidden">
        <template v-if="showSidebar">
          <DocumentSidebar />
        </template>
        <div class="flex-1 overflow-hidden">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </div>
      </main>
    </template>
    <template v-else>
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DocumentSidebar from '@/components/DocumentSidebar.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const hideLayout = computed(() => route.path === '/' || route.name === 'NotFound')

const showSidebar = computed(() => {
  if (!authStore.isAuthenticated) return false
  return route.path !== '/lcylogin' && route.path !== '/lcyregister'
})

async function handleLogout() {
  await authStore.logout()
  router.push('/lcylogin')
}

onMounted(() => {
  if (authStore.isAuthenticated && !authStore.user) {
    authStore.fetchUser()
  }
})
</script>
