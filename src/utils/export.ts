import { parseMarkdown } from './markdown' // 导入Markdown解析函数

/**
 * 导出Markdown内容为HTML文件
 * @param markdown - Markdown原始文本
 * @param filename - 文件名（不含扩展名）
 */
export function exportToHTML(markdown: string, filename: string = 'markdown-export'): void {
  // 解析Markdown为HTML
  const htmlContent = parseMarkdown(markdown) // 获取HTML内容
  
  // 创建完整的HTML文档
  const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${filename}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
      color: #333;
    }
    h1 { font-size: 2em; font-weight: bold; margin-top: 0.67em; margin-bottom: 0.67em; }
    h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.83em; margin-bottom: 0.83em; }
    h3 { font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 1em; }
    p { margin: 1em 0; }
    code {
      background-color: #f4f4f4;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }
    pre {
      background-color: #f4f4f4;
      padding: 1em;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1em 0;
    }
    pre code { background-color: transparent; padding: 0; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    li { margin: 0.5em 0; }
    blockquote {
      border-left: 4px solid #ddd;
      padding-left: 1em;
      margin: 1em 0;
      color: #666;
    }
    a { color: #0066cc; text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 0.5rem; margin: 1em 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid #ddd;
      padding: 0.5em;
      text-align: left;
    }
    th { background-color: #f4f4f4; font-weight: bold; }
  </style>
</head>
<body>
${htmlContent}
</body>
</html>` // 完整的HTML文档模板
  
  // 创建Blob对象
  const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' }) // 创建HTML Blob
  
  // 创建下载链接
  const url = URL.createObjectURL(blob) // 创建对象URL
  const link = document.createElement('a') // 创建链接元素
  link.href = url // 设置链接地址
  link.download = `${filename}.html` // 设置下载文件名
  document.body.appendChild(link) // 添加到DOM
  link.click() // 触发下载
  document.body.removeChild(link) // 移除链接元素
  URL.revokeObjectURL(url) // 释放对象URL
}

