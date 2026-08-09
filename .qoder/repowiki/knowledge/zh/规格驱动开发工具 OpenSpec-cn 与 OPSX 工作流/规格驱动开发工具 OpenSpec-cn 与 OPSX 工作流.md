---
kind: external_dependency
name: 规格驱动开发工具 OpenSpec-cn 与 OPSX 工作流
slug: openspec-cn
category: external_dependency
category_hints:
    - framework_behavior
scope:
    - '**'
source_files:
    - openspec/config.yaml
    - package.json
    - README.md
---

### 角色
项目使用 OpenSpec-cn（github.com/studyzy/OpenSpec-cn）提供的 OPSX 工作流进行规格驱动开发，变更以 proposal/tasks 形式保存在 openspec/changes 目录下。

### 集成方式
- CLI 命令 `npm run openspec` / `npm run openspec:update` 由 package.json scripts 暴露；`npx openspec-cn init --tools cursor` 会在 `.cursor/skills/` 与 `.cursor/commands/` 生成技能与斜杠命令。
- 运行时通过 `openspec/config.yaml` 声明 schema 为 `spec-driven`，并可在 context 中注入技术栈、约定等上下文。
- 已存在的变更示例：`openspec/changes/add-auth-login/`、`fix-type-check-build/`。

### 使用要点
- 常用命令：`/opsx:explore`、`/opsx:propose [变更名]`、`/opsx:apply`、`/opsx:archive`，由 init 生成的 Cursor 斜杠命令触发。
- 变更归档后移入 `openspec/changes/archive/`。

注意：该工具是本地开发/协作流程工具，不参与前端构建产物。