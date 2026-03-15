/**
 * 目录生成工具函数
 */

// 目录项接口
export interface TocItem {
  id: string // 标题ID（用于锚点）
  level: number // 标题级别（1-6）
  text: string // 标题文本
  children: TocItem[] // 子标题
}

/**
 * 从HTML内容中提取标题并生成目录
 * @param html - HTML内容
 * @returns 目录项数组
 */
export function generateToc(html: string): TocItem[] {
  // 创建临时DOM元素来解析HTML
  const tempDiv = document.createElement('div') // 创建临时div元素
  tempDiv.innerHTML = html // 设置HTML内容
  
  // 查找所有标题元素（h1-h6）
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6') // 选择所有标题
  const toc: TocItem[] = [] // 目录数组
  const stack: TocItem[] = [] // 用于构建层级结构的栈
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.substring(1)) // 获取标题级别（1-6）
    const text = heading.textContent || '' // 获取标题文本
    
    let id = heading.id
    if (!id) {
      let slug = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
      if (!slug) slug = `h-${index}`
      id = `heading-${slug}-${index}`
    }
    
    // 创建目录项
    const item: TocItem = {
      id, // 标题ID（使用已有的ID或新生成的ID）
      level, // 标题级别
      text, // 标题文本
      children: [], // 子标题数组
    }
    
    while (stack.length > 0 && (stack[stack.length - 1]?.level ?? 0) >= level) {
      stack.pop()
    }
    const parent = stack[stack.length - 1]
    if (!parent) {
      toc.push(item)
    } else {
      parent.children.push(item)
    }
    
    stack.push(item) // 将当前项压入栈
  })
  
  return toc // 返回目录数组
}

/**
 * 生成目录HTML
 * @param toc - 目录项数组
 * @returns 目录HTML字符串
 */
export function renderToc(toc: TocItem[]): string {
  if (toc.length === 0) return '' // 如果没有目录项则返回空字符串
  
  const renderItem = (item: TocItem): string => {
    const childrenHtml = item.children.length > 0
      ? `<ul class="toc-children ml-4">${item.children.map(renderItem).join('')}</ul>` // 渲染子标题
      : '' // 如果没有子标题则为空
    
    return `
      <li class="toc-item">
        <a href="#${item.id}" class="toc-link" data-level="${item.level}">
          ${item.text}
        </a>
        ${childrenHtml}
      </li>
    ` // 返回目录项HTML
  }
  
  return `
    <nav class="toc-nav">
      <ul class="toc-list">
        ${toc.map(renderItem).join('')}
      </ul>
    </nav>
  ` // 返回完整目录HTML
}

