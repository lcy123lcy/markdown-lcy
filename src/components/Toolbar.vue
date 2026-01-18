<template>
  <div class="toolbar bg-base-200 border-b border-base-300 px-4 py-2 flex items-center gap-2 flex-wrap">
    <!-- Markdown语法按钮组 -->
    <div class="toolbar-group flex items-center gap-1 border-r border-base-300 pr-2">
      <!-- 加粗 -->
      <el-button
        @click="handleBold"
        size="small"
        text
        title="加粗 (Ctrl+B)"
      >
        <span class="font-bold">B</span>
      </el-button>
      
      <!-- 斜体 -->
      <el-button
        @click="handleItalic"
        size="small"
        text
        title="斜体 (Ctrl+I)"
      >
        <span class="italic">I</span>
      </el-button>
      
      <!-- 标题1 -->
      <el-button
        @click="handleHeading(1)"
        size="small"
        text
        title="标题1（自动编号）"
      >
        H1
      </el-button>
      
      <!-- 标题2 -->
      <el-button
        @click="handleHeading(2)"
        size="small"
        text
        title="标题2（自动编号）"
      >
        H2
      </el-button>
      
      <!-- 标题3 -->
      <el-button
        @click="handleHeading(3)"
        size="small"
        text
        title="标题3（自动编号）"
      >
        H3
      </el-button>
      
      <!-- 下划线 -->
      <el-button
        @click="handleUnderline"
        size="small"
        text
        title="下划线 (Ctrl+U)"
      >
        <span class="underline">U</span>
      </el-button>
      
      <!-- 中划线 -->
      <el-button
        @click="handleStrikethrough"
        size="small"
        text
        title="中划线"
      >
        <span style="text-decoration: line-through;">S</span>
      </el-button>
    </div>

    <!-- 字体设置按钮组 -->
    <div class="toolbar-group flex items-center gap-1 border-r border-base-300 pr-2">
      <!-- 字号减小 -->
      <el-button
        @click="handleFontSizeDecrease"
        size="small"
        text
        title="减小字号"
      >
        A-
      </el-button>
      
      <!-- 字号显示 -->
      <span class="text-sm px-2 min-w-[3rem] text-center">
        {{ currentFontSize }}px
      </span>
      
      <!-- 字号增大 -->
      <el-button
        @click="handleFontSizeIncrease"
        size="small"
        text
        title="增大字号"
      >
        A+
      </el-button>
      
      <!-- 字体颜色 -->
      <el-color-picker
        v-model="fontColor"
        @change="handleFontColorChange"
        size="small"
        :predefine="predefineColors"
        title="字体颜色"
        show-alpha
      />
      
      <!-- 背景颜色 -->
      <el-color-picker
        v-model="backgroundColor"
        @change="handleBackgroundColorChange"
        size="small"
        :predefine="predefineColors"
        title="背景颜色"
        show-alpha
      />
      
      <!-- 字体族 -->
      <el-select
        v-model="fontFamily"
        @change="handleFontFamilyChange"
        size="small"
        style="width: 120px"
        placeholder="字体"
      >
        <el-option label="默认" value="" />
        <el-option label="宋体" value="SimSun, serif" />
        <el-option label="黑体" value="SimHei, sans-serif" />
        <el-option label="微软雅黑" value="Microsoft YaHei, sans-serif" />
        <el-option label="Arial" value="Arial, sans-serif" />
        <el-option label="Times New Roman" value="Times New Roman, serif" />
        <el-option label="Courier New" value="Courier New, monospace" />
      </el-select>
    </div>

    <!-- 列表和引用按钮组 -->
    <div class="toolbar-group flex items-center gap-1 border-r border-base-300 pr-2">
      <!-- 无序列表 -->
      <el-button
        @click="handleUnorderedList"
        size="small"
        text
        title="无序列表（自动编号）"
      >
        • 列表
      </el-button>
      
      <!-- 有序列表 -->
      <el-button
        @click="handleOrderedList"
        size="small"
        text
        title="有序列表（自动编号）"
      >
        1. 列表
      </el-button>
    </div>

    <!-- 代码和链接按钮组 -->
    <div class="toolbar-group flex items-center gap-1 border-r border-base-300 pr-2">
      <!-- 代码块 -->
      <el-button
        @click="handleCodeBlock"
        size="small"
        text
        title="代码块"
      >
        { }
      </el-button>
      
      <!-- 链接 -->
      <el-button
        @click="handleLink"
        size="small"
        text
        title="插入链接"
      >
        链接
      </el-button>
      
      <!-- 图片 -->
      <el-upload
        ref="uploadRef"
        :auto-upload="false"
        :show-file-list="false"
        accept="image/*"
        :on-change="handleImageUpload"
        style="display: inline-block;"
      >
        <template #trigger>
          <el-button
            size="small"
            text
            title="插入图片（支持上传和粘贴）"
          >
            图片
          </el-button>
        </template>
      </el-upload>
    </div>

    <!-- 功能按钮组 -->
    <div class="toolbar-group flex items-center gap-1 ml-auto">
      <!-- 字数统计 -->
      <div class="text-sm text-base-content/70 px-2">
        字符: {{ editorStore.textStats.charactersWithSpaces }} | 
        单词: {{ editorStore.textStats.words }}
      </div>
      
      <!-- 清空内容 -->
      <el-button
        @click="handleClear"
        size="small"
        text
        type="danger"
        title="清空内容"
      >
        清空
      </el-button>
      
      <!-- 保存 -->
      <el-button
        @click="handleSave"
        size="small"
        type="primary"
        title="保存到本地存储"
      >
        保存
      </el-button>
      
      <!-- 导出HTML -->
      <el-button
        @click="handleExport"
        size="small"
        type="primary"
        title="导出为HTML文件"
      >
        导出HTML
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue' // 导入Vue响应式API
import { ElMessageBox, ElMessage } from 'element-plus' // 导入Element Plus消息组件
import { useEditorStore } from '@/stores/editor' // 导入编辑器store
import { exportToHTML } from '@/utils/export' // 导入导出函数
import hljs from 'highlight.js' // 导入 highlight.js 用于代码高亮

// 字体设置相关的响应式变量
const currentFontSize = ref(16) // 当前字号（默认16px）
const fontColor = ref('#000000') // 字体颜色
const backgroundColor = ref('') // 背景颜色
const fontFamily = ref('') // 字体族

// 保存选中状态（用于颜色选择器）
let savedSelection: { range: Range; container: HTMLElement } | null = null

// 预定义颜色
const predefineColors = [
  '#000000', // 黑色
  '#333333', // 深灰
  '#666666', // 中灰
  '#999999', // 浅灰
  '#ffffff', // 白色
  '#ff0000', // 红色
  '#00ff00', // 绿色
  '#0000ff', // 蓝色
  '#ffff00', // 黄色
  '#ff00ff', // 洋红
  '#00ffff', // 青色
  '#ff8800', // 橙色
  '#8800ff', // 紫色
]

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
import {
  wrapText,
  insertHeading,
  insertCodeBlock,
  insertLink,
  insertImage,
  insertList,
  getSelectedText,
} from '@/utils/editor' // 导入编辑器工具函数
import { fileToDataURL, validateImageSize } from '@/utils/image' // 导入图片处理工具函数
import type { EditorView } from '@codemirror/view' // 导入CodeMirror视图类型
import type { UploadFile, UploadInstance } from 'element-plus' // 导入Element Plus上传类型

// 定义所见即所得适配器接口
interface WysiwygAdapter {
  wysiwygContainer: { value: HTMLElement | null }
  execCommand: (command: string, value?: string) => void
  insertText: (text: string) => void
  wrapText: (before: string, after?: string) => void
  getSelectedText: () => string
  getSelectionRange: () => Range | null
}

// 定义组件props
interface Props {
  editorView: EditorView | null // CodeMirror编辑器实例
  wysiwygAdapter?: WysiwygAdapter | null // 所见即所得适配器
}

const props = defineProps<Props>() // 定义props

// 获取编辑器store实例
const editorStore = useEditorStore()

// 处理加粗
const handleBold = () => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：使用 HTML 命令
    props.wysiwygAdapter.execCommand('bold')
    return
  }
  if (!props.editorView) return // 如果编辑器不存在则返回
  wrapText(props.editorView, '**', '**') // 使用双星号环绕文本
}

// 处理斜体
const handleItalic = () => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：使用 HTML 命令
    props.wysiwygAdapter.execCommand('italic')
    return
  }
  if (!props.editorView) return // 如果编辑器不存在则返回
  wrapText(props.editorView, '*', '*') // 使用单星号环绕文本
}

// 处理下划线
const handleUnderline = () => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：使用 HTML 命令
    props.wysiwygAdapter.execCommand('underline')
    return
  }
  if (!props.editorView) return
  // CodeMirror 模式：使用 HTML 标签
  wrapText(props.editorView, '<u>', '</u>')
}

// 处理中划线
const handleStrikethrough = () => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：使用 HTML 命令
    props.wysiwygAdapter.execCommand('strikeThrough')
    return
  }
  if (!props.editorView) return
  // CodeMirror 模式：使用 Markdown 语法
  wrapText(props.editorView, '~~', '~~')
}

// 处理字号增大
const handleFontSizeIncrease = () => {
  if (props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          // 如果有选中文本，应用字号
          const fontSize = currentFontSize.value + 2
          currentFontSize.value = Math.min(fontSize, 72) // 最大72px
          
          // 创建 span 元素并设置字号
          const span = document.createElement('span')
          span.style.fontSize = `${currentFontSize.value}px`
          try {
            range.surroundContents(span)
          } catch (e) {
            // 如果 surroundContents 失败，使用 insertNode
            span.appendChild(range.extractContents())
            range.insertNode(span)
          }
          
          // 恢复选中状态：选中整个 span 元素
          const newRange = document.createRange()
          newRange.selectNodeContents(span)
          selection.removeAllRanges()
          selection.addRange(newRange)
          
          props.wysiwygAdapter.execCommand('', '')
        } else {
          // 如果没有选中文本，直接设置默认字号
          currentFontSize.value = Math.min(currentFontSize.value + 2, 72)
          document.execCommand('fontSize', false, '7') // 使用默认字号命令
        }
      }
    }
    return
  }
  if (!props.editorView) return
  // CodeMirror 模式：提示用户选中文本
  ElMessage.info('请先选中要调整字号的文本')
}

// 处理字号减小
const handleFontSizeDecrease = () => {
  if (props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          // 如果有选中文本，应用字号
          const fontSize = currentFontSize.value - 2
          currentFontSize.value = Math.max(fontSize, 8) // 最小8px
          
          // 创建 span 元素并设置字号
          const span = document.createElement('span')
          span.style.fontSize = `${currentFontSize.value}px`
          try {
            range.surroundContents(span)
          } catch (e) {
            // 如果 surroundContents 失败，使用 insertNode
            span.appendChild(range.extractContents())
            range.insertNode(span)
          }
          
          // 恢复选中状态：选中整个 span 元素
          const newRange = document.createRange()
          newRange.selectNodeContents(span)
          selection.removeAllRanges()
          selection.addRange(newRange)
          
          props.wysiwygAdapter.execCommand('', '')
        } else {
          // 如果没有选中文本，直接设置默认字号
          currentFontSize.value = Math.max(currentFontSize.value - 2, 8)
          document.execCommand('fontSize', false, '1') // 使用默认字号命令
        }
      }
    }
    return
  }
  if (!props.editorView) return
  // CodeMirror 模式：提示用户选中文本
  ElMessage.info('请先选中要调整字号的文本')
}

// 保存选中状态
const saveSelection = () => {
  if (props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          // 克隆 range 以保存选中状态
          savedSelection = {
            range: range.cloneRange(),
            container: container
          }
        }
      }
    }
  }
}

// 恢复选中状态
const restoreSelection = () => {
  if (savedSelection && props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container === savedSelection.container) {
      const selection = window.getSelection()
      if (selection) {
        try {
          selection.removeAllRanges()
          selection.addRange(savedSelection.range)
        } catch (e) {
          console.warn('恢复选中状态失败:', e)
        }
      }
    }
    savedSelection = null
  }
}

// 处理字体颜色变化
const handleFontColorChange = (color: string | null) => {
  if (!color || color === '') return
  
  // 先尝试恢复选中状态
  restoreSelection()
  
  if (props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          // 如果有选中文本，应用颜色
          const span = document.createElement('span')
          span.style.color = color
          try {
            range.surroundContents(span)
          } catch (e) {
            // 如果 surroundContents 失败，使用 insertNode
            span.appendChild(range.extractContents())
            range.insertNode(span)
          }
          
          // 移动光标到末尾
          range.setStartAfter(span)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
          
          props.wysiwygAdapter.execCommand('', '')
        } else {
          // 如果没有选中文本，设置默认颜色
          document.execCommand('foreColor', false, color)
        }
      }
    }
    return
  }
  if (!props.editorView) return
  // CodeMirror 模式：提示用户选中文本
  ElMessage.info('请先选中要设置颜色的文本')
}

// 处理背景颜色变化
const handleBackgroundColorChange = (color: string | null) => {
  if (!color || color === '') return
  
  // 先尝试恢复选中状态
  restoreSelection()
  
  if (props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          // 如果有选中文本，应用背景颜色
          const span = document.createElement('span')
          span.style.backgroundColor = color
          try {
            range.surroundContents(span)
          } catch (e) {
            // 如果 surroundContents 失败，使用 insertNode
            span.appendChild(range.extractContents())
            range.insertNode(span)
          }
          
          // 恢复选中状态：选中整个 span 元素
          const newRange = document.createRange()
          newRange.selectNodeContents(span)
          selection.removeAllRanges()
          selection.addRange(newRange)
          
          props.wysiwygAdapter.execCommand('', '')
        } else {
          // 如果没有选中文本，设置默认背景颜色
          document.execCommand('backColor', false, color)
        }
      }
    }
    return
  }
  if (!props.editorView) return
  // CodeMirror 模式：提示用户选中文本
  ElMessage.info('请先选中要设置背景颜色的文本')
}

// 处理字体族变化
const handleFontFamilyChange = (family: string) => {
  if (props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        if (!range.collapsed) {
          // 如果有选中文本，应用字体族
          const span = document.createElement('span')
          if (family) {
            span.style.fontFamily = family
          }
          try {
            range.surroundContents(span)
          } catch (e) {
            // 如果 surroundContents 失败，使用 insertNode
            span.appendChild(range.extractContents())
            range.insertNode(span)
          }
          
          // 移动光标到末尾
          range.setStartAfter(span)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
          
          props.wysiwygAdapter.execCommand('', '')
        } else {
          // 如果没有选中文本，设置默认字体族
          if (family) {
            document.execCommand('fontName', false, family)
          }
        }
      }
    }
    return
  }
  if (!props.editorView) return
  // CodeMirror 模式：提示用户选中文本
  ElMessage.info('请先选中要设置字体的文本')
}

// 计算标题索引（按文档顺序）
const calculateHeadingIndex = (level: number, currentElement: HTMLElement): string => {
  if (!props.wysiwygAdapter?.wysiwygContainer.value) return ''
  
  const container = props.wysiwygAdapter.wysiwygContainer.value
  // 获取所有标题元素（按文档顺序）
  const allHeadings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[]
  
  // 计算各级别标题的数量（只计算当前元素之前的标题）
  const counts: number[] = [0, 0, 0, 0, 0, 0]
  
  // 找到当前元素在所有标题中的位置
  const currentIndex = allHeadings.indexOf(currentElement)
  
  // 遍历当前元素之前的所有标题
  for (let i = 0; i < currentIndex; i++) {
    const heading = allHeadings[i]
    const hLevel = parseInt(heading.tagName.substring(1)) - 1
    if (hLevel >= 0 && hLevel < 6) {
      counts[hLevel]++
      // 重置下级标题计数
      for (let j = hLevel + 1; j < 6; j++) {
        counts[j] = 0
      }
    }
  }
  
  // 当前级别标题数量+1
  counts[level - 1]++
  
  // 生成索引（只显示到当前级别）
  const indexParts: string[] = []
  for (let i = 0; i < level; i++) {
    if (counts[i] > 0) {
      indexParts.push(counts[i].toString())
    }
  }
  
  return indexParts.join('.') + '. '
}

// 处理标题
const handleHeading = (level: number) => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：使用 formatBlock 命令并添加索引
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      container.focus()
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)
      
      if (range) {
        // 保存当前选中的文本
        const selectedText = selection?.toString() || ''
        
        // 先应用标题格式
        document.execCommand('formatBlock', false, `h${level}`)
        
        // 等待DOM更新后获取标题元素
        setTimeout(() => {
          // 重新获取选择范围
          const newSelection = window.getSelection()
          if (!newSelection || newSelection.rangeCount === 0) return
          
          const newRange = newSelection.getRangeAt(0)
          
          // 获取当前标题元素
          let headingElement = newRange.commonAncestorContainer as HTMLElement
          if (headingElement.nodeType !== Node.ELEMENT_NODE) {
            headingElement = headingElement.parentElement as HTMLElement
          }
          
          // 查找最近的标题元素
          while (headingElement && !headingElement.matches('h1, h2, h3, h4, h5, h6')) {
            headingElement = headingElement.parentElement as HTMLElement
          }
          
          if (headingElement && headingElement.matches(`h${level}`)) {
            // 获取标题文本（移除可能已有的索引）
            let currentText = headingElement.textContent || ''
            // 移除已有的索引前缀（支持多级索引如 1.2.3.）
            currentText = currentText.replace(/^\d+(\.\d+)*\.\s*/, '')
            
            // 如果没有文本，使用选中的文本
            if (!currentText && selectedText) {
              currentText = selectedText
            }
            
            // 计算索引（按文档顺序）
            const index = calculateHeadingIndex(level, headingElement)
            
            // 确保标题加粗（通过设置样式）
            headingElement.style.fontWeight = 'bold'
            headingElement.textContent = index + currentText
            
            // 移动光标到文本末尾
            const finalRange = document.createRange()
            finalRange.selectNodeContents(headingElement)
            finalRange.collapse(false)
            newSelection.removeAllRanges()
            newSelection.addRange(finalRange)
            
            // 触发内容变化事件
            props.wysiwygAdapter.execCommand('', '')
          }
        }, 50)
      }
    }
    return
  }
  if (!props.editorView) return // 如果编辑器不存在则返回
  insertHeading(props.editorView, level) // 插入标题
}

// 查找最近的标题（h1-h6，在同一行或之前）
const findNearestHeading = (container: HTMLElement, currentElement: HTMLElement): HTMLElement | null => {
  // 首先尝试在同一父元素下查找标题（同一行）
  let parent: HTMLElement | null = currentElement.parentElement
  while (parent && parent !== container) {
    // 查找同一父元素下的所有标题
    const siblings = Array.from(parent.children) as HTMLElement[]
    const currentIndex = siblings.indexOf(currentElement)
    
    // 向前查找同一父元素下的标题
    if (currentIndex >= 0) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const sibling = siblings[i]
        if (sibling && sibling.matches('h1, h2, h3, h4, h5, h6')) {
          return sibling
        }
      }
    }
    
    // 如果当前元素本身就是标题，返回它
    if (currentElement.matches('h1, h2, h3, h4, h5, h6')) {
      return currentElement
    }
    
    parent = parent.parentElement
  }
  
  // 如果同一父元素下没有找到，查找整个文档中最近的标题
  const allElements = Array.from(container.querySelectorAll('*'))
  let currentIndex = -1
  let searchElement = currentElement
  
  // 找到当前元素在文档中的位置
  while (searchElement && searchElement !== container) {
    const index = allElements.indexOf(searchElement)
    if (index !== -1) {
      currentIndex = index
      break
    }
    searchElement = searchElement.parentElement as HTMLElement
  }
  
  if (currentIndex === -1) {
    // 如果找不到位置，返回文档中最后一个标题
    const allHeadings = Array.from(container.querySelectorAll('h1, h2, h3, h4, h5, h6')) as HTMLElement[]
    if (allHeadings.length > 0) {
      return allHeadings[allHeadings.length - 1] || null
    }
    return null
  }
  
  // 向前查找最近的标题
  for (let i = currentIndex; i >= 0; i--) {
    const element = allElements[i] as HTMLElement
    if (element && element.matches('h1, h2, h3, h4, h5, h6')) {
      return element
    }
  }
  
  return null
}

// 查找最近的 h3 标题（在同一行或之前）- 保留用于兼容
const findNearestH3 = (container: HTMLElement, currentElement: HTMLElement): HTMLElement | null => {
  // 首先尝试在同一父元素下查找 h3（同一行）
  let parent: HTMLElement | null = currentElement.parentElement
  while (parent && parent !== container) {
    // 查找同一父元素下的所有 h3
    const siblings = Array.from(parent.children) as HTMLElement[]
    const currentIndex = siblings.indexOf(currentElement)
    
    // 向前查找同一父元素下的 h3
    if (currentIndex >= 0) {
      for (let i = currentIndex - 1; i >= 0; i--) {
        const sibling = siblings[i]
        if (sibling && sibling.tagName === 'H3') {
          return sibling
        }
      }
    }
    
    // 如果当前元素本身就是 h3，返回它
    if (currentElement.tagName === 'H3') {
      return currentElement
    }
    
    parent = parent.parentElement
  }
  
  // 如果同一父元素下没有找到，查找整个文档中最近的 h3
  const allElements = Array.from(container.querySelectorAll('*'))
  let currentIndex = -1
  let searchElement = currentElement
  
  // 找到当前元素在文档中的位置
  while (searchElement && searchElement !== container) {
    const index = allElements.indexOf(searchElement)
    if (index !== -1) {
      currentIndex = index
      break
    }
    searchElement = searchElement.parentElement as HTMLElement
  }
  
  if (currentIndex === -1) {
    // 如果找不到位置，返回文档中最后一个 h3
    const allH3s = Array.from(container.querySelectorAll('h3')) as HTMLElement[]
    if (allH3s.length > 0) {
      return allH3s[allH3s.length - 1] || null
    }
    return null
  }
  
  // 向前查找最近的 h3
  for (let i = currentIndex; i >= 0; i--) {
    const element = allElements[i] as HTMLElement
    if (element && element.tagName === 'H3') {
      return element
    }
  }
  
  return null
}

// 为无序列表项添加前缀（移除序号）
const addUnorderedListPrefix = (listElement: HTMLElement) => {
  const items = Array.from(listElement.querySelectorAll('li')) as HTMLElement[]
  items.forEach((li) => {
    const currentText = li.textContent || ''
    // 移除可能已有的编号前缀（如 "1. "）
    const textWithoutNumber = currentText.replace(/^\d+\.\s*/, '')
    // 移除可能已有的其他前缀（如 "• " 或 "- " 或 "."）
    const cleanText = textWithoutNumber.replace(/^[•\-\.]\s*/, '')
    
    // 添加前缀（不加粗）
    li.textContent = `. ${cleanText}`
  })
}

// 为有序列表项添加序号
const addOrderedListNumbering = (listElement: HTMLElement) => {
  const items = Array.from(listElement.querySelectorAll('li')) as HTMLElement[]
  items.forEach((li, index) => {
    const currentText = li.textContent || ''
    // 移除可能已有的编号前缀
    const textWithoutNumber = currentText.replace(/^\d+\.\s*/, '')
    // 移除可能已有的无序列表前缀
    const cleanText = textWithoutNumber.replace(/^[•\-\.]\s*/, '')
    
    // 添加序号（不加粗）
    li.textContent = `${index + 1}. ${cleanText}`
  })
}

// 处理无序列表
const handleUnorderedList = () => {
  if (props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      container.focus()
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        document.execCommand('insertUnorderedList', false)
        setTimeout(() => {
          const newSelection = window.getSelection()
          if (newSelection && newSelection.rangeCount > 0) {
            const newRange = newSelection.getRangeAt(0)
            let liElement = newRange.commonAncestorContainer as HTMLElement
            if (liElement.nodeType !== Node.ELEMENT_NODE) {
              liElement = liElement.parentElement as HTMLElement
            }
            while (liElement && liElement.tagName !== 'LI') {
              liElement = liElement.parentElement as HTMLElement
            }
            if (liElement && liElement.tagName === 'LI') {
              const list = liElement.closest('ul')
              if (list) {
                addUnorderedListPrefix(list as HTMLElement)
                props.wysiwygAdapter.execCommand('', '')
              }
            }
          }
        }, 50)
        return
      }
      
      const range = selection.getRangeAt(0)
      let currentElement = range.commonAncestorContainer as HTMLElement
      
      if (currentElement.nodeType !== Node.ELEMENT_NODE) {
        currentElement = currentElement.parentElement as HTMLElement
      }
      
      // 查找最近的 h3 标题
      const nearestH3 = findNearestH3(container, currentElement)
      
      if (nearestH3) {
        // 如果找到 h3，在 h3 后面插入列表
        const list = document.createElement('ul')
        const li = document.createElement('li')
        list.appendChild(li)
        
        // 设置列表样式，使其与 h3 对齐（h3 有 3em 的 padding-left）
        list.style.paddingLeft = '3em'
        list.style.marginLeft = '0'
        
        // 插入到 h3 的父元素中，h3 后面
        const parent = nearestH3.parentElement
        if (parent) {
          if (nearestH3.nextSibling) {
            parent.insertBefore(list, nearestH3.nextSibling)
          } else {
            parent.appendChild(list)
          }
          
          // 等待DOM更新后添加前缀
          setTimeout(() => {
            addUnorderedListPrefix(list)
            
            // 移动光标到列表项
            const newRange = document.createRange()
            newRange.selectNodeContents(li)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
            
            // 触发内容变化事件
            props.wysiwygAdapter.execCommand('', '')
          }, 10)
        } else {
          // 如果找不到父元素，使用默认行为
          document.execCommand('insertUnorderedList', false)
        }
      } else {
        // 如果没有找到 h3，使用默认行为并添加前缀
        document.execCommand('insertUnorderedList', false)
        setTimeout(() => {
          const newSelection = window.getSelection()
          if (newSelection && newSelection.rangeCount > 0) {
            const newRange = newSelection.getRangeAt(0)
            let liElement = newRange.commonAncestorContainer as HTMLElement
            if (liElement.nodeType !== Node.ELEMENT_NODE) {
              liElement = liElement.parentElement as HTMLElement
            }
            while (liElement && liElement.tagName !== 'LI') {
              liElement = liElement.parentElement as HTMLElement
            }
            if (liElement && liElement.tagName === 'LI') {
              const list = liElement.closest('ul')
              if (list) {
                addUnorderedListPrefix(list as HTMLElement)
                props.wysiwygAdapter.execCommand('', '')
              }
            }
          }
        }, 50)
      }
    } else {
      document.execCommand('insertUnorderedList', false)
    }
    return
  }
  if (!props.editorView) return // 如果编辑器不存在则返回
  insertList(props.editorView, false) // 插入无序列表
}

// 处理有序列表
const handleOrderedList = () => {
  if (props.wysiwygAdapter) {
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      container.focus()
      const selection = window.getSelection()
      if (!selection || selection.rangeCount === 0) {
        document.execCommand('insertOrderedList', false)
        setTimeout(() => {
          const newSelection = window.getSelection()
          if (newSelection && newSelection.rangeCount > 0) {
            const newRange = newSelection.getRangeAt(0)
            let liElement = newRange.commonAncestorContainer as HTMLElement
            if (liElement.nodeType !== Node.ELEMENT_NODE) {
              liElement = liElement.parentElement as HTMLElement
            }
            while (liElement && liElement.tagName !== 'LI') {
              liElement = liElement.parentElement as HTMLElement
            }
            if (liElement && liElement.tagName === 'LI') {
              const list = liElement.closest('ol')
              if (list) {
                const olElement = list as HTMLOListElement
                olElement.start = 1
                addOrderedListNumbering(list as HTMLElement)
                props.wysiwygAdapter.execCommand('', '')
              }
            }
          }
        }, 50)
        return
      }
      
      const range = selection.getRangeAt(0)
      let currentElement = range.commonAncestorContainer as HTMLElement
      
      if (currentElement.nodeType !== Node.ELEMENT_NODE) {
        currentElement = currentElement.parentElement as HTMLElement
      }
      
      // 查找最近的标题
      const nearestHeading = findNearestHeading(container, currentElement)
      
      if (nearestHeading) {
        // 如果找到标题，在标题后面插入列表
        const list = document.createElement('ol')
        const li = document.createElement('li')
        list.appendChild(li)
        
        // 根据标题级别设置缩进（h2: 1.5em, h3: 3em）
        const headingLevel = parseInt(nearestHeading.tagName.substring(1))
        if (headingLevel === 2) {
          list.style.paddingLeft = '1.5em'
        } else if (headingLevel === 3) {
          list.style.paddingLeft = '3em'
        } else {
          list.style.paddingLeft = '0'
        }
        list.style.marginLeft = '0'
        const olElement = list as HTMLOListElement
        olElement.start = 1
        
        // 插入到标题的父元素中，标题后面
        const parent = nearestHeading.parentElement
        if (parent) {
          if (nearestHeading.nextSibling) {
            parent.insertBefore(list, nearestHeading.nextSibling)
          } else {
            parent.appendChild(list)
          }
          
          // 等待DOM更新后添加序号
          setTimeout(() => {
            addOrderedListNumbering(list)
            
            // 移动光标到列表项
            const newRange = document.createRange()
            newRange.selectNodeContents(li)
            newRange.collapse(true)
            selection.removeAllRanges()
            selection.addRange(newRange)
            
            // 触发内容变化事件
            props.wysiwygAdapter.execCommand('', '')
          }, 10)
        } else {
          // 如果找不到父元素，使用默认行为
          document.execCommand('insertOrderedList', false)
        }
      } else {
        // 如果没有找到 h3，使用默认行为并添加序号
        document.execCommand('insertOrderedList', false)
        setTimeout(() => {
          const newSelection = window.getSelection()
          if (newSelection && newSelection.rangeCount > 0) {
            const newRange = newSelection.getRangeAt(0)
            let liElement = newRange.commonAncestorContainer as HTMLElement
            if (liElement.nodeType !== Node.ELEMENT_NODE) {
              liElement = liElement.parentElement as HTMLElement
            }
            while (liElement && liElement.tagName !== 'LI') {
              liElement = liElement.parentElement as HTMLElement
            }
            if (liElement && liElement.tagName === 'LI') {
              const list = liElement.closest('ol')
              if (list) {
                const olElement = list as HTMLOListElement
                olElement.start = 1
                addOrderedListNumbering(list as HTMLElement)
                props.wysiwygAdapter.execCommand('', '')
              }
            }
          }
        }, 50)
      }
    } else {
      document.execCommand('insertOrderedList', false)
    }
    return
  }
  if (!props.editorView) return // 如果编辑器不存在则返回
  insertList(props.editorView, true) // 插入有序列表
}

// 处理引用
const handleQuote = () => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：使用 formatBlock 命令
    props.wysiwygAdapter.execCommand('formatBlock', 'blockquote')
    return
  }
  if (!props.editorView) {
    console.warn('编辑器未初始化') // 调试信息
    return // 如果编辑器不存在则返回
  }
  
  // 获取最新的state和selection
  const state = props.editorView.state // 获取最新状态
  const selection = state.selection.main // 获取主选择区域
  const selectedText = state.sliceDoc(selection.from, selection.to) // 获取选中文本
  
  if (selectedText) {
    // 如果有选中文本，每行前添加引用符号
    const lines = selectedText.split('\n') // 按行分割
    const quotedText = lines.map((line: string) => `> ${line}`).join('\n') // 每行前添加引用符号
    
    props.editorView.dispatch({
      changes: {
        from: selection.from, // 从选中开始位置
        to: selection.to, // 到选中结束位置
        insert: quotedText, // 插入引用格式
      },
      selection: {
        anchor: selection.from + quotedText.length, // 光标移到末尾
      },
    })
  } else {
    // 如果没有选中文本，插入引用模板
    props.editorView.dispatch({
      changes: {
        from: selection.from, // 从光标位置
        to: selection.to, // 到光标位置
        insert: '> ', // 插入引用前缀
      },
      selection: {
        anchor: selection.from + 2, // 光标在引用后
      },
    })
  }
  props.editorView.focus() // 聚焦编辑器
}

// 处理行内代码
const handleInlineCode = () => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：包装 code 标签
    props.wysiwygAdapter.wrapText('<code>', '</code>')
    return
  }
  if (!props.editorView) {
    console.warn('编辑器未初始化') // 调试信息
    return // 如果编辑器不存在则返回
  }
  insertCodeBlock(props.editorView, true) // 插入行内代码
}

// 处理代码块
const handleCodeBlock = () => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：插入 pre 和 code 标签，支持 Vue 语法高亮
    const container = props.wysiwygAdapter.wysiwygContainer.value
    if (container) {
      container.focus()
      const selection = window.getSelection()
      const range = selection?.getRangeAt(0)
      
      if (range) {
        // 获取选中的文本（如果有）
        const selectedText = selection?.toString() || ''
        
        const pre = document.createElement('pre')
        const code = document.createElement('code')
        
        // 自动检测语言（Python 或 Vue）
        code.contentEditable = 'true' // 使代码块可编辑
        code.setAttribute('spellcheck', 'false')
        code.textContent = selectedText || '\n'
        
        pre.appendChild(code)
        range.insertNode(pre)
        
        // 在代码块后插入一个段落，确保可以继续编辑
        const p = document.createElement('p')
        p.innerHTML = '<br>'
        if (pre.nextSibling) {
          pre.parentNode?.insertBefore(p, pre.nextSibling)
        } else {
          pre.parentNode?.appendChild(p)
        }
        
        // 移动光标到代码块内
        if (selectedText) {
          // 如果有选中文本，光标移到末尾
          range.setStart(code, code.textContent.length)
          range.setEnd(code, code.textContent.length)
        } else {
          // 如果没有选中文本，光标在代码块内
          range.setStart(code, 0)
          range.setEnd(code, 0)
        }
        selection?.removeAllRanges()
        selection?.addRange(range)
        
        // 等待 DOM 更新后，手动触发 highlight.js 高亮
        setTimeout(() => {
          if (code && container) {
            try {
              // 使用 highlight.js 自动检测语言（支持 Python 和 Vue）
              const codeText = code.textContent || ''
              if (codeText.trim()) {
                // 自动检测语言（优先检测 Python 和 Vue）
                const highlighted = hljs.highlightAuto(codeText, ['python', 'vue', 'javascript', 'typescript'])
                const detectedLang = highlighted.language || 'python' // 默认使用 Python
                code.innerHTML = highlighted.value
                code.className = `language-${detectedLang} hljs`
              } else {
                // 如果没有内容，默认使用 Python
                code.className = 'language-python hljs'
              }
              
              // 触发内容变化事件（这会自动添加工具栏）
              props.wysiwygAdapter.execCommand('', '')
            } catch (error) {
              console.warn('代码高亮失败:', error)
              code.className = 'language-python hljs'
              props.wysiwygAdapter.execCommand('', '')
            }
          }
        }, 50)
      }
    }
    return
  }
  if (!props.editorView) {
    console.warn('编辑器未初始化') // 调试信息
    return // 如果编辑器不存在则返回
  }
  // 插入代码块时默认使用 Vue 语言标识
  const selectedText = getSelectedText(props.editorView)
  if (selectedText) {
    // 如果有选中文本，插入带 Vue 标识的代码块
    const state = props.editorView.state
    const selection = state.selection.main
    props.editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: `\`\`\`vue\n${selectedText}\n\`\`\``,
      },
      selection: {
        anchor: selection.from + 7 + selectedText.length, // 光标在代码块内
      },
    })
  } else {
    // 如果没有选中文本，插入 Vue 代码块模板
    const state = props.editorView.state
    const selection = state.selection.main
    props.editorView.dispatch({
      changes: {
        from: selection.from,
        to: selection.to,
        insert: '```vue\n\n```',
      },
      selection: {
        anchor: selection.from + 7, // 光标在代码块内
      },
    })
  }
  props.editorView.focus()
}

// 处理链接
const handleLink = () => {
  if (props.wysiwygAdapter) {
    // 所见即所得模式：使用 createLink 命令
    const url = prompt('请输入链接地址:', 'https://')
    if (url) {
      props.wysiwygAdapter.execCommand('createLink', url)
    }
    return
  }
  if (!props.editorView) {
    console.warn('编辑器未初始化') // 调试信息
    return // 如果编辑器不存在则返回
  }
  insertLink(props.editorView) // 插入链接
}

// 上传组件引用
const uploadRef = ref<UploadInstance>()

// 处理图片上传
const handleImageUpload = async (uploadFile: UploadFile) => {
  const file = uploadFile.raw // 获取原始文件对象

  if (!file) {
    return // 如果没有文件则返回
  }

  // 验证文件大小（最大 10MB）
  if (!validateImageSize(file, 10 * 1024 * 1024)) {
    ElMessage.warning('图片文件大小不能超过 10MB') // 提示文件过大
    // 清空文件列表
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
    return
  }

  try {
    // 将图片文件转换为 base64 Data URL
    const dataURL = await fileToDataURL(file)
    
    // 获取文件名（不含扩展名）作为 alt 文本
    const fileName = file.name.replace(/\.[^/.]+$/, '') // 移除文件扩展名
    
    if (props.wysiwygAdapter) {
      // 所见即所得模式：直接插入 img 标签
      const container = props.wysiwygAdapter.wysiwygContainer.value
      if (container) {
        container.focus()
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
          
          range.insertNode(img)
          
          // 移动光标到图片后面
          range.setStartAfter(img)
          range.collapse(true)
          selection?.removeAllRanges()
          selection?.addRange(range)
          
          props.wysiwygAdapter.execCommand('', '')
        }
      }
    } else if (props.editorView) {
      // 插入图片到编辑器
      insertImage(props.editorView, dataURL, fileName) // 插入图片，使用文件名作为alt文本
    } else {
      console.warn('编辑器未初始化') // 调试信息
    }
  } catch (error) {
    console.error('处理图片失败:', error) // 输出错误信息
    ElMessage.error('处理图片失败，请确保文件是有效的图片格式') // 提示错误
  } finally {
    // 清空文件列表，以便可以再次选择同一文件
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
  }
}

// 处理清空内容
const handleClear = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有内容吗？',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    // 确认对话框
    editorStore.clearContent() // 清空内容
    if (props.wysiwygAdapter) {
      // 所见即所得模式：清空容器内容
      const container = props.wysiwygAdapter.wysiwygContainer.value
      if (container) {
        container.innerHTML = ''
        container.focus()
      }
    } else if (props.editorView) {
      // 如果编辑器存在，也清空编辑器内容
      const transaction = props.editorView.state.update({
        changes: {
          from: 0,
          to: props.editorView.state.doc.length,
          insert: '',
        },
      })
      props.editorView.dispatch(transaction) // 应用更改
      props.editorView.focus() // 聚焦编辑器
    }
  } catch {
    // 用户取消操作，不做任何处理
  }
}

// 处理保存
const handleSave = () => {
  try {
    // 将 Markdown 内容保存到 localStorage
    localStorage.setItem('markdown-content', editorStore.markdownContent)
    ElMessage.success('内容已保存到本地存储') // 提示保存成功
  } catch (error) {
    console.error('保存失败:', error) // 输出错误信息
    ElMessage.error('保存失败，请重试') // 提示保存失败
  }
}

// 处理导出HTML
const handleExport = () => {
  exportToHTML(editorStore.markdownContent, 'markdown-export') // 导出为HTML文件
}
</script>

<style scoped>
/* 工具栏样式 */
.toolbar {
  min-height: 3rem; /* 最小高度 */
}

.toolbar-group {
  display: flex; /* 弹性布局 */
  align-items: center; /* 垂直居中 */
}
</style>

