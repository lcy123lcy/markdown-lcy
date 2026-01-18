import { defineStore } from 'pinia' // 导入Pinia的defineStore函数
import type { EditorConfig } from '@/types' // 导入编辑器配置类型
import { getTextStats } from '@/utils/stats' // 导入文本统计函数

// 定义编辑器状态管理store
export const useEditorStore = defineStore('editor', {
  state: () => ({
    // Markdown原始内容
    markdownContent: '# 欢迎使用Markdown编辑器\n\n开始编写你的Markdown文档...\n' as string,
    
    // 编辑器配置
    config: {
      theme: 'light' as 'light' | 'dark', // 编辑器主题
      fontSize: 14, // 字体大小
      lineNumbers: true, // 是否显示行号
      wordWrap: true, // 是否自动换行
    } as EditorConfig,
    
    // 编辑器状态
    isScrolling: false, // 是否正在滚动（用于防止滚动循环）
  }),
  
  getters: {
    // 获取编辑器配置
    editorConfig: (state) => state.config, // 编辑器配置对象
    
    // 获取Markdown内容
    content: (state) => state.markdownContent, // Markdown原始内容
    
    // 获取文本统计信息
    textStats: (state) => {
      return getTextStats(state.markdownContent) // 计算文本统计信息
    },
  },
  
  actions: {
    // 更新Markdown内容
    setMarkdownContent(content: string) {
      this.markdownContent = content // 设置Markdown内容
    },
    
    // 清空内容
    clearContent() {
      this.markdownContent = '' // 清空Markdown内容
    },
    
    // 更新编辑器配置
    updateConfig(config: Partial<EditorConfig>) {
      this.config = { ...this.config, ...config } // 合并配置
    },
    
    // 切换主题
    toggleTheme() {
      this.config.theme = this.config.theme === 'light' ? 'dark' : 'light' // 切换主题
    },
    
    // 设置滚动状态
    setScrolling(scrolling: boolean) {
      this.isScrolling = scrolling // 设置滚动状态
    },
  },
})

