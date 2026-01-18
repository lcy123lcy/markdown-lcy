/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // HTML入口文件
    "./src/**/*.{vue,js,ts,jsx,tsx}", // 扫描所有Vue和TypeScript文件
  ],
  theme: {
    extend: {}, // 扩展主题配置
  },
  plugins: [
    require('daisyui'), // 集成DaisyUI组件库
  ],
  daisyui: {
    themes: ["light", "dark", "cupcake"], // DaisyUI主题配置
    darkTheme: "dark", // 默认暗色主题
    base: true, // 应用基础样式
    styled: true, // 应用DaisyUI样式
    utils: true, // 启用工具类
  },
}

