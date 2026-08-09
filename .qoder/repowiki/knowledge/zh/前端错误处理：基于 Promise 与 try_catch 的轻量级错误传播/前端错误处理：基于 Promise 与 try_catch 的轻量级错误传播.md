---
kind: error_handling
name: 前端错误处理：基于 Promise 与 try/catch 的轻量级错误传播
category: error_handling
scope:
    - '**'
source_files:
    - src/api/client.ts
    - src/api/auth.ts
    - src/api/documents.ts
    - src/stores/auth.ts
    - src/views/Login.vue
    - src/utils/image.ts
    - src/main.ts
---

## 1. 整体方案

该仓库是一个 Vite + Vue 3 + Pinia 的前端工程，**没有引入全局错误边界、自定义 Error 类或统一错误码枚举**。错误处理采用最基础的 JavaScript 原生模式：
- API 层通过 `fetch` 返回的 `Response.ok` / `status` 判断成功与否，失败时直接 `throw new Error(...)`。
- Store 和 View 层使用 `try/catch` 捕获并展示错误信息（如登录页的 `error` ref）。
- 认证相关请求通过 `apiFetch` 在客户端自动处理 401 并重试，失败则清理本地状态并跳转到 `/login`。
- 工具函数（如 `utils/image.ts`）通过 Promise `reject(new Error(...))` 传递错误。

整个项目**没有**定义统一的错误类型（如 `ApiError`）、错误码常量、全局 `unhandledrejection`/`uncaughtexception` 监听，也没有使用 Element Plus 的 Message/Notification 组件集中提示错误。

## 2. 关键文件与位置

| 文件 | 职责 |
|---|---|
| `src/api/client.ts` | 封装 `apiFetch`，自动附加 `Authorization`，拦截 401 调用 `authStore.refresh()` 重试，失败后 `clearAuth()` 并跳转 `/login` |
| `src/api/auth.ts` | 认证接口；`res.ok` 为假时从响应体取 `data.message` 或回退到中文提示，再 `throw new Error(...)` |
| `src/api/documents.ts` | 文档 CRUD；对 500 错误特殊处理，抛出包含后端启动提示的错误消息 |
| `src/stores/auth.ts` | 持久化 token；`loadStored` 用 `try/catch(JSON.parse)` 容错；`fetchUser` 失败时 `clearAuth()`；`refresh` 无刷新令牌时抛错 |
| `src/views/Login.vue` | 页面级 `try/catch`，将 `e instanceof Error ? e.message : '登录失败'` 写入 `error` ref 渲染 |
| `src/utils/image.ts` | Promise 风格工具函数，校验失败 `reject(new Error(...))` |
| `src/main.ts` | **未注册**全局错误处理器（无 `window.onerror`、`unhandledrejection` 等） |

## 3. 架构与约定

### 3.1 网络层错误模型
- 所有 API 函数遵循同一约定：**成功返回 JSON，失败 `throw new Error(message)`**。调用方无需检查 `Response`，只需 catch。
- 401 不交给业务层处理，由 `client.ts` 的 `apiFetch` 统一拦截：尝试 refresh → 成功则带 `retried=true` 重试原请求 → 失败则清除认证并跳转登录页。
- 500 错误被识别为“后端未启动”，抛出固定提示：`请确保后端已启动：在 markdown-lcy-backend 目录运行 pnpm run dev`。

### 3.2 状态层错误模型
- `stores/auth.ts` 中 `loadStored` 对 `localStorage` 损坏数据做静默容错（`catch` 后返回 `null`），保证应用启动不被脏数据阻断。
- `fetchUser` 失败时调用 `clearAuth()` 主动登出，避免持有无效用户态。
- `refresh` 在无刷新令牌时显式 `throw new Error('无刷新令牌')`，让上层能区分“无令牌”与“网络错误”。

### 3.3 视图层错误呈现
- 以 `Login.vue` 为代表：每个异步操作前清空 `error` ref，成功后重定向，失败时写入 `error` 并通过 `<p v-if="error" class="text-error">` 渲染。
- 未看到其他页面统一错误处理逻辑，推测各 View 自行管理局部 `error` 状态。

### 3.4 工具层错误模型
- `utils/image.ts` 使用 Promise reject + `new Error(人类可读消息)` 的方式表达校验失败（如非图片格式、读取失败）。调用方需 `.catch` 或 `try/catch` 处理。

## 4. 约定与约束

可观察到的约定（来自代码实现模式，而非显式文档）：
1. **API 函数一律 throw `Error`**：`auth.ts`、`documents.ts` 中所有 `!res.ok` 分支都 `throw new Error(...)`，调用方统一用 `try/catch` 处理。
2. **错误消息优先取自后端 `data.message`**：登录/注册接口先尝试解析响应体中的 `message` 字段，不存在则回退到硬编码中文提示。
3. **401 不在业务层处理**：所有需要鉴权的请求走 `apiFetch`，由它统一处理 refresh 流程，业务层只关心成功结果。
4. **500 视为后端不可用**：文档列表/创建接口对 500 返回特定引导消息，帮助开发者快速定位问题。
5. **本地存储读取必须 try/catch**：`loadStored` 对 `JSON.parse` 包裹 try/catch，防止脏数据导致应用崩溃。
6. **无全局错误边界**：`main.ts` 未注册 `app.config.errorHandler`、`window.onerror`、`unhandledrejection` 等，未捕获的 Promise 拒绝会直接暴露给浏览器控制台。
7. **无统一错误类型/错误码**：项目中未发现自定义 Error 子类、错误码枚举或错误分类体系，所有错误都是裸 `Error` 实例。
8. **UI 错误提示分散**：仅登录页有 `error` ref + 模板渲染，其他页面未见统一的消息提示组件调用。