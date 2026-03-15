<template>
  <div class="min-h-screen bg-base-100 flex items-center justify-center p-4">
    <div class="card w-full max-w-md bg-base-200 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl justify-center mb-4">注册</h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="form-control">
            <label class="label" for="username">
              <span class="label-text">用户名</span>
            </label>
            <input
              id="username"
              v-model="username"
              type="text"
              placeholder="请输入用户名（3-20 字符）"
              class="input input-bordered w-full"
              :disabled="loading"
              required
              minlength="3"
              maxlength="20"
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
              placeholder="请输入密码（至少 6 位）"
              class="input input-bordered w-full"
              :disabled="loading"
              required
              minlength="6"
            />
          </div>
          <div class="form-control">
            <label class="label" for="confirmPassword">
              <span class="label-text">确认密码</span>
            </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="请再次输入密码"
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
              {{ loading ? '注册中...' : '注册' }}
            </button>
          </div>
        </form>
        <p class="text-center text-sm mt-4 text-base-content/70">
          已有账号？
          <router-link to="/login" class="link link-primary">立即登录</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

async function handleSubmit() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  if (password.value.length < 6) {
    error.value = '密码至少 6 位'
    return
  }
  if (username.value.trim().length < 3) {
    error.value = '用户名至少 3 个字符'
    return
  }
  loading.value = true
  try {
    await authStore.register(username.value.trim(), password.value)
    router.push('/')
  } catch (e) {
    error.value = e instanceof Error ? e.message : '注册失败'
  } finally {
    loading.value = false
  }
}
</script>
