import { marked } from 'marked' // 导入marked库用于Markdown解析
import DOMPurify from 'dompurify' // 导入DOMPurify用于HTML净化
import hljs from 'highlight.js' // 导入highlight.js用于代码高亮
import 'highlight.js/styles/atom-one-dark.min.css' // 导入代码高亮样式（黑色背景主题）

// 注册Vue语言支持
// highlightjs-vue 使用 CommonJS 风格的导出，需要特殊处理
try {
  // 使用动态导入，并处理可能的导出格式
  import('highlightjs-vue').then((vueModule: any) => {
    // highlightjs-vue 导出一个函数，该函数接受 hljs 并注册语言
    // 或者直接导出 definer 函数
    if (vueModule && typeof vueModule === 'function') {
      // 如果直接导出函数，调用它来注册
      vueModule(hljs)
    } else if (vueModule && vueModule.default && typeof vueModule.default === 'function') {
      // 如果是 default 导出
      vueModule.default(hljs)
    } else if (vueModule && vueModule.definer && typeof vueModule.definer === 'function') {
      // 如果导出 definer 函数，直接注册
      hljs.registerLanguage('vue', vueModule.definer)
    } else if (vueModule && typeof vueModule === 'object') {
      // 尝试所有可能的属性
      const possibleExports = [vueModule.default, vueModule.definer, vueModule.hljsDefineVue, vueModule]
      for (const exp of possibleExports) {
        if (exp && typeof exp === 'function') {
          try {
            hljs.registerLanguage('vue', exp)
            break
          } catch (e) {
            // 如果注册失败，尝试调用函数
            try {
              exp(hljs)
              break
            } catch (e2) {
              // 继续尝试下一个
            }
          }
        }
      }
    }
  }).catch((err) => {
    console.warn('无法加载 Vue 语言支持，Vue 代码高亮可能不可用:', err)
  })
} catch (error) {
  console.warn('导入 Vue 语言支持时出错:', error)
}

/**
 * 配置marked解析器选项
 */
export function configureMarked(): void {
  marked.setOptions({
    breaks: true, // 支持GitHub风格的换行
    gfm: true, // 启用GitHub风格的Markdown
    highlight: (code: string, lang: string) => {
      // 代码高亮处理函数
      // 标准化语言标识（python, py 都识别为 python；vue, vue-template 都识别为 vue）
      let normalizedLang = lang ? lang.toLowerCase() : ''
      if (normalizedLang === 'py') {
        normalizedLang = 'python'
      } else if (normalizedLang === 'vue-template' || normalizedLang === 'vue3' || normalizedLang === 'vue2') {
        normalizedLang = 'vue'
      }
      
      if (normalizedLang && hljs.getLanguage(normalizedLang)) {
        try {
          // 如果语言支持，则进行高亮
          return hljs.highlight(code, { language: normalizedLang }).value // 返回高亮后的HTML
        } catch (err) {
          console.warn('代码高亮失败:', err) // 输出警告信息
        }
      }
      // 如果不支持或出错，则自动检测语言并高亮（优先 Python 和 Vue）
      try {
        return hljs.highlightAuto(code, ['python', 'vue', 'javascript', 'typescript']).value // 自动检测语言并高亮
      } catch (err) {
        // 如果自动检测也失败，返回转义的代码
        return hljs.highlight(code, { language: 'plaintext' }).value
      }
    },
  })
}

/**
 * 为HTML中的标题添加ID（用于目录锚点）
 * @param html - HTML内容
 * @returns 添加了ID的HTML字符串
 */
function addHeadingIds(html: string): string {
  // 创建临时DOM元素来解析HTML
  const tempDiv = document.createElement('div') // 创建临时div元素
  tempDiv.innerHTML = html // 设置HTML内容
  
  // 查找所有标题元素并添加ID
  const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6') // 选择所有标题
  headings.forEach((heading, index) => {
    // 如果标题没有ID，则生成一个
    if (!heading.id) {
      const text = heading.textContent || '' // 获取标题文本
      // 生成基于文本的ID（移除特殊字符，转换为小写，用连字符连接）
      const id = `heading-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${index}`
      heading.id = id || `heading-${index}` // 如果ID为空则使用索引
    }
  })
  
  return tempDiv.innerHTML // 返回修改后的HTML
}

/**
 * 将Markdown文本转换为HTML
 * @param markdown - Markdown原始文本
 * @returns 净化后的HTML字符串
 */
export function parseMarkdown(markdown: string): string {
  // 使用marked将Markdown转换为HTML
  const html = marked.parse(markdown) as string
  
  // 使用DOMPurify净化HTML，但允许代码高亮相关的class和属性
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span',
    ], // 允许的HTML标签
    ALLOWED_ATTR: [
      'href', 'src', 'alt', 'title', 'class', 'id', 'data-level',
    ], // 允许的HTML属性
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i, // 允许的URI格式
  })
  
  // 为标题添加ID（用于目录锚点）
  return addHeadingIds(sanitized) // 返回添加了ID的HTML
}

// 初始化marked配置
configureMarked()

