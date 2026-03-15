# Markdown编辑器

一个基于 Vue 3 + TypeScript 构建的在线 Markdown 编辑器项目。

## 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript (严格模式)
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS + DaisyUI
- **Markdown解析**: marked + DOMPurify
- **代码编辑器**: CodeMirror 6

## 项目结构

```
markdown-lcy/
├── src/
│   ├── components/     # 可复用组件
│   ├── stores/         # Pinia状态管理
│   ├── utils/          # 工具函数
│   ├── types/          # TypeScript类型定义
│   ├── views/          # 页面视图组件
│   ├── router/         # 路由配置
│   ├── App.vue         # 根组件
│   ├── main.ts         # 应用入口
│   └── style.css       # 全局样式
├── index.html          # HTML入口
├── package.json        # 项目配置
├── vite.config.ts      # Vite配置
├── tsconfig.json       # TypeScript配置
└── tailwind.config.js  # Tailwind配置
```

## 安装依赖

使用 npm 安装项目依赖：

```bash
npm install
```

或使用其他包管理器：

```bash
# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

## 启动项目

启动开发服务器：

```bash
npm run dev
```

项目将在 `http://localhost:3000` 启动。

## 构建项目

构建生产版本：

```bash
npm run build
```

构建产物将输出到 `dist` 目录。

## 预览构建结果

预览生产构建：

```bash
npm run preview
```

## 类型检查

运行 TypeScript 类型检查：

```bash
npm run type-check
```

## OpenSpec-cn（OPSX 工作流）

本项目支持 [OpenSpec-cn](https://github.com/studyzy/OpenSpec-cn) 的 [OPSX 工作流](https://github.com/studyzy/OpenSpec-cn/blob/main/docs/opsx.md)：以行动为导向、可迭代的规格驱动开发。

### 安装与初始化

需 **Node.js 20.19.0+**。在项目根目录执行：

```bash
# 安装依赖（含 @studyzy/openspec-cn）
npm install

# 初始化（创建技能与命令，为 Cursor 配置）
npx openspec-cn init --tools cursor
```

初始化会在 `.cursor/skills/` 与 `.cursor/commands/` 中创建 OPSX 技能与斜杠命令；重启 IDE 后生效。刷新代理指令：`npm run openspec:update`。

### OPSX 命令（由 init 生成）

| 命令 | 功能 |
|------|------|
| `/opsx:explore` | 深入思考想法、调查问题、明确需求 |
| `/opsx:propose [变更名]` | 提案新变更，一步创建 proposal、design、tasks 等产出物 |
| `/opsx:apply` | 按 tasks.md 实施任务并勾选 |
| `/opsx:archive` | 完成后归档 |

## 开发说明

- 项目使用 TypeScript 严格模式，确保类型安全
- 使用 Pinia 进行状态管理
- 使用 Tailwind CSS 和 DaisyUI 进行样式开发
- Markdown 解析使用 marked，并通过 DOMPurify 进行安全净化
- CodeMirror 6 用于代码编辑器功能

## 许可证

MIT License
