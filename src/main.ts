import { createApp } from 'vue' // 导入Vue的createApp函数
import { createPinia } from 'pinia' // 导入Pinia状态管理
import App from './App.vue' // 导入根组件
import router from './router' // 导入路由配置
import ElementPlus from 'element-plus' // 导入Element Plus组件库
import 'element-plus/dist/index.css' // 导入Element Plus样式
import * as ElementPlusIconsVue from '@element-plus/icons-vue' // 导入Element Plus图标
import './style.css' // 导入全局样式

// 创建Pinia实例
const pinia = createPinia()

// 创建Vue应用实例
const app = createApp(App)

// 使用Pinia状态管理
app.use(pinia)
// 使用Vue Router路由
app.use(router)
// 使用Element Plus组件库
app.use(ElementPlus)

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 挂载应用到DOM
app.mount('#app')

