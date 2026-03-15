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

function highlightCode(code: string, lang: string): string {
  let normalizedLang = lang ? lang.toLowerCase() : ''
  if (normalizedLang === 'py') normalizedLang = 'python'
  else if (['vue-template', 'vue3', 'vue2'].includes(normalizedLang)) normalizedLang = 'vue'

  if (normalizedLang && hljs.getLanguage(normalizedLang)) {
    try {
      return hljs.highlight(code, { language: normalizedLang }).value
    } catch {
      // fall through
    }
  }
  try {
    return hljs.highlightAuto(code, ['python', 'vue', 'javascript', 'typescript']).value
  } catch {
    return hljs.highlight(code, { language: 'plaintext' }).value
  }
}

/**
 * 配置marked解析器选项（marked 16 使用 renderer 覆盖 code）
 */
export function configureMarked(): void {
  marked.use({
    breaks: true,
    gfm: true,
    renderer: {
      code({ text, lang }: { text: string; lang?: string }) {
        const escaped = highlightCode(text, lang || '')
        return `<pre><code class="hljs">${escaped}</code></pre>`
      },
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
    if (!heading.id) {
      const text = heading.textContent || ''
      // 生成 ID：支持中文（转 Unicode 或拼音），纯中文/空时用索引兜底
      let slug = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
      if (!slug) slug = `h-${index}`
      heading.id = `heading-${slug}-${index}`
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

