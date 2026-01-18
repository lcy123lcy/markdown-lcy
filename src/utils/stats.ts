/**
 * 统计文本的字符数（不含空格）
 * @param text - 要统计的文本
 * @returns 字符数
 */
export function countCharacters(text: string): number {
  return text.replace(/\s/g, '').length // 移除所有空格后计算长度
}

/**
 * 统计文本的字符数（含空格）
 * @param text - 要统计的文本
 * @returns 字符数（含空格）
 */
export function countCharactersWithSpaces(text: string): number {
  return text.length // 直接返回文本长度
}

/**
 * 统计文本的单词数
 * @param text - 要统计的文本
 * @returns 单词数
 */
export function countWords(text: string): number {
  if (!text.trim()) return 0 // 如果文本为空则返回0
  
  // 按空格、换行、制表符等分割文本
  const words = text.trim().split(/\s+/).filter(word => word.length > 0) // 过滤空字符串
  return words.length // 返回单词数量
}

/**
 * 统计文本的行数
 * @param text - 要统计的文本
 * @returns 行数
 */
export function countLines(text: string): number {
  if (!text) return 0 // 如果文本为空则返回0
  return text.split('\n').length // 按换行符分割并计算行数
}

/**
 * 获取文本统计信息
 * @param text - 要统计的文本
 * @returns 统计信息对象
 */
export function getTextStats(text: string) {
  return {
    characters: countCharacters(text), // 字符数（不含空格）
    charactersWithSpaces: countCharactersWithSpaces(text), // 字符数（含空格）
    words: countWords(text), // 单词数
    lines: countLines(text), // 行数
  }
}

