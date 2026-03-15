import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()], // Vue插件配置
  resolve: {
    alias: {
      // 配置路径别名，方便导入
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    // 开发服务器配置
    port: 3000, // 开发服务器端口
    open: true, // 自动打开浏览器
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

