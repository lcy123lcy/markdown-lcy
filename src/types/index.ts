// 应用类型定义文件

// Markdown内容类型
export interface MarkdownContent {
  raw: string // 原始Markdown文本
  html: string // 解析后的HTML内容
}

// 编辑器配置类型
export interface EditorConfig {
  theme: 'light' | 'dark' // 编辑器主题
  fontSize: number // 字体大小
  lineNumbers: boolean // 是否显示行号
  wordWrap: boolean // 是否自动换行
}

// 应用状态类型
export interface AppState {
  content: MarkdownContent // Markdown内容
  config: EditorConfig // 编辑器配置
}

