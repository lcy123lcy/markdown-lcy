---
kind: configuration_system
name: Vite + Tailwind + OpenSpec 多源配置体系
category: configuration_system
scope:
    - '**'
source_files:
    - vite.config.ts
    - package.json
    - tailwind.config.js
    - postcss.config.js
    - src/env.d.ts
    - src/vite-env.d.ts
    - src/api/client.ts
    - openspec/config.yaml
---

## 1. 使用的系统与框架

本项目采用 **Vite** 作为构建与开发服务器，通过 `vite.config.ts` 集中管理构建、别名、代理等配置；样式层使用 **Tailwind CSS + DaisyUI**，由 `tailwind.config.js` 和 `postcss.config.js` 协同驱动；变更管理与规范文档通过 **OpenSpec-cn** 工作流，其全局行为由 `openspec/config.yaml` 控制。运行时 API 地址通过 Vite 开发代理统一转发，不依赖 `.env` 文件。

## 2. 关键配置文件

- `vite.config.ts`：构建入口配置（插件、路径别名、开发服务器端口 3000、`/api` → `http://127.0.0.1:3001` 的跨域代理）
- `package.json`：脚本命令（`dev`、`build`、`preview`、`type-check`、`openspec`、`openspec:update`），声明 Node ≥ 18 引擎约束
- `tailwind.config.js`：扫描范围、DaisyUI 主题（light/dark/cupcake，默认 dark）、基础样式开关
- `postcss.config.js`：启用 tailwindcss 与 autoprefixer
- `src/env.d.ts`：声明 `ImportMetaEnv`，定义 `VITE_APP_TITLE` 等环境变量类型
- `src/vite-env.d.ts`：引用 `vite/client` 以启用 `import.meta.env` 类型支持
- `openspec/config.yaml`：OpenSpec 工作流配置（schema: spec-driven，可扩展 context/rules）
- `src/api/client.ts`：运行时 API 基址常量 `API_BASE = '/api'`，配合 Vite 代理完成后端通信

## 3. 架构与设计约定

### 3.1 构建期配置（编译/打包阶段）
- 所有构建相关设置集中在 `vite.config.ts`，通过 `defineConfig` 导出；路径别名 `@` 指向 `./src`，组件与工具模块统一以 `@/...` 导入。
- 开发服务器固定端口 3000，启动时自动打开浏览器；所有 `/api/*` 请求在开发环境被代理到 `http://127.0.0.1:3001`，并开启 `changeOrigin`、关闭 `secure`。
- 生产构建流程为 `vue-tsc --noEmit` 类型检查后再执行 `vite build`，保证类型安全。

### 3.2 运行时配置（应用运行阶段）
- 应用标题等可注入变量通过 `VITE_*` 前缀的环境变量注入，类型在 `src/env.d.ts` 中显式声明，未声明的变量不会获得类型提示。
- API 基地址硬编码为相对路径 `/api`，实际目标由 Vite 代理决定，因此前后端联调无需修改前端代码即可切换后端地址。
- 认证 token 通过 Pinia store（`useAuthStore()`）在每次请求时附加 `Authorization: Bearer <token>`，401 时自动尝试 refresh 并重试一次，失败则跳转 `/login`。

### 3.3 样式配置
- Tailwind 扫描 `./index.html` 与 `./src/**/*.{vue,js,ts,jsx,tsx}` 中的类名。
- DaisyUI 启用 light/dark/cupcake 三套主题，默认暗色主题为 `dark`，同时开启 base/styled/utils 三类能力。
- PostCSS 仅串联 tailwindcss 与 autoprefixer，无额外复杂管线。

### 3.4 变更与规范配置（OpenSpec）
- `openspec/config.yaml` 指定 schema 为 `spec-driven`，并通过注释示例展示如何追加 `context`（技术栈、约定、领域知识）与 `rules`（proposal/tasks 写作规范），当前项目未启用自定义规则。

## 4. 约定与约束

| 类别 | 约定 / 约束 | 依据位置 |
|---|---|---|
| Node 版本 | 必须 Node ≥ 18，`dev` 脚本会主动校验并拒绝低版本 | `package.json` engines + scripts |
| 路径导入 | 源码内统一使用 `@/...` 别名访问 `src` 下模块 | `vite.config.ts` resolve.alias |
| API 地址 | 前端只写 `/api`，真实后端地址由 Vite 代理配置决定，禁止在业务代码中拼接完整 URL | `src/api/client.ts` + `vite.config.ts` server.proxy |
| 环境变量 | 仅 `VITE_` 前缀变量会被 Vite 注入；新增变量需在 `src/env.d.ts` 的 `ImportMetaEnv` 中声明类型 | `src/env.d.ts` |
| 开发服务 | 端口固定 3000，自动打开浏览器，`/api` 代理至 3001 | `vite.config.ts` server |
| 样式主题 | 默认暗色主题，可用 light/dark/cupcake 切换 | `tailwind.config.js` daisyui.darkTheme |
| 构建顺序 | 先 `vue-tsc` 做类型检查，再 `vite build` | `package.json` scripts.build |
| OpenSpec 工作流 | 使用 `openspec-cn` CLI，schema 为 spec-driven，可通过 config.yaml 扩展上下文与规则 | `openspec/config.yaml` + `package.json` scripts |

## 5. 缺失与说明

- 仓库中未发现 `.env`、`.env.development`、`.env.production` 等环境文件，也未在代码中使用 `process.env`；所有外部化配置均通过 Vite 的 `import.meta.env` 机制注入，属于“零样板 .env”的配置风格。
- 没有独立的 `config/` 目录或运行时配置加载器，配置高度集中于构建期配置文件与少量常量文件中，适合中小型前端项目的轻量化管理方式。
