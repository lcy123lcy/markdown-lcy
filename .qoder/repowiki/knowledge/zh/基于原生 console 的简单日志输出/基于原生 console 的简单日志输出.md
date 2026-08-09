---
kind: logging_system
name: 基于原生 console 的简单日志输出
category: logging_system
scope:
    - '**'
source_files:
    - src/main.ts
    - src/components/MarkdownEditor.vue
    - src/components/Toolbar.vue
    - src/components/DocumentSidebar.vue
    - src/utils/markdown.ts
    - package.json
---

## 1. 使用的系统/方案

该前端工程**没有引入任何第三方日志框架**（如 winston、pino、log4js、bunyan、debug 等），也没有定义统一的 logger 模块或日志级别管理。所有日志输出均直接使用浏览器原生的 `console` API（`console.log`、`console.warn`、`console.error`）。

从 `package.json` 依赖中可见，项目仅包含 Vue3、Pinia、Element Plus、CodeMirror、marked、highlight.js 等业务与 UI 相关依赖，无任何日志库。

## 2. 关键文件

- `src/main.ts`：应用入口，未进行任何全局日志配置或拦截。
- `src/components/MarkdownEditor.vue`：编辑器核心组件，集中了大量 `console.warn` / `console.error`，用于记录代码高亮失败、复制失败、保存失败、加载文档失败等异常场景。
- `src/components/Toolbar.vue`：工具栏组件，使用 `console.warn` 记录“编辑器未初始化”“代码高亮失败”“恢复选中状态失败”等调试信息。
- `src/components/DocumentSidebar.vue`：侧边栏组件，在异步操作失败时通过 `console.error(e)` 输出错误堆栈。
- `src/utils/markdown.ts`：Markdown 处理工具，在动态导入 Vue 语言支持失败时使用 `console.warn` 提示。

## 3. 架构与约定

- **无中心化日志层**：不存在 `src/utils/logger.ts` 之类的统一封装，各组件自行调用 `console.*`。
- **无日志级别策略**：未区分 info/debug/warn/error 的业务语义，仅按 `console` 原生命令混用。
- **无结构化字段**：日志均为字符串拼接或模板字符串，不包含时间戳、模块名、请求 ID、用户上下文等结构化字段。
- **无日志路由/收集**：未将日志发送到后端、Sentry、ELK 等外部 sink，仅在浏览器控制台输出。
- **无构建期开关**：未使用 `process.env.NODE_ENV`、Vite 环境变量或 `vite.config.ts` 中的插件来过滤 `console` 输出。

## 4. 约定与约束

- **约定（描述性）**：在可预见的异常分支中使用 `console.error` 输出错误原因；在可恢复的降级场景（如语言包加载失败、编辑器未初始化）中使用 `console.warn` 输出警告；调试信息以注释形式附加在 `console.warn` 行末（例如 `// 调试信息`、`// 输出错误信息`）。
- **约束（实际存在）**：由于没有任何日志框架或 ESLint/Vite 规则强制，当前仓库对日志的使用是松散的——同一文件中既有 `console.log` 也有 `console.warn` 和 `console.error`，且未做环境隔离。若未来需要统一日志体系，需新增专用 logger 模块并在 `main.ts` 中初始化。

综上，该项目的“日志系统”本质上就是浏览器 `console` 的直接使用，尚未形成可复用的日志基础设施。