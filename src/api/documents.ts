/**
 * Markdown 文档 API 服务
 */

import { apiFetch } from './client'

export interface Document {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const API_ERR_MSG =
  '请确保后端已启动：在 markdown-lcy-backend 目录运行 pnpm run dev'

export async function fetchDocuments(): Promise<Document[]> {
  const res = await apiFetch('/documents')
  if (!res.ok) {
    const msg = res.status === 500 ? API_ERR_MSG : `获取文档列表失败: ${res.status}`
    throw new Error(msg)
  }
  return res.json()
}

export async function fetchDocument(id: string): Promise<Document> {
  const res = await apiFetch(`/documents/${id}`)
  if (!res.ok) throw new Error(`获取文档失败: ${res.status}`)
  return res.json()
}

export async function createDocument(
  title?: string,
  content?: string
): Promise<Document> {
  const res = await apiFetch('/documents', {
    method: 'POST',
    body: JSON.stringify({ title: title ?? '未命名文档', content: content ?? '' }),
  })
  if (!res.ok) {
    const msg = res.status === 500 ? API_ERR_MSG : `创建文档失败: ${res.status}`
    throw new Error(msg)
  }
  return res.json()
}

export async function updateDocument(
  id: string,
  data: { title?: string; content?: string }
): Promise<Document> {
  const res = await apiFetch(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`更新文档失败: ${res.status}`)
  return res.json()
}

export async function deleteDocument(id: string): Promise<void> {
  const res = await apiFetch(`/documents/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`删除文档失败: ${res.status}`)
}
