<template>
  <div class="markdown-editor h-full flex flex-col">
    <!-- 工具栏 -->
    <Toolbar :editor-view="null" :wysiwyg-adapter="toolbarAdapter" :document-id="props.documentId" />
    
    <!-- 主编辑区容器 -->
    <div class="editor-container flex-1 flex overflow-hidden">
      <!-- 所见即所得编辑区 -->
      <div class="wysiwyg-panel flex-1 flex flex-col">
        <div class="panel-header bg-base-200 px-4 py-2 border-b border-base-300 flex items-center justify-between">
          <h3 class="text-sm font-semibold">编辑区</h3>
          <!-- 目录按钮 -->
          <el-button
            v-if="tocItems.length > 0"
            @click="showToc = !showToc"
            size="small"
            text
            title="显示/隐藏目录"
          >
            📑 目录
          </el-button>
        </div>
        <div class="wysiwyg-content-wrapper flex-1 flex overflow-hidden">
          <!-- 所见即所得编辑内容 -->
          <div 
            ref="wysiwygContainer" 
            contenteditable
            class="wysiwyg-wrapper flex-1 overflow-y-auto p-4"
            @input="handleContentChange"
            @paste="handlePaste"
            @blur="handleBlur"
            @keydown="handleKeyDown"
            @click="handleClick"
          ></div>
          <!-- 目录侧边栏 -->
          <aside
            v-if="showToc && tocItems.length > 0"
            class="toc-sidebar w-64 border-l border-base-300 overflow-y-auto p-4 bg-base-100 flex-shrink-0"
          >
            <div v-html="tocHtml" @click="handleTocClick"></div>
          </aside>
        </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue' // 导入Vue组合式API
import { ElMessage } from 'element-plus' // 导入Element Plus消息组件
import TurndownService from 'turndown' // 导入Turndown用于HTML转Markdown
import hljs from 'highlight.js' // 导入 highlight.js 用于代码高亮
import { useEditorStore } from '@/stores/editor' // 导入编辑器store
import { parseMarkdown } from '@/utils/markdown' // 导入Markdown解析函数
import { fileToDataURL, getImageFromClipboard, validateImageSize } from '@/utils/image' // 导入图片处理工具函数
import { generateToc, renderToc } from '@/utils/toc' // 导入目录生成函数
import Toolbar from './Toolbar.vue' // 导入工具栏组件
import { fetchDocument, updateDocument } from '@/api/documents'

const props = withDefaults(
  defineProps<{ documentId?: string }>(),
  { documentId: '' }
)

// 注册Vue语言支持（使用动态导入避免错误）
import('highlightjs-vue').then((vueModule: any) => {
  // highlightjs-vue 可能导出函数或对象，需要处理多种情况
  if (vueModule && typeof vueModule === 'function') {
    vueModule(hljs)
  } else if (vueModule && vueModule.default && typeof vueModule.default === 'function') {
    vueModule.default(hljs)
  } else if (vueModule && vueModule.definer && typeof vueModule.definer === 'function') {
    hljs.registerLanguage('vue', vueModule.definer)
  }
}).catch((err) => {
  console.warn('无法加载 Vue 语言支持:', err)
})

// 获取编辑器store实例
const editorStore = useEditorStore()

// 编辑器容器引用
const wysiwygContainer = ref<HTMLElement | null>(null)

// 是否显示目录
const showToc = ref(true) // 默认显示目录

// 是否正在更新内容（防止循环更新）
let isUpdatingContent = false
// 是否正在用户编辑（防止外部更新覆盖用户输入）
let isUserEditing = false

// 初始化 Turndown 服务
const turndownService = new TurndownService({
  headingStyle: 'atx', // 使用 # 风格的标题
  codeBlockStyle: 'fenced', // 使用 ``` 风格的代码块
  bulletListMarker: '-', // 使用 - 作为列表标记
})

// 计算预览HTML内容（仅用于初始化）
const getPreviewHtml = () => {
  return parseMarkdown(editorStore.markdownContent) // 解析Markdown为HTML
}

// 目录项
const tocItems = ref<ReturnType<typeof generateToc>>([]) // 目录项数组

// 目录HTML
const tocHtml = computed(() => {
  return renderToc(tocItems.value) // 渲染目录HTML
})

// 更新目录
const updateToc = (html: string) => {
  tocItems.value = generateToc(html) // 生成目录
}

// 确保所有标题都有ID（用于目录锚点）并保持加粗
const ensureHeadingIds = () => {
  if (!wysiwygContainer.value) return
  
  const headings = wysiwygContainer.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  headings.forEach((heading, index) => {
    // 确保标题加粗
    if (heading instanceof HTMLElement) {
      heading.style.fontWeight = 'bold'
    }
    
    if (!heading.id) {
      const text = heading.textContent || ''
      let slug = text.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-').replace(/^-|-$/g, '')
      if (!slug) slug = `h-${index}`
      heading.id = `heading-${slug}-${index}`
    }
  })
}

// 为代码块添加工具栏（复制和删除按钮）
const addCodeBlockToolbar = (preElement: HTMLElement) => {
  // 检查是否已经添加了工具栏
  if (preElement.querySelector('.code-block-toolbar')) {
    return
  }
  
  // 确保代码块内的 code 元素是可编辑的
  const codeElement = preElement.querySelector('code')
  if (codeElement && codeElement instanceof HTMLElement) {
    codeElement.contentEditable = 'true'
    codeElement.setAttribute('spellcheck', 'false')
  }
  
  const toolbar = document.createElement('div')
  toolbar.className = 'code-block-toolbar'
  
  // 复制按钮
  const copyBtn = document.createElement('button')
  copyBtn.className = 'code-block-btn code-block-copy'
  copyBtn.innerHTML = '📋'
  copyBtn.title = '复制代码'
  copyBtn.onclick = async (e) => {
    e.stopPropagation()
    const code = preElement.querySelector('code')
    if (code) {
      try {
        const codeText = code.textContent || ''
        await navigator.clipboard.writeText(codeText)
        ElMessage.success('代码已复制到剪贴板')
        // 临时改变按钮文本
        const originalHTML = copyBtn.innerHTML
        copyBtn.innerHTML = '✓'
        setTimeout(() => {
          copyBtn.innerHTML = originalHTML
        }, 2000)
      } catch (error) {
        console.error('复制失败:', error)
        ElMessage.error('复制失败，请重试')
      }
    }
  }
  
  // 删除按钮
  const deleteBtn = document.createElement('button')
  deleteBtn.className = 'code-block-btn code-block-delete'
  deleteBtn.innerHTML = '🗑️'
  deleteBtn.title = '删除代码块'
  deleteBtn.onclick = (e) => {
    e.stopPropagation()
    if (preElement && preElement.parentNode) {
      preElement.parentNode.removeChild(preElement)
      // 触发内容变化事件
      if (wysiwygContainer.value) {
        handleContentChange({ target: wysiwygContainer.value } as any)
      }
      ElMessage.success('代码块已删除')
    }
  }
  
  toolbar.appendChild(copyBtn)
  toolbar.appendChild(deleteBtn)
  preElement.appendChild(toolbar)
}

// 重新高亮所有代码块
const highlightCodeBlocks = () => {
  if (!wysiwygContainer.value) return
  
  const codeBlocks = wysiwygContainer.value.querySelectorAll('pre')
  codeBlocks.forEach((pre) => {
    if (pre instanceof HTMLElement) {
      const code = pre.querySelector('code')
      if (code instanceof HTMLElement) {
        // 确保代码块可编辑
        code.contentEditable = 'true'
        code.setAttribute('spellcheck', 'false')
        
        // 检查是否已经有语言标识
        const hasLanguage = code.className.includes('language-')
        
        // 如果代码块有内容，重新高亮
        if (code.textContent && code.textContent.trim()) {
          try {
            let language: string | null = null
            
            // 如果已有语言标识，从 className 中提取
            if (hasLanguage) {
              const langMatch = code.className.match(/language-(\w+)/)
              if (langMatch && langMatch[1]) {
                language = langMatch[1]
              }
            }
            
            // 标准化语言标识
            if (language) {
              // vue-template, vue3, vue2 都识别为 vue
              if (language === 'vue-template' || language === 'vue3' || language === 'vue2') {
                language = 'vue'
              }
              // py 识别为 python
              if (language === 'py') {
                language = 'python'
              }
              
              // 如果 highlight.js 支持该语言，则进行高亮
              if (hljs.getLanguage(language)) {
                const highlighted = hljs.highlight(code.textContent, { language })
                code.innerHTML = highlighted.value
                code.className = `language-${language} hljs`
              } else {
                // 如果不支持，尝试自动检测（优先 Python 和 Vue）
                const highlighted = hljs.highlightAuto(code.textContent, ['python', 'vue', 'javascript', 'typescript'])
                const detectedLang: string = highlighted.language || 'python'
                code.innerHTML = highlighted.value
                code.className = `hljs language-${detectedLang}`
              }
            } else {
              // 如果没有语言标识，自动检测（优先 Python 和 Vue）
              const highlighted = hljs.highlightAuto(code.textContent, ['python', 'vue', 'javascript', 'typescript'])
              const detectedLang: string = highlighted.language || 'python'
              code.innerHTML = highlighted.value
              code.className = `hljs language-${detectedLang}`
            }
          } catch (error) {
            console.warn('代码高亮失败:', error)
            // 高亮失败时，默认使用 Python
            if (!hasLanguage) {
              code.className = 'language-python hljs'
            }
          }
        } else {
          // 如果没有内容且没有语言标识，默认使用 Python
          if (!hasLanguage) {
            code.className = 'language-python hljs'
          }
        }
      }
      
      // 为代码块添加工具栏
      addCodeBlockToolbar(pre)
    }
  })
}

// 处理内容变化（将HTML转换为Markdown）
const handleContentChange = (event: Event) => {
  if (isUpdatingContent) return // 如果正在更新内容则返回
  
  userHasEdited.value = true
  isUserEditing = true // 标记用户正在编辑
  
  const target = event.target as HTMLElement
  if (!target || !wysiwygContainer.value) return
  
  // 确保所有标题都有ID
  ensureHeadingIds()
  
  // 获取编辑后的HTML内容
  const html = target.innerHTML
  
  // 将HTML转换为Markdown
  try {
    const markdown = turndownService.turndown(html)
    
    // 更新store中的内容
    isUpdatingContent = true
    editorStore.setMarkdownContent(markdown)
    
    // 重新生成目录
    nextTick(() => {
      // 再次确保标题ID（因为HTML可能被修改）
      ensureHeadingIds()
      // 重新高亮所有代码块
      highlightCodeBlocks()
      updateToc(wysiwygContainer.value?.innerHTML || html)
      isUpdatingContent = false
    })
  } catch (error) {
    console.error('转换HTML到Markdown失败:', error)
    isUpdatingContent = false
  }
}

// 处理失去焦点事件
const handleBlur = () => {
  // 延迟重置，允许其他操作完成
  setTimeout(() => {
    isUserEditing = false
  }, 100)
}

// 处理点击事件（确保代码块后可以编辑）
const handleClick = (event: MouseEvent) => {
  if (!wysiwygContainer.value) return
  
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  const target = event.target as HTMLElement
  
  // 如果点击的是代码块（pre）或代码块内的元素
  const codeBlock = target.closest('pre')
  if (codeBlock) {
    const codeElement = codeBlock.querySelector('code')
    if (codeElement) {
      // 检查点击位置是否在代码块边缘
      const rect = codeBlock.getBoundingClientRect()
      const clickY = event.clientY
      
      // 如果点击在代码块下方，在代码块后插入段落
      if (clickY > rect.bottom + 5) {
        event.preventDefault()
        
        // 检查代码块后面是否已有段落
        let nextSibling = codeBlock.nextSibling
        while (nextSibling && nextSibling.nodeType === Node.TEXT_NODE && !nextSibling.textContent?.trim()) {
          nextSibling = nextSibling.nextSibling
        }
        
        if (!nextSibling || (nextSibling.nodeType === Node.ELEMENT_NODE && (nextSibling as HTMLElement).tagName !== 'P')) {
          // 在代码块后插入段落
          const p = document.createElement('p')
          p.innerHTML = '<br>'
          
          if (codeBlock.nextSibling) {
            codeBlock.parentNode?.insertBefore(p, codeBlock.nextSibling)
          } else {
            codeBlock.parentNode?.appendChild(p)
          }
          
          // 移动光标到新段落
          setTimeout(() => {
            const newRange = document.createRange()
            newRange.setStart(p, 0)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
          }, 10)
        } else {
          // 如果已有段落，移动光标到段落
          if (nextSibling.nodeType === Node.ELEMENT_NODE) {
            const p = nextSibling as HTMLElement
            const newRange = document.createRange()
            newRange.setStart(p, 0)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
          }
        }
      }
    }
  }
}

// 处理键盘事件（Enter、Tab 键）
const handleKeyDown = (event: KeyboardEvent) => {
  if (!wysiwygContainer.value) return
  
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  const range = selection.getRangeAt(0)
  
  // 处理在代码块后面按 Enter 键的情况
  if (event.key === 'Enter') {
    let currentNode = range.startContainer
    let currentElement: HTMLElement | null = null
    
    // 获取当前元素
    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentElement = currentNode.parentElement
    } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
      currentElement = currentNode as HTMLElement
    }
    
    // 检查是否在代码块（pre）内
    const codeBlock = currentElement?.closest('pre')
    if (codeBlock) {
      const codeElement = codeBlock.querySelector('code')
      if (codeElement) {
        // 检查光标是否在代码块的末尾
        const isAtEnd = range.startOffset >= (codeElement.textContent?.length || 0)
        
        // 如果光标在代码块末尾，在代码块后插入新段落
        if (isAtEnd && codeElement === currentElement) {
          event.preventDefault()
          
          // 在代码块后插入一个段落
          const p = document.createElement('p')
          p.innerHTML = '<br>'
          
          // 插入到代码块后面
          if (codeBlock.nextSibling) {
            codeBlock.parentNode?.insertBefore(p, codeBlock.nextSibling)
          } else {
            codeBlock.parentNode?.appendChild(p)
          }
          
          // 移动光标到新段落
          const newRange = document.createRange()
          newRange.setStart(p, 0)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
          
          // 触发内容变化
          handleContentChange({ target: wysiwygContainer.value } as any)
          return
        }
      }
    }
    
    // 检查光标是否紧跟在代码块后面
    let nodeBefore: Node | null = range.startContainer
    if (nodeBefore.nodeType === Node.TEXT_NODE) {
      nodeBefore = nodeBefore.parentNode
    }
    
    // 检查前一个兄弟节点是否是代码块
    if (nodeBefore && nodeBefore.previousSibling) {
      const prevSibling = nodeBefore.previousSibling
      if (prevSibling.nodeType === Node.ELEMENT_NODE && (prevSibling as HTMLElement).tagName === 'PRE') {
        // 光标在代码块后面的元素中，允许正常编辑
        return
      }
    }
  }
  
  // 处理 Tab 键（缩进）
  if (event.key === 'Tab' && !event.shiftKey) {
    event.preventDefault()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    let currentElement = range.commonAncestorContainer as HTMLElement
    
    if (currentElement.nodeType !== Node.ELEMENT_NODE) {
      currentElement = currentElement.parentElement as HTMLElement
    }
    
    // 检查是否在列表项中
    let listItem: HTMLElement | null = null
    while (currentElement && currentElement !== wysiwygContainer.value) {
      if (currentElement.tagName === 'LI') {
        listItem = currentElement
        break
      }
      currentElement = currentElement.parentElement as HTMLElement
    }
    
    if (listItem) {
      // 在列表项中：创建嵌套列表
      const list = listItem.closest('ul, ol')
      if (list) {
        // 创建嵌套列表
        const nestedList = document.createElement(list.tagName.toLowerCase() as 'ul' | 'ol')
        const parentList = listItem.parentElement
        if (parentList) {
          // 将当前列表项的内容移到嵌套列表中
          const newLi = document.createElement('li')
          newLi.innerHTML = listItem.innerHTML
          nestedList.appendChild(newLi)
          
          // 清空当前列表项并添加嵌套列表
          listItem.innerHTML = ''
          listItem.appendChild(nestedList)
          
          // 移动光标到嵌套列表项
          const newRange = document.createRange()
          newRange.selectNodeContents(newLi)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      } else {
        // 不在列表中：插入缩进（使用 &emsp; 或 margin）
        document.execCommand('insertText', false, '\t')
      }
    } else {
      // 不在列表项中：插入制表符
      document.execCommand('insertText', false, '\t')
    }
    return
  }
  
  // 处理 Shift+Tab 键（缩回）
  if (event.key === 'Tab' && event.shiftKey) {
    event.preventDefault()
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    let currentElement = range.commonAncestorContainer as HTMLElement
    
    if (currentElement.nodeType !== Node.ELEMENT_NODE) {
      currentElement = currentElement.parentElement as HTMLElement
    }
    
    // 检查是否在嵌套列表项中
    let listItem: HTMLElement | null = null
    while (currentElement && currentElement !== wysiwygContainer.value) {
      if (currentElement.tagName === 'LI') {
        listItem = currentElement
        break
      }
      currentElement = currentElement.parentElement as HTMLElement
    }
    
    if (listItem) {
      const nestedList = listItem.closest('ul, ol')
      if (nestedList && nestedList.parentElement?.tagName === 'LI') {
        // 在嵌套列表中：提升到父级
        const parentLi = nestedList.parentElement as HTMLElement
        const grandParentList = parentLi.closest('ul, ol')
        
        if (grandParentList) {
          // 将当前列表项移到父级列表
          const newLi = document.createElement('li')
          newLi.innerHTML = listItem.innerHTML
          
          // 插入到父级列表项之后
          if (parentLi.nextSibling) {
            grandParentList.insertBefore(newLi, parentLi.nextSibling)
          } else {
            grandParentList.appendChild(newLi)
          }
          
          // 如果嵌套列表为空，移除父级列表项
          if (nestedList.children.length === 1) {
            parentLi.remove()
          } else {
            listItem.remove()
          }
          
          // 移动光标到新列表项
          const newRange = document.createRange()
          newRange.selectNodeContents(newLi)
          newRange.collapse(true)
          selection.removeAllRanges()
          selection.addRange(newRange)
        }
      }
    }
    return
  }
  
  // 处理 Enter 键（列表自动添加前缀/序号）
  if (event.key === 'Enter') {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return
    
    const range = selection.getRangeAt(0)
    let currentElement = range.commonAncestorContainer as HTMLElement
    
    if (currentElement.nodeType !== Node.ELEMENT_NODE) {
      currentElement = currentElement.parentElement as HTMLElement
    }
    
    // 查找当前所在的元素类型
    let listItem: HTMLElement | null = null
    let listElement: HTMLElement | null = null
    let isOrderedList = false
    
    // 检查是否在列表项中
    while (currentElement && currentElement !== wysiwygContainer.value) {
      if (currentElement.tagName === 'LI') {
        listItem = currentElement
        listElement = currentElement.closest('ul, ol') as HTMLElement
        if (listElement) {
          isOrderedList = listElement.tagName === 'OL'
        }
        break
      }
      currentElement = currentElement.parentElement as HTMLElement
    }
    
    // 如果在列表项中，等待默认行为完成后添加前缀/序号
    if (listItem && listElement) {
      // 不阻止默认行为，让浏览器创建新列表项
      setTimeout(() => {
        if (!wysiwygContainer.value || !listElement) return
        
        const allItems = Array.from(listElement.querySelectorAll('li')) as HTMLElement[]
        // 找到新创建的列表项（通常是最后一个）
        const newLi = allItems[allItems.length - 1]
        
        if (isOrderedList) {
          // 有序列表：为所有项添加序号（不加粗）
          allItems.forEach((li, index) => {
            const currentText = li.textContent || ''
            const cleanText = currentText.replace(/^\d+\.\s*/, '').replace(/^[•\-\.]\s*/, '')
            const textOnly = cleanText.replace(/^\.\s*/, '')
            
            li.textContent = `${index + 1}. ${textOnly}`
          })
          
          // 移动光标到新列表项的末尾
          if (newLi) {
            const finalRange = document.createRange()
            finalRange.selectNodeContents(newLi)
            finalRange.collapse(false)
            const newSelection = window.getSelection()
            if (newSelection) {
              newSelection.removeAllRanges()
              newSelection.addRange(finalRange)
            }
          }
        } else {
          // 无序列表：为所有项添加前缀 "."（不加粗）
          allItems.forEach((li) => {
            const currentText = li.textContent || ''
            const cleanText = currentText.replace(/^\d+\.\s*/, '').replace(/^[•\-\.]\s*/, '')
            const textOnly = cleanText.replace(/^\.\s*/, '')
            
            li.textContent = `. ${textOnly}`
          })
          
          // 移动光标到新列表项的末尾
          if (newLi) {
            const finalRange = document.createRange()
            finalRange.selectNodeContents(newLi)
            finalRange.collapse(false)
            const newSelection = window.getSelection()
            if (newSelection) {
              newSelection.removeAllRanges()
              newSelection.addRange(finalRange)
            }
          }
        }
        
        // 触发内容变化事件
        handleContentChange({ target: wysiwygContainer.value } as any)
      }, 10)
    }
  }
}

// 处理目录链接点击
const handleTocClick = (event: Event) => {
  const target = event.target as HTMLElement // 获取点击目标
  const link = target.closest('.toc-link') as HTMLAnchorElement // 查找最近的链接元素
  
  if (link) {
    event.preventDefault() // 阻止默认跳转
    event.stopPropagation() // 阻止事件冒泡
    const href = link.getAttribute('href') // 获取锚点
    if (href && wysiwygContainer.value) {
      const targetId = href.substring(1) // 移除 # 号
      
      // 等待 DOM 更新后查找目标元素
      nextTick(() => {
        // 尝试多种方式查找目标元素
        let targetElement = wysiwygContainer.value?.querySelector(`#${targetId}`) as HTMLElement
        
        // 如果通过 ID 找不到，尝试通过 data-id 属性查找
        if (!targetElement) {
          targetElement = wysiwygContainer.value?.querySelector(`[data-id="${targetId}"]`) as HTMLElement
        }
        
        // 如果还是找不到，尝试查找所有标题并匹配文本
        if (!targetElement) {
          const headings = wysiwygContainer.value?.querySelectorAll('h1, h2, h3, h4, h5, h6')
          if (headings) {
            const linkText = link.textContent?.trim()
            headings.forEach((heading) => {
              if (heading.textContent?.trim() === linkText) {
                targetElement = heading as HTMLElement
              }
            })
          }
        }
        
        if (targetElement && wysiwygContainer.value) {
          // 使用 scrollIntoView 方法，这是最可靠的方式
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          })
          
          // 额外调整：确保元素在容器内可见（考虑容器可能有 padding）
          setTimeout(() => {
            const container = wysiwygContainer.value
            if (container && targetElement) {
              const containerRect = container.getBoundingClientRect()
              const elementRect = targetElement.getBoundingClientRect()
              
              // 如果元素不在容器视口内，手动调整滚动
              if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
                const scrollTop = container.scrollTop + (elementRect.top - containerRect.top) - 20 // 添加 20px 偏移
                container.scrollTo({
                  top: scrollTop,
                  behavior: 'smooth'
                })
              }
            }
          }, 100)
        } else {
          console.warn(`未找到目标元素: #${targetId}`) // 调试信息
        }
      })
    }
  }
}


// 监听store中的内容变化，同步到编辑器（仅在非用户编辑时）
watch(
  () => editorStore.markdownContent,
  (newContent: string) => {
    if (isUpdatingContent || isUserEditing) return // 如果正在更新内容或用户正在编辑则返回
    
    if (wysiwygContainer.value) {
      const currentHtml = wysiwygContainer.value.innerHTML
      const newHtml = parseMarkdown(newContent)
      
      // 只有当HTML不同时才更新
      if (currentHtml !== newHtml) {
        isUpdatingContent = true
        wysiwygContainer.value.innerHTML = newHtml
        
        // 重新生成目录
        nextTick(() => {
          // 确保所有标题都有ID
          ensureHeadingIds()
          // 重新高亮所有代码块（包括添加工具栏）
          highlightCodeBlocks()
          // 使用更新后的HTML（包含ID）来生成目录
          updateToc(wysiwygContainer.value?.innerHTML || newHtml)
          isUpdatingContent = false
        })
      }
    }
  }
)

// 获取当前选中的文本
const getSelectedText = (): string => {
  const selection = window.getSelection()
  return selection?.toString() || ''
}

// 获取当前选区范围
const getSelectionRange = (): Range | null => {
  const selection = window.getSelection()
  if (selection && selection.rangeCount > 0) {
    return selection.getRangeAt(0)
  }
  return null
}

// 执行命令（用于 Toolbar）
const execCommand = (command: string, value?: string) => {
  if (!wysiwygContainer.value) return
  
  wysiwygContainer.value.focus()
  document.execCommand(command, false, value)
  
  // 触发内容变化事件
  handleContentChange({ target: wysiwygContainer.value } as any)
}

// 插入文本到光标位置
const insertText = (text: string) => {
  if (!wysiwygContainer.value) return
  
  wysiwygContainer.value.focus()
  const selection = window.getSelection()
  const range = selection?.getRangeAt(0)
  
  if (range) {
    range.deleteContents()
    const textNode = document.createTextNode(text)
    range.insertNode(textNode)
    
    // 移动光标到插入文本后
    range.setStartAfter(textNode)
    range.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(range)
    
    // 触发内容变化事件
    handleContentChange({ target: wysiwygContainer.value } as any)
  }
}

// 包装文本（用于加粗、斜体等）
const wrapText = (before: string, after: string = before) => {
  if (!wysiwygContainer.value) return
  
  wysiwygContainer.value.focus()
  const selection = window.getSelection()
  
  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    const selectedText = selection.toString()
    
    if (selectedText) {
      // 有选中文本，包装选中文本
      const textNode = document.createTextNode(before + selectedText + after)
      range.deleteContents()
      range.insertNode(textNode)
    } else {
      // 没有选中文本，插入标记并定位光标
      const textNode = document.createTextNode(before + after)
      range.insertNode(textNode)
      
      // 将光标定位到标记中间
      range.setStart(textNode, before.length)
      range.setEnd(textNode, before.length)
    }
    
    selection.removeAllRanges()
    selection.addRange(range)
    
    // 触发内容变化事件
    handleContentChange({ target: wysiwygContainer.value } as any)
  }
}

// 创建 Toolbar 适配器对象（模拟 EditorView）
const createToolbarAdapter = () => {
  return {
    wysiwygContainer,
    execCommand,
    insertText,
    wrapText,
    getSelectedText,
    getSelectionRange,
  }
}

// 暴露给 Toolbar 使用
const toolbarAdapter = createToolbarAdapter()

// 处理粘贴事件
const handlePaste = async (event: ClipboardEvent) => {
  const clipboardData = event.clipboardData // 获取剪贴板数据
  if (!clipboardData) return // 如果没有剪贴板数据则返回

  // 尝试从剪贴板获取图片
  const imageFile = getImageFromClipboard(clipboardData)
  
  if (imageFile) {
    // 如果剪贴板中有图片，阻止默认粘贴行为
    event.preventDefault()

    // 验证文件大小（最大 10MB）
    if (!validateImageSize(imageFile, 10 * 1024 * 1024)) {
      ElMessage.warning('图片文件大小不能超过 10MB') // 提示文件过大
      return
    }

    try {
      // 将图片文件转换为 base64 Data URL
      const dataURL = await fileToDataURL(imageFile)
      
      // 获取文件名（不含扩展名）作为 alt 文本
      const fileName = imageFile.name.replace(/\.[^/.]+$/, '') || '粘贴的图片' // 移除文件扩展名，如果没有名称则使用默认值
      
      // 插入图片到编辑器
      if (wysiwygContainer.value) {
        const selection = window.getSelection()
        const range = selection?.getRangeAt(0)
        
        if (range) {
          const img = document.createElement('img')
          img.src = dataURL
          img.alt = fileName
          img.style.maxWidth = '100%'
          img.style.height = 'auto'
          img.style.borderRadius = '0.5rem'
          img.style.margin = '1em 0'
          
          range.deleteContents()
          range.insertNode(img)
          
          // 移动光标到图片后面
          range.setStartAfter(img)
          range.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(range)
          
          // 触发内容变化事件
          handleContentChange({ target: wysiwygContainer.value } as any)
        }
      }
    } catch (error) {
      console.error('处理粘贴图片失败:', error) // 输出错误信息
      ElMessage.error('处理粘贴图片失败，请确保剪贴板中的是有效的图片') // 提示错误
    }
  }
}

// 初始化编辑器 DOM 内容
const initEditorDom = () => {
  if (!wysiwygContainer.value) return
  const html = getPreviewHtml()
  wysiwygContainer.value.innerHTML = html
  ensureHeadingIds()
  highlightCodeBlocks()
  updateToc(wysiwygContainer.value.innerHTML)
}

// 文档保存防抖
let saveTimer: ReturnType<typeof setTimeout> | null = null
const SAVE_DEBOUNCE_MS = 800

const scheduleSave = () => {
  if (!props.documentId) return
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(async () => {
    saveTimer = null
    try {
      await updateDocument(props.documentId, {
        content: editorStore.markdownContent,
      })
    } catch (e) {
      console.error('保存失败:', e)
      ElMessage.error('保存失败')
    }
  }, SAVE_DEBOUNCE_MS)
}

// 用户是否已编辑（避免加载后误触发保存）
const userHasEdited = ref(false)

// 监听内容变化以自动保存（仅用户编辑后）
watch(
  () => editorStore.markdownContent,
  () => {
    if (userHasEdited.value && props.documentId) scheduleSave()
  },
  { deep: false }
)

// 加载文档
const loadDocument = async (id: string) => {
  try {
    userHasEdited.value = false
    const doc = await fetchDocument(id)
    editorStore.setMarkdownContent(doc.content)
    initEditorDom()
  } catch (e) {
    console.error('加载文档失败:', e)
    ElMessage.error('加载文档失败')
  }
}

watch(
  () => props.documentId,
  (id) => {
    if (id) loadDocument(id)
  },
  { immediate: false }
)

// 组件挂载时初始化（仅从后端加载，不使用本地存储）
onMounted(async () => {
  await nextTick()
  if (props.documentId) {
    await loadDocument(props.documentId)
  } else {
    editorStore.setMarkdownContent('# 欢迎使用Markdown编辑器\n\n请从左侧选择或新建文档开始编辑。\n')
    initEditorDom()
  }
})

// 组件卸载时清理
onUnmounted(() => {
  // 清理工作（目前不需要特殊清理）
})
</script>

<style scoped>
/* 编辑器容器样式 */
.markdown-editor {
  height: calc(100vh - 4rem); /* 减去头部高度 */
}

.editor-container {
  min-height: 0; /* 允许flex子元素收缩 */
}

/* 所见即所得面板样式 */
.wysiwyg-panel {
  min-width: 0; /* 允许flex子元素收缩 */
}

/* 表头样式 - 确保高度一致 */
.panel-header {
  min-height: 2.5rem; /* 最小高度 */
  display: flex; /* 使用flex布局 */
  align-items: center; /* 垂直居中 */
}

/* 所见即所得内容包装器样式 */
.wysiwyg-content-wrapper {
  min-height: 0; /* 允许flex子元素收缩 */
}

/* 所见即所得编辑器样式 */
.wysiwyg-wrapper {
  background-color: var(--fallback-b1, oklch(var(--b1))); /* 背景色 */
  outline: none; /* 移除焦点轮廓 */
  min-height: 100%; /* 最小高度100% */
}

/* 所见即所得编辑器焦点样式 */
.wysiwyg-wrapper:focus {
  outline: none; /* 移除焦点轮廓 */
}

/* 所见即所得内容样式 */
.wysiwyg-wrapper :deep(h1) {
  font-size: 2em; /* 一级标题大小 */
  font-weight: bold; /* 粗体 */
  margin-top: 0.67em; /* 上边距 */
  margin-bottom: 0.67em; /* 下边距 */
}

.wysiwyg-wrapper :deep(h2) {
  font-size: 1.5em; /* 二级标题大小 */
  font-weight: bold; /* 粗体 */
  margin-top: 0.83em; /* 上边距 */
  margin-bottom: 0.83em; /* 下边距 */
  padding-left: 1.5em; /* 左缩进 */
}

.wysiwyg-wrapper :deep(h3) {
  font-size: 1.17em; /* 三级标题大小 */
  font-weight: bold; /* 粗体 */
  margin-top: 1em; /* 上边距 */
  margin-bottom: 1em; /* 下边距 */
  padding-left: 3em; /* 左缩进（比 h2 更多） */
}

.wysiwyg-wrapper :deep(h4),
.wysiwyg-wrapper :deep(h5),
.wysiwyg-wrapper :deep(h6) {
  font-weight: bold; /* 确保所有标题都加粗 */
}

/* 标题后面的列表自动缩进 */
.wysiwyg-wrapper :deep(h2 + ul),
.wysiwyg-wrapper :deep(h2 + ol) {
  padding-left: 1.5em; /* 与 h2 相同的缩进 */
  margin-left: 0; /* 移除默认的列表缩进 */
}

.wysiwyg-wrapper :deep(h3 + ul),
.wysiwyg-wrapper :deep(h3 + ol) {
  padding-left: 3em; /* 与 h3 相同的缩进 */
  margin-left: 0; /* 移除默认的列表缩进 */
}

.wysiwyg-wrapper :deep(p) {
  margin: 1em 0; /* 段落边距 */
  line-height: 1.6; /* 行高 */
}

/* 行内代码样式（不在pre标签内的code） */
.wysiwyg-wrapper :deep(code:not(pre code)) {
  background-color: rgba(27, 31, 35, 0.05); /* 背景色（浅灰色） */
  padding: 0.2em 0.4em; /* 内边距 */
  border-radius: 0.25rem; /* 圆角 */
  font-family: 'Courier New', 'Consolas', 'Monaco', 'Menlo', monospace; /* 等宽字体 */
  font-size: 0.9em; /* 字体大小 */
  color: #e83e8c; /* 文字颜色（粉色，类似GitHub） */
}

.wysiwyg-wrapper :deep(pre) {
  background: #282c34 !important; /* 背景色（atom-one-dark 主题的黑色背景） */
  border: 1px solid #3e4451; /* 边框（深灰色） */
  border-radius: 0.5rem; /* 圆角 */
  padding: 0; /* 移除内边距（由code元素处理） */
  margin: 1em 0; /* 外边距 */
  overflow: hidden; /* 隐藏溢出 */
  position: relative; /* 相对定位，用于工具栏定位 */
}

/* 代码块工具栏 */
.wysiwyg-wrapper :deep(.code-block-toolbar) {
  position: absolute; /* 绝对定位 */
  top: 0.5rem; /* 距离顶部 */
  right: 0.5rem; /* 距离右侧 */
  display: flex; /* 弹性布局 */
  gap: 0.375rem; /* 按钮间距 */
  opacity: 1; /* 默认显示 */
  transition: opacity 0.2s ease-in-out; /* 过渡效果 */
  z-index: 10; /* 层级 */
  pointer-events: auto; /* 始终响应鼠标事件 */
}

/* 确保代码块容器是相对定位，以便工具栏正确定位 */
.wysiwyg-wrapper :deep(pre) {
  position: relative; /* 相对定位，用于工具栏绝对定位 */
}

.wysiwyg-wrapper :deep(.code-block-btn) {
  background: rgba(62, 68, 81, 0.9); /* 半透明背景 */
  border: 1px solid #4a5568; /* 边框 */
  border-radius: 0.375rem; /* 圆角 */
  padding: 0.375rem 0.5rem; /* 内边距 */
  cursor: pointer; /* 鼠标指针 */
  color: #abb2bf; /* 文字颜色 */
  font-size: 0.875rem; /* 字体大小 */
  line-height: 1; /* 行高 */
  transition: all 0.2s ease-in-out; /* 过渡效果 */
  display: flex; /* 弹性布局 */
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  min-width: 2rem; /* 最小宽度 */
  min-height: 2rem; /* 最小高度 */
  user-select: none; /* 禁止选择文本 */
  backdrop-filter: blur(4px); /* 背景模糊效果 */
}

.wysiwyg-wrapper :deep(.code-block-btn:hover) {
  background: rgba(62, 68, 81, 1); /* 悬停时背景 */
  color: #fff; /* 悬停时文字颜色 */
  border-color: #5a6578; /* 悬停时边框颜色 */
  transform: translateY(-1px); /* 轻微上移 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* 阴影效果 */
}

.wysiwyg-wrapper :deep(.code-block-btn:active) {
  transform: translateY(0); /* 点击时恢复位置 */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2); /* 减少阴影 */
}

.wysiwyg-wrapper :deep(.code-block-copy:hover) {
  background: rgba(34, 197, 94, 0.2); /* 复制按钮悬停时绿色背景 */
  border-color: rgba(34, 197, 94, 0.5); /* 绿色边框 */
}

.wysiwyg-wrapper :deep(.code-block-delete:hover) {
  background: rgba(239, 68, 68, 0.2); /* 删除按钮悬停时红色背景 */
  border-color: rgba(239, 68, 68, 0.5); /* 红色边框 */
}

.wysiwyg-wrapper :deep(pre code) {
  display: block; /* 块级显示 */
  background-color: transparent; /* 透明背景 */
  padding: 1em; /* 内边距 */
  overflow-x: auto; /* 横向滚动 */
  font-family: 'Courier New', 'Consolas', 'Monaco', 'Menlo', monospace; /* 等宽字体 */
  font-size: 0.875rem; /* 字体大小 */
  line-height: 1.6; /* 行高 */
  color: #abb2bf; /* 文字颜色（atom-one-dark 主题的默认文字颜色） */
  border-radius: 0.5rem; /* 圆角 */
}

/* 代码高亮样式（highlight.js） */
.wysiwyg-wrapper :deep(pre code.hljs) {
  background: #282c34 !important; /* 背景色（atom-one-dark 主题的黑色背景） */
  padding: 1em; /* 内边距 */
  color: #abb2bf; /* 文字颜色 */
}

/* 目录样式 */
.toc-sidebar {
  font-size: 0.875rem; /* 字体大小 */
}

.toc-nav {
  position: sticky; /* 粘性定位 */
  top: 0; /* 顶部对齐 */
}

.toc-list {
  list-style: none; /* 移除列表样式 */
  padding: 0; /* 内边距 */
  margin: 0; /* 外边距 */
}

.toc-item {
  margin: 0.25rem 0; /* 列表项边距 */
}

.toc-link {
  display: block; /* 块级显示 */
  padding: 0.25rem 0.5rem; /* 内边距 */
  color: var(--fallback-bc, oklch(var(--bc))); /* 文字颜色 */
  text-decoration: none; /* 无下划线 */
  border-radius: 0.25rem; /* 圆角 */
  transition: all 0.2s; /* 过渡效果 */
}

.toc-link:hover {
  background-color: var(--fallback-b2, oklch(var(--b2))); /* 悬停背景色 */
  color: var(--fallback-p, oklch(var(--p))); /* 悬停文字颜色 */
}

.toc-link[data-level="1"] {
  font-weight: bold; /* 一级标题粗体 */
  font-size: 1em; /* 字体大小 */
}

.toc-link[data-level="2"] {
  font-weight: 600; /* 二级标题半粗体 */
  font-size: 0.95em; /* 字体大小 */
}

.toc-link[data-level="3"] {
  font-weight: 500; /* 三级标题中等粗细 */
  font-size: 0.9em; /* 字体大小 */
}

.toc-children {
  list-style: none; /* 移除列表样式 */
  padding-left: 1rem; /* 左内边距 */
  margin-top: 0.25rem; /* 上外边距 */
}

.wysiwyg-wrapper :deep(ul),
.wysiwyg-wrapper :deep(ol) {
  margin: 1em 0; /* 列表外边距 */
  padding-left: 2em; /* 左内边距 */
}

.wysiwyg-wrapper :deep(li) {
  margin: 0.5em 0; /* 列表项边距 */
}

.wysiwyg-wrapper :deep(blockquote) {
  border-left: 4px solid var(--fallback-p, oklch(var(--p))); /* 左边框 */
  padding-left: 1em; /* 左内边距 */
  margin: 1em 0; /* 外边距 */
  color: var(--fallback-bc, oklch(var(--bc))); /* 文字颜色 */
}

.wysiwyg-wrapper :deep(a) {
  color: var(--fallback-p, oklch(var(--p))); /* 链接颜色 */
  text-decoration: underline; /* 下划线 */
}

.wysiwyg-wrapper :deep(img) {
  max-width: 100%; /* 最大宽度 */
  height: auto; /* 自动高度 */
  border-radius: 0.5rem; /* 圆角 */
  margin: 1em 0; /* 外边距 */
}

.wysiwyg-wrapper :deep(table) {
  width: 100%; /* 表格宽度 */
  border-collapse: collapse; /* 边框合并 */
  margin: 1em 0; /* 外边距 */
}

.wysiwyg-wrapper :deep(th),
.wysiwyg-wrapper :deep(td) {
  border: 1px solid var(--fallback-bc, oklch(var(--bc))); /* 边框 */
  padding: 0.5em; /* 内边距 */
  text-align: left; /* 左对齐 */
}

.wysiwyg-wrapper :deep(th) {
  background-color: var(--fallback-b2, oklch(var(--b2))); /* 表头背景色 */
  font-weight: bold; /* 粗体 */
}
</style>

