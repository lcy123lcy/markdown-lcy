---
kind: build_system
name: Vite + Vue3 前端构建与开发工作流
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.ts
    - tsconfig.json
    - tsconfig.node.json
    - tailwind.config.js
    - postcss.config.js
    - .nvmrc
---

## 构建系统与工具链

本项目采用 **Vite 5** 作为核心构建工具，配合 **Vue 3.5**、**TypeScript 5.6** 和 **Tailwind CSS + DaisyUI** 构建在线 Markdown 编辑器。整个构建流程围绕 `package.json` 中的 npm scripts 组织，无 Makefile/Dockerfile/CI 配置。

### 1. 构建脚本（npm scripts）
- `dev`: 启动 Vite 开发服务器（端口 3000），内置 Node.js 版本检查（要求 >=18），自动打开浏览器，并配置 `/api` 代理到后端 `http://127.0.0.1:3001`。
- `build`: 先执行 `vue-tsc` 进行类型检查，再调用 `vite build` 生成生产产物。
- `preview`: 使用 `vite preview` 预览构建产物。
- `type-check`: 仅运行 `vue-tsc --noEmit` 做纯类型检查。
- `openspec` / `openspec:update`: 通过 OpenSpec-cn 管理变更提案与任务。
- `dev:all`: 使用 `concurrently` 同时启动前端 dev 服务与后端服务（位于上一级目录的 `markdown-lcy-backend`）。

### 2. 核心配置文件
- `vite.config.ts`: 定义 Vue 插件、`@` 路径别名指向 `src/`、开发服务器端口 3000、`/api` 反向代理至 `http://127.0.0.1:3001`。
- `tsconfig.json`: 启用严格模式（`strict`、`noUnusedLocals`、`noImplicitReturns`、`noUncheckedIndexedAccess` 等），模块解析为 `bundler`，目标 ES2020，`noEmit` 表示由 Vite 负责编译输出；通过 `references` 引用 `tsconfig.node.json` 以分离 Node 端配置。
- `tsconfig.node.json`: 针对 Vite 配置文件的独立 TS 配置，启用 `composite` 项目引用。
- `tailwind.config.js`: 扫描 `index.html` 与 `src/**/*.{vue,js,ts,jsx,tsx}` 生成样式，集成 DaisyUI 并配置 light/dark/cupcake 主题。
- `postcss.config.js`: 串联 Tailwind CSS 与 Autoprefixer。
- `.nvmrc`: 锁定 Node 版本（与 `engines.node >= 18` 一致）。

### 3. 构建产物与部署约定
- 未显式指定 `build.outDir`，默认输出到 `dist/`。
- 未配置 Dockerfile、Makefile、GitHub Actions 或其他 CI/CD 文件，发布流程依赖外部系统或手动执行 `npm run build`。
- 版本号在 `package.json` 中维护（当前 `1.0.0`），无自动化版本递增脚本。

### 4. 关键约束与约定
- Node.js 版本必须 ≥18（通过 `engines` 字段与 `dev` 脚本内联检查双重保证）。
- 类型检查是构建前置步骤：`build` 命令必须先通过 `vue-tsc`，否则不会进入打包阶段。
- 源码路径统一使用 `@/` 别名导入（TS 与 Vite 两端均配置了 `@/* → src/*`）。
- 开发时 API 请求统一走 `/api` 前缀，由 Vite 代理转发到本地后端 3001 端口。
- 样式体系基于 Tailwind + DaisyUI，新增组件需确保文件名被 Tailwind content 扫描覆盖。
- 前后端联合调试通过 `dev:all` 脚本并行启动，后端工程位于仓库上级目录 `../markdown-lcy-backend`。

### 5. 缺失项
仓库中不存在以下构建相关工件：Makefile、Dockerfile、docker-compose.yml、CI 流水线（如 `.github/workflows`）、发布脚本、交叉编译配置、环境变量模板（`.env.*`）。因此该项目的构建与发布目前完全依赖本地 npm scripts 与 Vite 能力。