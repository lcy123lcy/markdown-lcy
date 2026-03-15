# 变更提案：修复 TypeScript 类型检查与构建

## 动机

`npm run type-check` 与 `npm run build` 当前均失败，共 24 个 TypeScript 错误。需修复以保障功能实现的完整性与正确性。

## 发现的问题分类

### 1. 类型声明缺失

| 位置 | 问题 |
|------|------|
| `highlightjs-vue` | 无 `@types/highlightjs-vue`，隐式 any |
| MarkdownEditor.vue L61, Toolbar.vue L293, markdown.ts L10 | 同上 |

**建议**：在 `src/env.d.ts` 或新建 `src/types/highlightjs-vue.d.ts` 中添加 `declare module 'highlightjs-vue'`。

### 2. marked 配置不兼容

| 位置 | 问题 |
|------|------|
| markdown.ts L56 | `highlight` 不在 `MarkedOptions` 中（marked 16.x API 变更） |

**建议**：查阅 marked 16 文档，使用正确的 highlight 配置方式（如 `marked.use({ highlight })` 或扩展类型）。

### 3. 可选链与空值检查

| 位置 | 问题 |
|------|------|
| Toolbar.vue | `props.wysiwygAdapter` 可能为 null/undefined，多处使用未加 `?.` 或判空 |
| Toolbar.vue L665-682 | `heading` 可能 undefined，`stack[stack.length - 1]` 可能 undefined |
| toc.ts L48, L55 | `stack[stack.length - 1]` 可能 undefined |
| image.ts L53-54 | `items[i]` 即 `item` 可能 undefined |

**建议**：在访问前加可选链或显式判空。

### 4. 未使用变量

| 位置 | 问题 |
|------|------|
| Toolbar.vue L476 | `saveSelection` 声明未使用 |
| Toolbar.vue L1154 | `handleQuote` 声明未使用 |
| Toolbar.vue L1202 | `handleInlineCode` 声明未使用 |

**建议**：删除或接入到 UI（若功能未实现则删除并移除对应按钮占位）。

### 5. EditorView 类型不匹配

| 位置 | 问题 |
|------|------|
| MarkdownEditor.vue L4 | 传入 Toolbar 的 `editorView` 实际为 contenteditable 的占位对象，类型与 `EditorView` 不兼容 |

**建议**：放宽 Toolbar 的 `editorView` 类型为 `EditorView | null | WysiwygPlaceholder`，或在使用 WYSIWYG 时传 `null` 并确保 Toolbar 不依赖 EditorView。

## 验收标准

- [x] `npm run type-check` 通过
- [ ] `npm run build` 通过（需 Node.js 18+，当前环境若为 Node 16 会报 `crypto.getRandomValues`）
- [ ] 现有功能（编辑、导出 MD/HTML、目录、统计）行为不变

## 影响范围

- `src/components/Toolbar.vue`
- `src/components/MarkdownEditor.vue`
- `src/utils/markdown.ts`
- `src/utils/toc.ts`
- `src/utils/image.ts`
- `src/env.d.ts` 或新建类型声明文件
