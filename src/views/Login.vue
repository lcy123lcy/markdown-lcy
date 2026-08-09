<template>
  <div class="min-h-screen bg-base-100 flex items-center justify-center p-4">
    <div class="card w-full max-w-md bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl justify-center mb-4">登录</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="form-control">
            <label class="label" for="username">
              <span class="label-text">用户名</span>
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              class="input input-bordered w-full"
              :disabled="loading"
              required
            />
          </div>
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">密码</span>
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              placeholder="请输入密码"
              class="input input-bordered w-full"
              :disabled="loading"
              required
            />
          </div>
          <p v-if="error" class="text-error text-sm">{{ error }}</p>
          <div class="form-control mt-6">
            <button
              type="submit"
              class="btn btn-primary w-full"
              :disabled="loading"
            >
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>
        <p class="text-center text-sm mt-4 text-base-content/70">
          还没有账号？
          <router-link to="/lcyregister" class="link link-primary">立即注册</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.login(username.value.trim(), password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch (e) {
    error.value = e instanceof Error ? e.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
