import type { EditorView } from '@codemirror/view' // 导入CodeMirror视图类型

/**
 * 获取编辑器当前选中的文本
 * @param view - CodeMirror编辑器视图实例
 * @returns 选中的文本内容
 */
export function getSelectedText(view: EditorView): string {
  const selection = view.state.selection.main // 获取主选择区域
  return view.state.sliceDoc(selection.from, selection.to) // 返回选中的文本
}

/**
 * 获取当前光标位置
 * @param view - CodeMirror编辑器视图实例
 * @returns 光标位置对象
 */
export function getCursorPosition(view: EditorView): { from: number; to: number } {
  const selection = view.state.selection.main // 获取主选择区域
  return { from: selection.from, to: selection.to } // 返回光标位置
}

/**
 * 在光标位置插入文本
 * @param view - CodeMirror编辑器视图实例
 * @param text - 要插入的文本
 */
export function insertText(view: EditorView, text: string): void {
  if (!view) return // 如果编辑器不存在则返回
  
  // 获取最新的state和selection
  const state = view.state // 获取最新状态
  const selection = state.selection.main // 获取主选择区域
  
  view.dispatch({
    changes: {
      from: selection.from, // 从光标位置开始
      to: selection.to, // 到光标位置结束（如果有选中文本则替换）
      insert: text, // 插入的文本
    },
    selection: {
      anchor: selection.from + text.length, // 插入后光标位置
    },
  })
  view.focus() // 聚焦编辑器
}

/**
 * 环绕选中文本
 * @param view - CodeMirror编辑器视图实例
 * @param prefix - 前缀文本
 * @param suffix - 后缀文本
 */
export function wrapText(view: EditorView, prefix: string, suffix: string = prefix): void {
  if (!view) return // 如果编辑器不存在则返回
  
  // 获取最新的state和selection
  const state = view.state // 获取最新状态
  const selection = state.selection.main // 获取主选择区域
  const selectedText = state.sliceDoc(selection.from, selection.to) // 获取选中文本
  
  // 如果已有选中文本，则环绕它
  if (selectedText) {
    view.dispatch({
      changes: {
        from: selection.from, // 从选中开始位置
        to: selection.to, // 到选中结束位置
        insert: `${prefix}${selectedText}${suffix}`, // 环绕后的文本
      },
      selection: {
        anchor: selection.from + prefix.length + selectedText.length + suffix.length, // 光标移到末尾
      },
    })
  } else {
    // 如果没有选中文本，则插入前缀和后缀，光标在中间
    view.dispatch({
      changes: {
        from: selection.from, // 从光标位置
        to: selection.to, // 到光标位置
        insert: `${prefix}${suffix}`, // 插入前缀和后缀
      },
      selection: {
        anchor: selection.from + prefix.length, // 光标在中间
      },
    })
  }
  view.focus() // 聚焦编辑器
}

/**
 * 插入标题
 * @param view - CodeMirror编辑器视图实例
 * @param level - 标题级别（1-6）
 */
export function insertHeading(view: EditorView, level: number): void {
  if (!view) return // 如果编辑器不存在则返回
  
  // 获取最新的state和selection
  const state = view.state // 获取最新状态
  const selection = state.selection.main // 获取主选择区域
  const selectedText = state.sliceDoc(selection.from, selection.to) // 获取选中文本
  const prefix = '#'.repeat(level) + ' ' // 生成标题前缀
  
  if (selectedText) {
    // 如果有选中文本，替换为标题格式
    view.dispatch({
      changes: {
        from: selection.from, // 从选中开始位置
        to: selection.to, // 到选中结束位置
        insert: `${prefix}${selectedText}`, // 插入标题格式
      },
      selection: {
        anchor: selection.from + prefix.length + selectedText.length, // 光标移到末尾
      },
    })
  } else {
    // 如果没有选中文本，插入标题格式
    view.dispatch({
      changes: {
        from: selection.from, // 从光标位置
        to: selection.to, // 到光标位置
        insert: `${prefix}`, // 插入标题前缀
      },
      selection: {
        anchor: selection.from + prefix.length, // 光标在标题后
      },
    })
  }
  view.focus() // 聚焦编辑器
}

/**
 * 插入代码块
 * @param view - CodeMirror编辑器视图实例
 * @param inline - 是否为行内代码
 */
export function insertCodeBlock(view: EditorView, inline: boolean = false): void {
  if (!view) return // 如果编辑器不存在则返回
  
  if (inline) {
    // 行内代码
    wrapText(view, '`', '`') // 使用反引号环绕
  } else {
    // 代码块
    // 获取最新的state和selection
    const state = view.state // 获取最新状态
    const selection = state.selection.main // 获取主选择区域
    const selectedText = state.sliceDoc(selection.from, selection.to) // 获取选中文本
    
    if (selectedText) {
      // 如果有选中文本，环绕为代码块
      view.dispatch({
        changes: {
          from: selection.from, // 从选中开始位置
          to: selection.to, // 到选中结束位置
          insert: `\`\`\`\n${selectedText}\n\`\`\``, // 插入代码块格式
        },
        selection: {
          anchor: selection.from + 4 + selectedText.length + 1, // 光标在代码块内
        },
      })
    } else {
      // 如果没有选中文本，插入代码块模板
      view.dispatch({
        changes: {
          from: selection.from, // 从光标位置
          to: selection.to, // 到光标位置
          insert: '```\n\n```', // 插入代码块模板
        },
        selection: {
          anchor: selection.from + 4, // 光标在代码块内
        },
      })
    }
    view.focus() // 聚焦编辑器
  }
}

/**
 * 插入链接
 * @param view - CodeMirror编辑器视图实例
 */
export function insertLink(view: EditorView): void {
  if (!view) return // 如果编辑器不存在则返回
  
  // 获取最新的state和selection
  const state = view.state // 获取最新状态
  const selection = state.selection.main // 获取主选择区域
  const selectedText = state.sliceDoc(selection.from, selection.to) // 获取选中文本
  
  if (selectedText) {
    // 如果有选中文本，作为链接文本
    view.dispatch({
      changes: {
        from: selection.from, // 从选中开始位置
        to: selection.to, // 到选中结束位置
        insert: `[${selectedText}](url)`, // 插入链接格式
      },
      selection: {
        anchor: selection.from + selectedText.length + 3, // 光标在url位置
        head: selection.from + selectedText.length + 6, // 选中url文本
      },
    })
  } else {
    // 如果没有选中文本，插入链接模板
    view.dispatch({
      changes: {
        from: selection.from, // 从光标位置
        to: selection.to, // 到光标位置
        insert: '[链接文本](url)', // 插入链接模板
      },
      selection: {
        anchor: selection.from + 1, // 光标在链接文本位置
        head: selection.from + 5, // 选中"链接文本"
      },
    })
  }
  view.focus() // 聚焦编辑器
}

/**
 * 插入图片
 * @param view - CodeMirror编辑器视图实例
 * @param imageUrl - 图片URL（可选，如果不提供则插入模板）
 * @param altText - 图片alt文本（可选）
 */
export function insertImage(view: EditorView, imageUrl?: string, altText?: string): void {
  if (!view) return // 如果编辑器不存在则返回
  
  // 获取最新的state和selection
  const state = view.state // 获取最新状态
  const selection = state.selection.main // 获取主选择区域
  const selectedText = state.sliceDoc(selection.from, selection.to) // 获取选中文本
  
  // 确定alt文本和图片URL
  const finalAltText = altText || selectedText || '图片' // 优先使用参数，其次选中文本，最后默认值
  const finalImageUrl = imageUrl || 'image-url' // 如果没有提供URL则使用占位符
  
  // 插入图片Markdown语法
  const imageMarkdown = `![${finalAltText}](${finalImageUrl})` // 生成图片Markdown语法
  
  view.dispatch({
    changes: {
      from: selection.from, // 从选中开始位置
      to: selection.to, // 到选中结束位置
      insert: imageMarkdown, // 插入图片Markdown语法
    },
    selection: {
      anchor: selection.from + imageMarkdown.length, // 光标移到图片语法后
    },
  })
  view.focus() // 聚焦编辑器
}

/**
 * 插入列表项
 * @param view - CodeMirror编辑器视图实例
 * @param ordered - 是否为有序列表
 */
export function insertList(view: EditorView, ordered: boolean = false): void {
  if (!view) return // 如果编辑器不存在则返回
  
  // 获取最新的state和selection
  const state = view.state // 获取最新状态
  const selection = state.selection.main // 获取主选择区域
  const selectedText = state.sliceDoc(selection.from, selection.to) // 获取选中文本
  
  if (selectedText) {
    // 如果有选中文本，转换为列表项
    const lines = selectedText.split('\n') // 按行分割
    const listItems = lines
      .map((line, index) => {
        if (ordered) {
          return `${index + 1}. ${line}` // 有序列表格式
        } else {
          return `- ${line}` // 无序列表格式
        }
      })
      .join('\n') // 重新组合
    
    view.dispatch({
      changes: {
        from: selection.from, // 从选中开始位置
        to: selection.to, // 到选中结束位置
        insert: listItems, // 插入列表格式
      },
      selection: {
        anchor: selection.from + listItems.length, // 光标移到末尾
      },
    })
  } else {
    // 如果没有选中文本，插入列表项模板
    const prefix = ordered ? '1. ' : '- ' // 列表前缀
    view.dispatch({
      changes: {
        from: selection.from, // 从光标位置
        to: selection.to, // 到光标位置
        insert: prefix, // 插入列表前缀
      },
      selection: {
        anchor: selection.from + prefix.length, // 光标在列表项后
      },
    })
  }
  view.focus() // 聚焦编辑器
}

