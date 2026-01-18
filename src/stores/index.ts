import { defineStore } from 'pinia' // 导入Pinia的defineStore函数

// 定义应用状态管理store
export const useAppStore = defineStore('app', {
  state: () => ({
    // 应用状态定义
    theme: 'light' as string, // 主题模式
  }),
  
  getters: {
    // 计算属性
    isDark: (state) => state.theme === 'dark', // 是否为暗色主题
  },
  
  actions: {
    // 操作方法
    setTheme(theme: string) {
      this.theme = theme // 设置主题
    },
  },
})

