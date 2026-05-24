# Low-Code Platform Frontend

基于 Vue 3 + TypeScript + Element Plus 的低代码平台前端应用。

## 技术栈

- **Vue 3.4+** - 渐进式JavaScript框架
- **TypeScript** - 类型安全
- **Vite** - 下一代前端构建工具
- **Vue Router** - 官方路由管理
- **Pinia** - 状态管理
- **Element Plus** - UI 组件库
- **Axios** - HTTP 请求库
- **SCSS** - CSS 预处理器

## 项目结构

```
frontend/
├── src/
│   ├── api/              # API 接口封装
│   │   ├── request.ts    # Axios 实例配置
│   │   ├── types.ts      # API 类型定义
│   │   ├── auth.ts       # 认证相关 API
│   │   ├── application.ts # 应用管理 API
│   │   ├── form.ts       # 表单管理 API
│   │   ├── workflow.ts   # 工作流 API
│   │   ├── organization.ts # 组织架构 API
│   │   ├── publish.ts    # 表单发布 API
│   │   └── widget.ts     # 组件库 API
│   ├── components/        # 可复用组件
│   │   ├── common/       # 通用组件
│   │   ├── editor/       # 编辑器组件
│   │   └── widgets/      # 组件市场组件
│   ├── router/           # 路由配置
│   ├── stores/           # Pinia 状态管理
│   │   ├── auth.ts       # 认证状态
│   │   ├── editor.ts     # 编辑器状态
│   │   ├── formData.ts   # 表单数据状态
│   │   ├── workflow.ts   # 工作流状态
│   │   ├── organization.ts # 组织架构状态
│   │   └── publish.ts    # 发布状态
│   ├── views/            # 页面组件
│   │   ├── admin/        # 管理页面
│   │   ├── app/          # 应用页面
│   │   ├── auth/         # 认证页面
│   │   ├── dashboard/    # 仪表盘
│   │   ├── editor/      # 编辑器页面
│   │   └── settings/     # 设置页面
│   ├── styles/           # 全局样式
│   └── utils/            # 工具函数
├── package.json
└── vite.config.ts
```

## 功能模块

| 模块 | 说明 |
| :--- | :--- |
| 认证系统 | 用户注册、登录、JWT 认证 |
| 应用管理 | 创建、编辑、删除应用 |
| 表单编辑器 | 可视化拖拽式表单设计，支持 18 种字段类型 |
| 数据管理 | 表格展示、数据 CRUD、搜索筛选、导入导出 |
| 表单发布 | 成员权限配置、公开发布链接 |
| 组织架构 | 部门树形结构、角色权限、申请审批 |
| 流程审批 | 可视化流程设计器、审批节点、动态审批人、流程实例管理 |

## 快速开始

### 环境要求

- Node.js 20+

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

前端服务将运行在 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 页面路由

| 路径 | 页面 | 说明 |
| :--- | :--- | :--- |
| /auth/login | 登录页 | 用户登录 |
| /auth/register | 注册页 | 用户注册 |
| /dashboard | 仪表盘 | 应用列表、快捷入口 |
| /editor | 表单编辑器 | 表单设计与数据管理 |
| /editor/:id | 流程设计器 | 可视化流程设计 |
| /app/workflow-approval | 流程审批 | 我的申请、待我审批 |
| /editor/publish | 表单发布 | 权限配置与发布 |
| /admin/departments | 部门管理 | 组织架构管理 |
| /admin/roles | 角色管理 | 角色与权限配置 |
| /settings | 系统设置 | 用户偏好设置 |

## 开发说明

### API 代理

开发环境下，Vite 配置了 API 代理：
- `/api` → `http://localhost:3000`

### 状态管理

使用 Pinia 管理应用状态，各模块独立 Store：
- `useAuthStore` - 认证状态
- `useEditorStore` - 编辑器状态
- `useFormDataStore` - 表单数据状态
- `useWorkflowStore` - 工作流状态
- `useOrganizationStore` - 组织架构状态
- `usePublishStore` - 发布状态

### 组件开发

编辑器采用三栏布局：
- 左侧：字段组件面板
- 中间：表单画布
- 右侧：属性配置面板

### 流程设计器

流程设计器同样采用三栏布局：
- 左侧：节点类型面板（开始、审批、条件、分支、结束）
- 中间：流程画布（支持拖拽、连线）
- 右侧：节点属性配置面板

流程节点类型：
- 开始节点：流程起点
- 审批节点：支持多种审批人类型（用户、角色、部门、部门负责人）
- 条件节点：根据条件判断流程走向
- 分支节点：支持并行分支和条件分支
- 结束节点：流程终点，支持通知和结束动作

## 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Element Plus 文档](https://element-plus.org/)
- [Vite 文档](https://vitejs.dev/)
- [Pinia 文档](https://pinia.vuejs.org/)
