/**
 * 图片处理工具函数
 */

/**
 * 将图片文件转换为 base64 Data URL
 * @param file - 图片文件对象
 * @returns Promise<string> - base64 Data URL
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // 检查文件类型是否为图片
    if (!file.type.startsWith('image/')) {
      reject(new Error('文件必须是图片格式')) // 如果不是图片则拒绝
      return
    }

    const reader = new FileReader() // 创建文件读取器

    // 读取成功回调
    reader.onload = (e) => {
      const result = e.target?.result // 获取读取结果
      if (typeof result === 'string') {
        resolve(result) // 返回 base64 Data URL
      } else {
        reject(new Error('读取文件失败')) // 如果结果不是字符串则拒绝
      }
    }

    // 读取失败回调
    reader.onerror = () => {
      reject(new Error('读取文件时发生错误')) // 读取失败时拒绝
    }

    // 开始读取文件为 Data URL
    reader.readAsDataURL(file)
  })
}

/**
 * 从剪贴板获取图片
 * @param clipboardData - 剪贴板数据对象
 * @returns File | null - 图片文件对象，如果没有图片则返回 null
 */
export function getImageFromClipboard(clipboardData: DataTransfer): File | null {
  const items = clipboardData.items // 获取剪贴板项数组

  // 遍历剪贴板项
  for (let i = 0; i < items.length; i++) {
    const item = items[i] // 获取当前项

    // 检查是否为图片类型
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile() // 获取文件对象
      return file // 返回图片文件
    }
  }

  return null // 如果没有找到图片则返回 null
}

/**
 * 验证图片文件大小（默认最大 10MB）
 * @param file - 图片文件对象
 * @param maxSize - 最大文件大小（字节），默认 10MB
 * @returns boolean - 是否在允许的大小范围内
 */
export function validateImageSize(file: File, maxSize: number = 10 * 1024 * 1024): boolean {
  return file.size <= maxSize // 检查文件大小是否在限制内
}


