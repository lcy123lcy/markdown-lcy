# 变更提案：前后端登录与权限管理

## 一、变更概述

### 1.1 背景

当前 markdown-lcy 前后端均无认证与权限控制，文档 API 对所有请求开放，无法区分用户数据。为满足多用户场景下的数据隔离与管理员审计需求，需引入完整的登录、注册与权限体系。

### 1.2 目标

1. **前后端增加登录管理功能**：支持用户名/密码登录，JWT 认证
2. **按权限隔离数据**：普通用户登录后仅能查看、编辑、删除自己的文档
3. **提供注册功能**：前后端支持新用户注册
4. **管理员账号**：预设管理员可查看所有用户的数据
5. **对齐主流实现**：JWT + Refresh Token、路由守卫、请求拦截、持久化登录态

### 1.3 影响范围

- **后端**：Prisma schema、Auth 模块、Documents 模块、全局 Guard、中间件
- **前端**：路由、Pinia store、API 层、登录/注册页、导航与权限 UI
- **数据库**：新增 User、RefreshToken 表，Document 增加 userId 外键

---

## 二、技术方案

### 2.1 后端技术选型

| 能力       | 方案                    | 说明                         |
|------------|-------------------------|------------------------------|
| 认证       | Passport + JWT          | NestJS 官方推荐，生态成熟    |
| 密码哈希   | bcrypt                  | 行业标准，防彩虹表           |
| Token      | Access Token + Refresh Token | 短期访问 + 长期刷新，兼顾安全与体验 |
| 角色       | 枚举 `USER` / `ADMIN`   | 简单清晰，满足当前需求       |
| 校验       | Zod                     | 与项目现有校验一致           |

### 2.2 前端技术选型

| 能力       | 方案                         | 说明                         |
|------------|------------------------------|------------------------------|
| 状态管理   | Pinia auth store             | 与现有 editor store 一致     |
| 持久化     | pinia-plugin-persistedstate  | 刷新不丢登录态               |
| 请求携带   | fetch 封装 + 自动附加 Authorization | 统一处理，减少重复代码 |
| 路由守卫   | router.beforeEach            | 未登录重定向登录页           |

### 2.3 数据模型变更

```
User
  - id: String (cuid)
  - username: String (unique)
  - passwordHash: String
  - role: Enum (USER | ADMIN)
  - createdAt, updatedAt

RefreshToken
  - id: String (cuid)
  - userId: String (FK -> User)
  - token: String (unique)
  - expiresAt: DateTime
  - createdAt

Document（变更）
  - 新增 userId: String (FK -> User)
  - 迁移：现有文档需归属到某用户或管理员（可设默认 admin 用户）
```

### 2.4 API 设计

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 否 |
| POST | /api/auth/login | 登录 | 否 |
| POST | /api/auth/refresh | 刷新 Token | Refresh Token |
| POST | /api/auth/logout | 登出（可选：使 Refresh Token 失效） | JWT |
| GET  | /api/auth/me | 获取当前用户信息 | JWT |
| GET  | /api/documents | 文档列表 | JWT，按角色过滤 |
| GET  | /api/documents/:id | 文档详情 | JWT，权限校验 |
| POST | /api/documents | 创建文档 | JWT |
| PUT  | /api/documents/:id | 更新文档 | JWT，权限校验 |
| DELETE | /api/documents/:id | 删除文档 | JWT，权限校验 |

### 2.5 权限规则

- **普通用户 (USER)**：仅能访问 `userId === 当前用户 id` 的文档
- **管理员 (ADMIN)**：可访问所有文档（`findAll` 不按 userId 过滤，`findOne/update/remove` 不校验归属）

### 2.6 主流功能对齐清单

| 功能 | 实现方式 |
|------|----------|
| 登录 | POST /auth/login，返回 accessToken + refreshToken |
| 注册 | POST /auth/register，密码 bcrypt 哈希 |
| 登出 | POST /auth/logout，可选使 refreshToken 失效 |
| 刷新 Token | POST /auth/refresh，用 refreshToken 换新 accessToken |
| 获取当前用户 | GET /auth/me |
| 路由守卫 | 前端 beforeEach：需认证路由无 token 则跳登录 |
| 请求拦截 | 请求头自动附加 `Authorization: Bearer <token>` |
| Token 过期 | 401 时尝试 refresh，失败则跳登录 |
| 持久化 | Pinia persistedstate 持久化 auth store |

---

## 三、实现计划（任务分解）

### 阶段一：后端基础（Prisma + Auth 模块）

1. **Prisma Schema 变更**
   - 新增 `User` 模型（id, username, passwordHash, role, createdAt, updatedAt）
   - 新增 `RefreshToken` 模型（id, userId, token, expiresAt, createdAt）
   - `Document` 增加 `userId` 外键
   - 创建迁移，处理现有无主文档（可创建默认 admin 用户并关联）

2. **安装依赖**
   - `@nestjs/jwt`、`@nestjs/passport`、`passport`、`passport-jwt`、`passport-local`、`bcrypt`、`@types/bcrypt`

3. **Auth 模块**
   - `AuthModule`、`AuthService`、`AuthController`
   - `AuthService`：`register`、`login`、`refresh`、`logout`、`validateUser`
   - `LocalStrategy`：用户名密码校验
   - `JwtStrategy`：JWT 校验，payload 含 userId、username、role
   - `RefreshTokenStrategy`：Refresh Token 校验（可选单独 strategy 或复用逻辑）
   - 环境变量：`JWT_SECRET`、`JWT_EXPIRES_IN`、`REFRESH_SECRET`、`REFRESH_EXPIRES_IN`

4. **Guards 与 Decorators**
   - `JwtAuthGuard`：保护需认证的路由
   - `RolesGuard`：按 role 限制（如仅 ADMIN 可访问某接口）
   - `@CurrentUser()` 装饰器：注入当前用户到 handler

5. **种子数据**
   - 创建默认管理员账号（如 `admin` / 初始密码），通过 Prisma seed 或迁移后脚本

### 阶段二：后端 Documents 权限改造

6. **Documents 模块改造**
   - 所有接口加 `@UseGuards(JwtAuthGuard)`
   - `findAll`：USER 按 `userId` 过滤，ADMIN 不过滤
   - `findOne`、`update`、`remove`：USER 校验 `doc.userId === currentUser.id`，ADMIN 不校验
   - `create`：自动设置 `userId` 为当前用户 id

### 阶段三：前端基础（Store + API + 路由）

7. **安装依赖**
   - `pinia-plugin-persistedstate`

8. **Auth Store**
   - `auth` store：`user`、`accessToken`、`refreshToken`、`isAuthenticated`
   - `login`、`logout`、`refresh`、`fetchMe` actions
   - 持久化配置（仅 token 与必要字段，避免敏感信息）

9. **API 封装**
   - 新建 `src/api/auth.ts`：`login`、`register`、`refresh`、`logout`、`fetchMe`
   - 改造 `src/api/documents.ts`：封装 `apiFetch`，自动附加 `Authorization`，401 时尝试 refresh 再重试

10. **路由与守卫**
    - 新增 `/login`、`/register` 路由
    - 受保护路由设置 `meta: { requiresAuth: true }`
    - `router.beforeEach`：未登录访问受保护路由 → 重定向 `/login`；已登录访问 `/login`、`/register` → 重定向 `/`

### 阶段四：前端 UI

11. **登录页**
    - 表单：用户名、密码，提交调用 `auth.login`
    - 错误提示、加载状态
    - 跳转注册链接

12. **注册页**
    - 表单：用户名、密码、确认密码，提交调用 `auth.register`
    - 校验：用户名格式、密码强度、两次密码一致
    - 成功后自动登录或跳转登录

13. **导航与登出**
    - 顶部/侧边栏显示当前用户名，提供登出按钮
    - 未登录时隐藏文档相关入口或显示登录提示

### 阶段五：完善与测试

14. **Token 刷新逻辑**
    - 请求 401 时，用 refreshToken 调用 `/auth/refresh`，成功则更新 token 并重试原请求
    - 刷新失败则清除状态并跳转登录

15. **健康检查与文档**
    - `/health` 保持无需认证
    - 更新 OpenAPI/Swagger 文档，标注需认证接口

16. **测试**
    - 后端：Auth 与 Documents 的单元/集成测试
    - 前端：登录、注册、权限跳转的手动或 E2E 测试

---

## 四、环境变量

### 后端 `.env`

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="<随机字符串，生产环境必须更换>"
JWT_EXPIRES_IN="15m"
REFRESH_SECRET="<与 JWT_SECRET 不同的随机字符串>"
REFRESH_EXPIRES_IN="7d"
ADMIN_INIT_PASSWORD="<首次部署时管理员初始密码>"
```

### 前端

- 无需新增环境变量，API 基础路径沿用现有 `/api`

---

## 五、回滚与风险

### 5.1 回滚计划

- 保留迁移前的 Prisma schema 备份，可回滚迁移
- Auth 与 Documents 改造可独立回滚：移除 Guard 与过滤逻辑即可恢复“无认证”行为
- 前端：移除路由守卫与 auth store 后，可回退到无登录状态

### 5.2 风险与缓解

| 风险 | 缓解 |
|------|------|
| 现有文档无 userId | 迁移时创建默认 admin，将无主文档关联到 admin |
| JWT 泄露 | 短期 accessToken、HTTPS、生产环境强 secret |
| 刷新 Token 滥用 | 存库、支持撤销、限制单用户 token 数量 |

---

## 六、验收标准

1. 未登录访问文档列表/编辑页会跳转登录
2. 注册后可登录，仅能看到自己的文档
3. 管理员登录后可看到所有用户的文档
4. 登出后无法访问受保护接口
5. Token 过期后通过 refresh 可无感续期（在 refresh 有效期内）
6. 刷新页面后登录态保持（持久化生效）
