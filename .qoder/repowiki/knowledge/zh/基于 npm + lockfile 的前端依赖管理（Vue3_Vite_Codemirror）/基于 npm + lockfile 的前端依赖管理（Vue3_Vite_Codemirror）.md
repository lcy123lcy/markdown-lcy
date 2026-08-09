---
kind: dependency_management
name: 基于 npm + lockfile 的前端依赖管理（Vue3/Vite/Codemirror）
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - .nvmrc
    - vite.config.ts
    - tsconfig.json
    - postcss.config.js
    - tailwind.config.js
---

## 1. 使用的系统与工具

- **包管理器**：npm（由 `package-lock.json` 的 `lockfileVersion: 3` 可确认），用于声明、解析与锁定依赖。
- **Node.js 版本约束**：通过根目录 `.nvmrc` 指定 `20`，并在 `package.json` 的 `engines.node` 中要求 `>=18`，双管齐下保证开发/构建环境一致。
- **构建工具链**：Vite (`vite.config.ts`) + Vue 插件 (`@vitejs/plugin-vue`) + TypeScript (`vue-tsc`)，依赖均通过 npm 安装。
- **私有仓库/镜像**：从 `package-lock.json` 中所有 `resolved` 字段可见，依赖实际拉取自 `https://registry.npmmirror.com`（淘宝 NPM 镜像），说明项目使用国内镜像加速下载；未发现 `.npmrc` 或 `package.json` 中的 `publishConfig.registry`，因此未配置企业私有 registry。
- **无 vendoring**：仓库中没有 `node_modules/`（被 `.gitignore` 忽略），也没有任何第三方源码内联或 vendor 目录，完全依赖 npm 安装。

## 2. 关键文件

- `package.json`：声明运行时依赖（`dependencies`）与开发依赖（`devDependencies`），定义脚本命令（`dev`、`build`、`preview`、`type-check`、`openspec`、`openspec:update`）。
- `package-lock.json`：锁定所有直接/间接依赖的确切版本与完整性校验（`integrity`），确保多环境可重现安装。
- `.nvmrc`：固定 Node 版本为 `20`。
- `vite.config.ts`：通过 Vite 的 `resolve.alias` 配置 `@` → `./src` 路径别名，属于构建期依赖解析约定。
- `tsconfig.json` / `tsconfig.node.json`：TypeScript 编译选项，配合 `vue-tsc` 做类型检查。
- `postcss.config.js`、`tailwind.config.js`：CSS 处理链依赖（PostCSS + Tailwind + Autoprefixer）。

## 3. 架构与约定

- **依赖分层**：
  - 运行时依赖集中在 `dependencies`：Vue 3 (`vue ^3.5.13`)、状态管理 (`pinia ^2.1.7`)、路由 (`vue-router ^4.4.5`)、UI 组件库 (`element-plus ^2.13.0`、`@element-plus/icons-vue ^2.3.2`)、编辑器核心 (`@codemirror/*` 系列)、Markdown 解析 (`marked ^16.0.1`)、安全清洗 (`dompurify ^3.2.2`)、代码高亮 (`highlight.js ^11.11.1`、`highlightjs-vue ^1.0.0`)、HTML 转 Markdown (`turndown ^7.2.2`)。
  - 构建/类型/样式工具放在 `devDependencies`：Vite、TypeScript、vue-tsc、Tailwind、PostCSS、Autoprefixer、DaisyUI、concurrently（用于同时启动前后端）。
- **版本策略**：全部使用 `^` 语义化版本范围（如 `^3.5.13`），允许小版本自动升级；具体锁定版本由 `package-lock.json` 固化。
- **脚本约定**：
  - `npm run dev`：先通过内联 Node 脚本强制校验 Node ≥18，再启动 Vite 开发服务器。
  - `npm run build`：先执行 `vue-tsc` 类型检查，再 `vite build`。
  - `npm run type-check`：仅运行 `vue-tsc --noEmit`。
  - `npm run openspec` / `openspec:update`：调用 `openspec-cn` CLI 管理变更提案。
  - `npm run dev:all`：用 `concurrently` 同时启动前端 `dev` 与后端（`../markdown-lcy-backend` 下的 pnpm 服务）。
- **路径别名**：在 `vite.config.ts` 中将 `@` 指向 `./src`，统一模块导入前缀。
- **代理约定**：开发时 `/api` 请求通过 Vite proxy 转发到 `http://127.0.0.1:3001`（后端地址），避免跨域问题。

## 4. 约定与约束

- **Node 版本**：`.nvmrc` 固定为 `20`，`package.json.engines.node` 要求 `>=18`，且 `dev` 脚本内置运行时版本检查，不满足条件会直接退出——这是硬性约束。
- **锁文件必须提交**：`package-lock.json` 已纳入版本控制，所有依赖的实际安装版本由其锁定，禁止随意 `rm -rf node_modules && npm i` 而不更新 lockfile。
- **依赖来源**：所有包均从 `registry.npmmirror.com` 拉取，若切换回官方 npm registry 需显式配置（当前未见 `.npmrc`）。
- **无私有包/内联源码**：未发现 `private: true`、`workspace`、`file:` 协议或 `vendor/` 目录，所有第三方代码均通过 npm 托管。
- **OpenSpec 工具链**：通过 `scripts.openspec` 暴露 `openspec-cn` 命令，用于管理 `openspec/` 目录下的变更提案与任务，属于项目自有的依赖治理流程。
- **前后端协同脚本**：`dev:all` 将前端与后端（位于同级 `../markdown-lcy-backend`，使用 pnpm）并行启动，体现该前端工程与后端工程的耦合方式。