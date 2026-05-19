---
# Low-Code 平台开发计划

## 项目概述

本项目是一个企业级低代码开发平台，参考简道云设计理念，通过可视化拖拽方式快速构建表单应用。

---

### 阶段1：环境搭建与基础配置

**目标**：完成项目初始化，配置开发环境

**后端任务**：
1. 初始化 Node.js + Express 项目
2. 配置 MongoDB 连接
3. 配置环境变量
4. 配置跨域
5. 配置日志

**前端任务**：
1. 初始化 Vue 3 + TypeScript 项目
2. 配置 Vite
3. 安装 Element Plus
4. 配置 Tailwind CSS
5. 配置路由
6. 配置 Pinia

**技术栈**：
- Node.js 20+
- Express 4.x
- MongoDB 7.0+
- Vue 3.4+
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router

**完成状态**：已完成

---

### 阶段2：用户认证模块

**目标**：实现用户注册、登录、权限验证

**后端任务**：
1. 创建用户模型（User.js）
2. 实现密码加密（bcrypt）
3. 实现JWT认证
4. 实现登录/注册接口
5. 实现Token刷新机制

**前端任务**：
1. 创建登录页面（views/auth/Login.vue）
2. 创建注册页面（views/auth/Register.vue）
3. 创建布局组件（views/auth/AuthLayout.vue）
4. 创建用户Store（stores/auth.js）
5. 实现路由守卫
6. 实现请求拦截器

**数据库模型**：
```javascript
// User.js
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String },
  avatar: { type: String },
  role: { type: String, default: 'user', enum: ['admin', 'user'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**完成状态**：已完成

---

### 阶段3：应用管理模块

**目标**：实现应用的CRUD操作，支持应用列表展示（参考简道云"我的应用"界面）

**后端任务**：

1. 创建应用模型（Application.js）
2. 实现应用CRUD接口
3. 实现应用模板接口
4. 实现应用统计接口

**前端任务**：

1. 创建仪表盘页面（views/dashboard/index.vue）- 应用卡片网格展示
2. 创建应用列表组件（components/common/AppList.vue）
3. 创建应用卡片组件（components/common/AppCard.vue）- 图标+名称形式
4. 创建应用表单组件（components/common/AppForm.vue）
5. 创建应用Store（stores/application.js）

**数据库模型**：

```javascript
// Application.js
{
  name: { type: String, required: true },
  description: { type: String },
  thumbnail: { type: String },
  icon: { type: String },
  status: { type: String, default: 'draft', enum: ['draft', 'published'] },
  owner: { type: ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**完成状态**：已完成

---

### 阶段4：表单编辑器（核心模块）- 参考简道云表单设计

**目标**：实现可视化表单编辑器，支持拖拽式组件布局，参考简道云表单设计模式

**表单类型**（参考简道云）：

| 类型     | 说明                       | 应用场景                               |
| :------- | :------------------------- | :------------------------------------- |
| 普通表单 | 收集业务数据，支持分权协作 | 调查统计、在线报名、销售上报、会议预约 |
| 流程表单 | 数据逐级审批流转           | 报销审批、工作考核、任务派单、员工请假 |

**表单设置流程**：

- **普通表单**：①表单设计 → ②扩展功能 → ③表单发布
- **流程表单**：①表单设计 → ②流程设定 → ③扩展功能 → ④表单发布

**后端任务**：

1. 创建表单模型（Form.js）
2. 创建字段配置模型（FieldConfig.js）
3. 创建表单数据模型（FormData.js）
4. 实现表单CRUD接口
5. 实现字段配置接口
6. 实现表单数据提交/查询接口

**前端任务**：

1. 创建编辑器主页面（views/editor/index.vue）- 三栏布局
2. 创建组件面板（components/editor/ComponentPanel.vue）- 左侧字段选择区
3. 创建画布组件（components/editor/EditorCanvas.vue）- 中间表单设计区
4. 创建属性面板（components/editor/PropertyPanel.vue）- 右侧属性设置区
5. 创建编辑器Store（stores/editor.js）
6. 实现拖拽功能
7. 实现字段宽度控制（1/4, 1/3, 1/2, 2/3, 3/4, 整行）
8. 实现实时预览

**表单设计三区域**（参考简道云）：

```
┌─────────────────────────────────────────────────────────────────┐
│  字段选择区            │  表单设计区              │  属性设置区   │
│  ┌─────────────────┐  │  ┌─────────────────────┐  │ ┌─────────┐│
│  │ 常用字段        │  │  │  表单画布            │  │ │ 字段属性││
│  │ - 单行文本      │  │  │  拖拽字段到此处      │  │ │ 表单属性││
│  │ - 多行文本      │  │  │                     │  │ └─────────┘│
│  │ - 数字          │  │  │                     │  │            │
│  │ - 日期时间      │  │  │                     │  │            │
│  │ - 单选按钮组    │  │  │                     │  │            │
│  │ - 复选框组      │  │  │                     │  │            │
│  │ - 下拉框        │  │  │                     │  │            │
│  │ - 下拉复选框    │  │  └─────────────────────┘  │            │
│  ├─────────────────┤  │                          │            │
│  │ 高级字段        │  │                          │            │
│  │ - 图片          │  │                          │            │
│  │ - 文件          │  │                          │            │
│  │ - 地址          │  │                          │            │
│  │ - 子表单        │  │                          │            │
│  │ - 流水号        │  │                          │            │
│  │ - 手机号        │  │                          │            │
│  │ - 计算          │  │                          │            │
│  │ - 富文本        │  │                          │            │
│  └─────────────────┘  └──────────────────────────┘  └──────────┘
```

**支持的字段类型**（参考简道云）：

| 分类 | 字段类型   | 说明             |
| :--- | :--------- | :--------------- |
| 常用 | 单行文本   | 普通文本输入     |
| 常用 | 多行文本   | 长文本输入       |
| 常用 | 数字       | 数值输入         |
| 常用 | 日期时间   | 日期时间选择     |
| 常用 | 单选按钮组 | 单项选择         |
| 常用 | 复选框组   | 多项选择         |
| 常用 | 下拉框     | 下拉选择         |
| 常用 | 下拉复选框 | 多选下拉         |
| 高级 | 图片       | 图片上传         |
| 高级 | 文件       | 文件上传         |
| 高级 | 地址       | 地址选择         |
| 高级 | 定位       | GPS定位          |
| 高级 | 子表单     | 嵌套表单         |
| 高级 | 选择数据   | 关联其他表单数据 |
| 高级 | 流水号     | 自动编号         |
| 高级 | 手机号     | 手机号验证       |
| 高级 | 计算       | 公式计算         |
| 高级 | 富文本     | HTML编辑         |

**字段属性配置**（参考简道云右侧属性面板）：
- 标题：字段显示名称
- 字段标识：字段唯一标识
- 描述信息：提示说明
- 提示文字：输入框占位提示
- 默认值：默认填充值
- 必填：是否必填校验
- 不允许重复值：唯一性校验
- 字段权限：可见/可编辑控制
- 字段宽度：1/4, 1/3, 1/2, 2/3, 3/4, 整行

**表单数据结构**：

```javascript
// Form.js - 表单定义
{
  id: String,
  name: String,
  type: { type: String, default: 'normal', enum: ['normal', 'workflow'] }, // 普通表单/流程表单
  applicationId: ObjectId,
  description: String,
  fields: [{
    id: String,
    type: String,           // 字段类型
    title: String,          // 显示标题
    fieldKey: String,       // 字段标识（唯一）
    description: String,    // 描述信息
    placeholder: String,    // 提示文字
    defaultValue: Any,      // 默认值
    required: Boolean,      // 必填
    unique: Boolean,        // 不允许重复
    visible: Boolean,       // 可见
    editable: Boolean,      // 可编辑
    width: String,          // 字段宽度: '1/4', '1/3', '1/2', '2/3', '3/4', 'full'
    options: Array,         // 选项列表（单选/多选/下拉）
    validation: Object,     // 校验规则
    props: Object,          // 其他属性
    sortOrder: Number       // 排序顺序
  }],
  createdAt: Date,
  updatedAt: Date
}

// FormData.js - 表单数据记录
{
  id: String,
  formId: ObjectId,
  applicationId: ObjectId,
  data: Object,            // { fieldKey: value } 键值对
  submitter: ObjectId,     // 提交人
  submitTime: Date,        // 提交时间
  updateTime: Date,        // 更新时间
  status: String           // 状态：draft, submitted, approved, rejected
}
```

**完成状态**：已完成

---

### 阶段5：组件库模块

**目标**：实现字段组件库，支持字段搜索、分类

**后端任务**：

1. 创建字段类型模型（FieldType.js）
2. 创建字段分类模型（FieldCategory.js）
3. 实现字段类型CRUD接口
4. 实现字段搜索接口

**前端任务**：

1. 创建组件面板组件（components/editor/ComponentPanel.vue）
2. 创建字段预览组件（components/editor/FieldPreview.vue）
3. 创建字段Store（stores/fields.js）
4. 实现字段分类过滤

**数据库模型**：

```javascript
// FieldType.js - 字段类型定义
{
  name: { type: String, required: true },
  category: { type: ObjectId, ref: 'FieldCategory' },
  icon: { type: String },
  description: { type: String },
  defaultProps: { type: Object },
  isSystem: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}

// FieldCategory.js - 字段分类
{
  name: { type: String, required: true },
  icon: { type: String },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}
```

**完成状态**：已完成

---

### 阶段6：表单数据管理

**目标**：实现表单数据的提交、查看、编辑、删除，参考简道云数据管理界面

**后端任务**：

1. 实现表单数据提交接口
2. 实现表单数据查询接口（支持分页、筛选、排序）
3. 实现表单数据更新接口
4. 实现表单数据删除接口
5. 实现数据导入导出接口（CSV/Excel）

**前端任务**：

1. 创建数据管理页面（views/app/DataManagement.vue）- 表格展示所有数据
2. 创建表单填写页面（views/app/FormFill.vue）- 填写表单数据
3. 创建数据详情页面（views/app/DataDetail.vue）- 查看单条数据详情
4. 创建数据列表组件（components/app/DataTable.vue）- 数据表格展示
5. 创建数据筛选组件（components/app/DataFilter.vue）- 搜索筛选
6. 创建数据操作组件（components/app/DataActions.vue）- 添加、导入、导出、批量操作
7. 创建数据Store（stores/formData.js）

**功能特性**：
- 数据表格展示：字段作为列，记录作为行
- 搜索功能：支持关键词搜索
- 筛选功能：支持按字段值筛选
- 排序功能：支持按列排序
- 添加数据：打开表单填写页面
- 编辑数据：打开表单编辑页面
- 删除数据：支持单条删除和批量删除
- 导入数据：支持CSV/Excel导入
- 导出数据：支持CSV/Excel导出

**完成状态**：已完成

---

### 阶段7：表单发布模块

**目标**：实现表单发布功能，支持权限配置（参考简道云）

**发布类型**：

| 类型       | 说明               | 权限范围           |
| :--------- | :----------------- | :----------------- |
| 对成员发布 | 发布给内部团队成员 | 数据填报、数据管理 |
| 公开发布   | 发布给外部用户     | 仅数据填报、查询   |

**后端任务**：
1. 创建表单权限模型（FormPermission.js）
2. 实现表单发布接口
3. 实现权限配置接口

**前端任务**：
1. 创建表单发布页面（views/editor/FormPublish.vue）
2. 创建权限配置组件（components/editor/PermissionConfig.vue）
3. 创建发布Store（stores/publish.js）

**数据库模型**：

```javascript
// FormPermission.js - 表单权限配置
{
  formId: ObjectId,
  publishType: { type: String, enum: ['member', 'public', 'both'] },
  memberPermissions: [{
    userId: ObjectId,
    permissions: Array                   // ['submit', 'view', 'edit', 'delete', 'manage']
  }],
  publicUrl: { type: String },           // 公开发布URL
  publicEnabled: { type: Boolean, default: false },
  publishedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**完成状态**：已完成

---

### 阶段8：组织架构模块

**目标**：实现部门、角色管理，支持组织架构配置（参考简道云）

**功能列表**：

| 功能     | 说明                               |
| :------- | :--------------------------------- |
| 部门管理 | 创建、编辑、删除部门，支持树形结构 |
| 角色管理 | 自定义角色，配置角色权限           |
| 用户分配 | 将用户分配到部门和角色             |
| 权限继承 | 支持部门/角色级别的权限继承        |

**后端任务**：
1. 创建部门模型（Department.js）
2. 创建角色模型（Role.js）
3. 更新用户模型，添加部门、角色字段
4. 实现组织架构CRUD接口

**前端任务**：
1. 创建部门管理页面（views/admin/DepartmentManager.vue）
2. 创建角色管理页面（views/admin/RoleManager.vue）
3. 创建组织架构Store（stores/organization.js）

**数据库模型**：

```javascript
// Department.js - 部门模型
{
  name: String,
  parentId: ObjectId,           // 父部门ID
  description: String,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}

// Role.js - 角色模型
{
  name: String,
  permissions: Array,           // ['form_create', 'form_edit', 'data_view', 'data_manage', ...]
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

**完成状态**：未开始

---

### 阶段9：流程审批模块

**目标**：实现流程表单的审批流程（参考简道云流程表单）

**流程设计三区域**：

```
┌─────────────────────────────────────────────────────────────────┐
│  节点选择区            │  流程设计区              │  属性设置区   │
│  ┌─────────────────┐  │  ┌─────────────────────┐  │ ┌─────────┐│
│  │ 开始节点        │  │  │  流程画布            │  │ │ 节点属性││
│  │ 审批节点        │  │  │  拖拽节点到此处      │  │ │ 流程属性││
│  │ 条件节点        │  │  │  连接节点形成流程    │  │ └─────────┘│
│  │ 分支节点        │  │  │                     │  │            │
│  │ 结束节点        │  │  │                     │  │            │
│  └─────────────────┘  │  │                     │  │            │
│                       │  └─────────────────────┘  │            │
│                       └──────────────────────────┘  └──────────┘
```

**流程节点类型**：
- 开始节点
- 审批节点（单人审批、多人审批）
- 条件节点
- 分支节点
- 结束节点

**后端任务**：
1. 创建流程模型（Workflow.js）
2. 创建流程节点模型（WorkflowNode.js）
3. 创建流程实例模型（WorkflowInstance.js）
4. 实现流程CRUD接口
5. 实现流程流转接口

**前端任务**：
1. 创建流程设计页面（views/editor/WorkflowDesign.vue）
2. 创建流程审批页面（views/app/WorkflowApproval.vue）
3. 创建流程Store（stores/workflow.js）

**数据库模型**：

```javascript
// Workflow.js - 流程定义
{
  formId: ObjectId,
  name: String,
  nodes: [{
    id: String,
    type: { type: String, enum: ['start', 'approval', 'condition', 'branch', 'end'] },
    title: String,
    assignees: Array,                    // 审批人
    config: Object,                      // 节点配置
    nextNodes: Array                     // 下一节点ID
  }],
  createdAt: Date,
  updatedAt: Date
}

// WorkflowInstance.js - 流程实例
{
  workflowId: ObjectId,
  formDataId: ObjectId,
  currentNodeId: String,
  status: { type: String, enum: ['running', 'completed', 'rejected'] },
  history: [{
    nodeId: String,
    action: { type: String, enum: ['submit', 'approve', 'reject'] },
    operator: ObjectId,
    comment: String,
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

**完成状态**：未开始

---

### 阶段10：部署与发布

**目标**：实现应用打包、部署和发布流程

**后端任务**：
1. 实现应用构建接口
2. 实现应用发布接口
3. 实现版本管理
4. 配置Docker

**前端任务**：
1. 创建发布页面（views/editor/Publish.vue）
2. 实现构建状态展示
3. 实现版本历史管理

**完成状态**：未开始

---

## 项目进度

| 阶段 | 名称                   | 状态     | 预计时间 |
| :--- | :--------------------- | :------- | :------- |
| 1    | 环境搭建与基础配置     | ✅ 已完成 | 2天      |
| 2    | 用户认证模块           | ✅ 已完成 | 3天      |
| 3    | 应用管理模块           | ✅ 已完成 | 3天      |
| 4    | 表单编辑器（核心模块） | ✅ 已完成 | 7天      |
| 5    | 组件库模块             | ✅ 已完成 | 3天      |
| 6    | 表单数据管理           | ✅ 已完成 | 5天      |
| 7    | 表单发布模块           | ✅ 已完成 | 3天      |
| 8    | 组织架构模块           | ⏳ 未开始 | 3天      |
| 9    | 流程审批模块           | ⏳ 未开始 | 5天      |
| 10   | 部署与发布             | ⏳ 未开始 | 3天      |

---

## 代码规范

### 命名规范

- 文件命名：使用 kebab-case（短横线分隔）
- 组件命名：使用 PascalCase（大驼峰）
- 变量命名：使用 camelCase（小驼峰）
- 常量命名：使用 UPPER_CASE（大写加下划线）

### 代码风格

- 缩进：2个空格
- 分号：必须添加
- 引号：单引号优先
- 函数：箭头函数优先

### Git 规范

- commit 信息：`type(scope): description`
  - feat: 新功能
  - fix: 修复bug
  - docs: 文档更新
  - style: 代码格式
  - refactor: 重构
  - test: 测试
  - chore: 构建/工具

---

## 目录结构

```
low-codes/
├── frontend/                 # 前端代码
│   ├── src/
│   │   ├── components/       # 组件
│   │   │   ├── common/       # 通用组件
│   │   │   ├── editor/       # 编辑器组件
│   │   │   └── app/          # 应用组件
│   │   ├── views/            # 页面视图
│   │   │   ├── auth/         # 认证页面
│   │   │   ├── dashboard/    # 仪表盘
│   │   │   ├── editor/       # 编辑器
│   │   │   └── app/          # 应用页面
│   │   ├── stores/           # Pinia Store
│   │   ├── api/              # API 请求
│   │   ├── router/           # 路由配置
│   │   ├── styles/           # 全局样式
│   │   └── App.vue           # 根组件
│   ├── public/               # 静态资源
│   ├── index.html            # HTML模板
│   ├── package.json          # 依赖配置
│   ├── vite.config.ts        # Vite配置
│   └── tsconfig.json         # TypeScript配置
├── backend/                  # 后端代码
│   ├── src/
│   │   ├── controllers/      # 控制器
│   │   ├── models/           # 数据库模型
│   │   ├── routes/           # 路由配置
│   │   ├── middleware/       # 中间件
│   │   └── app.js            # 应用入口
│   ├── package.json          # 依赖配置
│   └── .env                  # 环境变量
├── PLAN.md                   # 项目计划
└── README.md                 # 项目说明
```