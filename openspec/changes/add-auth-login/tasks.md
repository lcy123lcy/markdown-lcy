# 任务清单：前后端登录与权限管理

按顺序执行，完成后勾选 `[x]`。

## 阶段一：后端基础

- [x] 1. Prisma Schema：新增 User、RefreshToken，Document 增加 userId，创建迁移
- [x] 2. 安装后端依赖：@nestjs/jwt、@nestjs/passport、passport、passport-jwt、passport-local、bcrypt
- [x] 3. Auth 模块：AuthService（register、login、refresh、logout、validateUser）
- [x] 4. Auth 模块：LocalStrategy、JwtStrategy、AuthController
- [x] 5. Guards 与装饰器：JwtAuthGuard、@CurrentUser()
- [x] 6. 种子/脚本：创建默认管理员账号

## 阶段二：后端 Documents 权限

- [x] 7. Documents 接口加 JwtAuthGuard，按角色过滤/校验 userId

## 阶段三：前端基础

- [x] 8. 安装 pinia-plugin-persistedstate
- [x] 9. Auth Store：状态、login、logout、refresh、fetchMe，持久化
- [x] 10. API：auth.ts（login、register、refresh、logout、fetchMe）
- [x] 11. API：documents 请求自动附加 Authorization，401 时 refresh 重试
- [x] 12. 路由：/login、/register，守卫（requiresAuth）

## 阶段四：前端 UI

- [x] 13. 登录页：表单、错误提示、跳转注册
- [x] 14. 注册页：表单、校验、成功后登录
- [x] 15. 导航：显示用户名、登出按钮

## 阶段五：完善

- [x] 16. Token 刷新与 401 处理完善
- [x] 17. 更新 .env.example、文档
- [ ] 18. 测试：Auth、Documents 权限、前端流程
