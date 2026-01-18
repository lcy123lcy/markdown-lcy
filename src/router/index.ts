import { createRouter, createWebHistory } from 'vue-router' // 导入Vue Router
import type { RouteRecordRaw } from 'vue-router' // 路由类型定义

// 路由配置数组
const routes: RouteRecordRaw[] = [
  {
    path: '/', // 根路径
    name: 'Home', // 路由名称
    component: () => import('../views/Home.vue'), // 懒加载组件
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(), // 使用HTML5历史模式
  routes, // 路由配置
})

export default router // 导出路由实例

