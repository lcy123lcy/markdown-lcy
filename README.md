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

## 开发说明

- 项目使用 TypeScript 严格模式，确保类型安全
- 使用 Pinia 进行状态管理
- 使用 Tailwind CSS 和 DaisyUI 进行样式开发
- Markdown 解析使用 marked，并通过 DOMPurify 进行安全净化
- CodeMirror 6 用于代码编辑器功能

## 许可证

MIT License
