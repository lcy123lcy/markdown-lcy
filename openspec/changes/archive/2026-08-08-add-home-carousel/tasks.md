## 1. 路由与布局改造

- [x] 1.1 修改 `src/router/index.ts`：登录路由 path 从 `/login` 改为 `/lcylogin`
- [x] 1.2 修改 `src/router/index.ts`：移除 `/` 路由的 `meta: { requiresAuth: true }`
- [x] 1.3 修改 `src/router/index.ts`：更新 `beforeEach` 守卫，禁止任何重定向指向登录页；未认证用户访问受保护页面时重定向到首页 (`/`) 而非登录页
- [x] 1.4 修改 `src/App.vue`：header 和侧边栏仅在 `route.path !== '/'` 时渲染（使用 `v-if`）
- [x] 1.5 修改 `src/App.vue`：将所有 `/login` 路径引用改为 `/lcylogin`
- [x] 1.6 修改 `src/api/client.ts`：将 401 刷新失败后的 `window.location.href = '/login'` 改为 `window.location.href = '/'`（重定向到首页而非登录页）
- [x] 1.7 修改 `src/components/DocumentSidebar.vue`：将 `router.push('/')` 等跳转引用确认无需变更（侧边栏内跳转目标不受影响）

## 2. 首页轮播组件实现

- [x] 2.1 重写 `src/views/Home.vue`：搭建全屏轮播容器结构（`100vw × 100vh`，深色背景，`overflow: hidden`）
- [x] 2.2 在 `Home.vue` 中硬编码 37 张图片文件名数组，路径格式 `/doudouimg/<filename>.jpeg`
- [x] 2.3 实现图片条（flex row）与 CSS `transform: translateX()` 滑动机制
- [x] 2.4 实现 `setInterval` 自动播放（2 秒间隔），`onUnmounted` 中清除定时器
- [x] 2.5 实现图片懒加载：前 3 张正常渲染，第 4 张起使用 `loading="lazy"`
- [x] 2.6 实现图片原比例展示：`object-fit: contain`，深色背景填充留白
- [x] 2.7 实现左右箭头按钮（绝对定位在轮播区两侧），点击切换图片并重置计时器
- [x] 2.8 实现底部圆点指示器（当前图片高亮），点击跳转到对应图片并重置计时器
- [x] 2.9 实现自动播放时圆点同步高亮更新

## 3. 旧路径处理

- [x] 3.1 添加 `/login` 通配路由或 catch-all 处理，访问 `/login` 时返回 404 页面（不重定向到 `/lcylogin`）

## 4. 验证

- [x] 4.1 验证未登录用户访问 `/` 可正常看到轮播页，不被重定向
- [x] 4.2 验证访问 `/lcylogin` 可正常显示登录表单
- [x] 4.3 验证访问 `/login` 返回 404
- [x] 4.4 验证轮播自动播放（2 秒切换）、滑动动画、箭头切换、圆点指示器功能正常
- [x] 4.5 验证已登录用户在 `/doc/:id` 页面 header 和侧边栏正常显示
- [x] 4.6 运行 `npm run type-check` 确保 TypeScript 类型检查通过
