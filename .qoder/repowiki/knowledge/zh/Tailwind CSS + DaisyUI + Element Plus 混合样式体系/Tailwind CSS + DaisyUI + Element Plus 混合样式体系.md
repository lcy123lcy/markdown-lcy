---
kind: frontend_style
name: Tailwind CSS + DaisyUI + Element Plus 混合样式体系
category: frontend_style
scope:
    - '**'
source_files:
    - tailwind.config.js
    - postcss.config.js
    - src/style.css
    - package.json
    - src/components/Toolbar.vue
    - src/components/DocumentSidebar.vue
---

## 1. 采用的样式系统

本项目采用 **Tailwind CSS v3** 作为原子化样式框架，并通过 **DaisyUI v4** 提供语义化组件类与主题变量；同时引入 **Element Plus** 作为 Vue 3 的 UI 组件库，用于表单、按钮、消息提示等交互型组件。三者协同工作：
- Tailwind 负责布局（flex/grid/spacing）、排版（text-*）、颜色（bg-/text-）和响应式断点。
- DaisyUI 提供 `btn`、`menu`、`toolbar`、`bg-base-200`、`border-base-300`、`text-base-content` 等基于设计令牌（design tokens）的语义类，并启用 light/dark/cupcake 三套主题，默认暗色主题为 `dark`。
- Element Plus 通过 `el-button`、`el-color-picker`、`el-select`、`ElMessage`、`ElMessageBox` 等组件提供富交互能力，其自身样式由组件库注入。

构建链为：`Vite → PostCSS (tailwindcss + autoprefixer) → Tailwind 扫描 src/**/*.{vue,js,ts,jsx,tsx} → 生成 CSS`。

## 2. 关键文件

- `tailwind.config.js`：声明扫描路径、启用 DaisyUI 插件及 themes (`light`, `dark`, `cupcake`)，设置 `darkTheme: "dark"`、`base: true`、`styled: true`、`utils: true`。
- `postcss.config.js`：注册 `tailwindcss` 与 `autoprefixer` 两个 PostCSS 插件。
- `src/style.css`：全局入口，使用 `@tailwind base/components/utilities` 指令引入 Tailwind 三层样式，并定义 `body` 的系统字体栈与 `#app` 的全宽高重置。
- `package.json`：依赖 `tailwindcss ^3.4.17`、`daisyui ^4.12.14`、`element-plus ^2.13.0`、`@codemirror/theme-one-dark`（编辑器主题）、`highlight.js`（代码高亮）。

## 3. 架构与约定

- **原子类优先**：组件模板中大量直接使用 Tailwind 原子类进行布局与间距控制，例如 `w-64`、`p-4`、`flex flex-col`、`overflow-y-auto`、`gap-2`、`flex-shrink-0`、`min-w-[3rem]` 等。
- **DaisyUI 语义类**：通过 `bg-base-200`、`border-base-300`、`text-base-content`、`btn btn-primary btn-sm`、`menu menu-sm`、`toolbar`、`panel-header`、`wysiwyg-wrapper` 等类名表达语义化的背景、边框、文字颜色和控件形态，借助 DaisyUI 的主题变量实现明暗主题切换。
- **Element Plus 组件混用**：工具栏中的编辑按钮统一使用 `<el-button size="small" text>`，颜色选择器使用 `<el-color-picker>`，字体下拉使用 `<el-select>`，弹窗/消息使用 `ElMessageBox` / `ElMessage`。这些组件自带样式，与 Tailwind/DaisyUI 类共存于同一模板。
- **CodeMirror 编辑器主题**：通过 `@codemirror/theme-one-dark` 为 Markdown 编辑器提供深色主题，与页面整体暗色风格保持一致。
- **无独立 CSS Modules / Scoped 样式**：从已检查的组件看，样式主要以内联 class 字符串形式组织，未看到 `.scss` 或 `<style scoped>` 的大量使用，布局与外观高度依赖原子类组合。
- **响应式策略**：未观察到媒体查询，响应式行为主要通过 Tailwind 的响应式前缀（如 `sm:`、`md:` 等）或弹性布局（`flex`、`flex-wrap`、`flex-shrink`）实现。

## 4. 约定与约束

- **主题来源单一**：所有颜色、边框、背景均通过 DaisyUI 的 `base-*` 语义类引用设计令牌，避免硬编码十六进制颜色值，从而保证 light/dark/cupcake 主题切换的一致性。
- **组件库边界清晰**：业务布局与排版走 Tailwind + DaisyUI，复杂交互控件（按钮组、颜色选择、弹窗、消息）走 Element Plus，两者在模板中共存但职责分离。
- **扫描范围固定**：Tailwind 仅扫描 `./index.html` 与 `./src/**/*.{vue,js,ts,jsx,tsx}`，新增样式文件需位于该 glob 范围内才会被包含进产物。
- **PostCSS 处理链不可省略**：`postcss.config.js` 中必须保留 `tailwindcss` 与 `autoprefixer`，否则无法生成正确的样式。
- **编辑器主题绑定**：Markdown 编辑器通过 `@codemirror/theme-one-dark` 显式加载 One Dark 主题，与页面暗色模式保持一致，未使用自定义 CodeMirror 主题。
- **无全局 SCSS/Less 变量**：项目未引入 Sass/Less 预处理器，样式以纯 CSS + 原子类为主，设计令牌集中在 DaisyUI 配置中管理。
