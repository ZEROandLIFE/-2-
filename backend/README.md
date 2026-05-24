# Low-Code Platform Backend

基于 Node.js + Express + MongoDB 的低代码平台后端 API 服务。

## 技术栈

- **Node.js 20+** - JavaScript 运行时
- **Express 4.x** - Web 框架
- **MongoDB 7.0+** - NoSQL 数据库
- **Mongoose 8.x** - MongoDB 对象建模
- **JWT** - JSON Web Token 认证
- **bcrypt** - 密码加密
- **cors** - 跨域资源共享

## 项目结构

```
backend/
├── src/
│   ├── controllers/     # 业务逻辑控制器
│   │   ├── authController.js        # 认证相关
│   │   ├── applicationController.js  # 应用管理
│   │   ├── formController.js        # 表单管理
│   │   ├── organizationController.js # 组织架构
│   │   ├── pageController.js        # 页面管理
│   │   ├── publishController.js      # 发布管理
│   │   └── widgetController.js      # 组件管理
│   ├── middleware/      # 中间件
│   │   └── auth.js     # JWT 认证中间件
│   ├── models/         # MongoDB 数据模型
│   │   ├── User.js           # 用户模型
│   │   ├── Application.js    # 应用模型
│   │   ├── Form.js           # 表单模型
│   │   ├── FormData.js       # 表单数据模型
│   │   ├── FormPermission.js # 表单权限模型
│   │   ├── Department.js     # 部门模型
│   │   ├── DepartmentMember.js # 部门成员模型
│   │   ├── DepartmentApplication.js # 部门申请模型
│   │   ├── Role.js           # 角色模型
│   │   ├── Page.js           # 页面模型
│   │   ├── Widget.js         # 组件模型
│   │   └── WidgetCategory.js # 组件分类模型
│   ├── routes/         # API 路由定义
│   │   ├── auth.js           # 认证路由
│   │   ├── applicationRoutes.js # 应用路由
│   │   ├── formRoutes.js     # 表单路由
│   │   ├── organizationRoutes.js # 组织架构路由
│   │   ├── pageRoutes.js     # 页面路由
│   │   ├── publish.js        # 发布路由
│   │   └── widgetRoutes.js   # 组件路由
│   ├── scripts/        # 脚本文件
│   │   └── initWidgets.js   # 初始化组件数据
│   ├── app.js          # 应用入口
│   └── seed.js         # 数据库初始化脚本
├── package.json
└── nodemon.json
```

## API 接口

### 认证模块 `/api/auth`

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| POST | /register | 用户注册 |
| POST | /login | 用户登录 |
| GET | /me | 获取当前用户信息 |
| PUT | /password | 修改密码 |

### 应用模块 `/api/applications`

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | / | 获取应用列表 |
| POST | / | 创建应用 |
| GET | /:id | 获取应用详情 |
| PUT | /:id | 更新应用 |
| DELETE | /:id | 删除应用 |

### 表单模块 `/api/forms`

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | /app/:appId | 获取应用下的表单列表 |
| POST | / | 创建表单 |
| GET | /:id | 获取表单详情 |
| PUT | /:id | 更新表单 |
| DELETE | /:id | 删除表单 |

### 表单数据模块 `/api/form-data`

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | /form/:formId | 获取表单数据列表 |
| POST | /form/:formId | 提交表单数据 |
| GET | /form/:formId/:id | 获取单条数据 |
| PUT | /form/:formId/:id | 更新数据 |
| DELETE | /form/:formId/:id | 删除数据 |

### 组织架构模块 `/api/organization`

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | /departments | 获取部门列表（树形） |
| POST | /departments | 创建部门 |
| GET | /departments/:id | 获取部门详情 |
| PUT | /departments/:id | 更新部门 |
| DELETE | /departments/:id | 删除部门 |
| GET | /departments/:id/members | 获取部门成员 |
| POST | /departments/:id/members | 添加部门成员 |
| DELETE | /departments/:id/members/:userId | 移除部门成员 |
| GET | /roles | 获取角色列表 |
| POST | /roles | 创建角色 |
| PUT | /roles/:id | 更新角色 |
| DELETE | /roles/:id | 删除角色 |
| POST | /applications/join | 申请加入部门 |
| GET | /applications/my | 获取我的申请 |
| PUT | /applications/:id/review | 审批申请 |

### 发布模块 `/api/publish`

| 方法 | 路径 | 说明 |
| :--- | :--- | :--- |
| GET | /permission/:formId | 获取表单权限 |
| PUT | /permission/:formId | 更新权限配置 |
| POST | /publish/:formId | 发布表单 |
| DELETE | /publish/:formId | 取消发布 |

## 数据模型

### User（用户）

```javascript
{
  username: String,      // 用户名，唯一
  email: String,        // 邮箱，唯一
  password: String,     // 密码（加密存储）
  nickname: String,     // 昵称
  avatar: String,       // 头像
  role: String,         // 角色：admin/user
  departmentId: ObjectId, // 主部门
  roleIds: [ObjectId],  // 角色列表
  createdAt: Date,
  updatedAt: Date
}
```

### Department（部门）

```javascript
{
  name: String,         // 部门名称
  parentId: ObjectId,   // 父部门ID
  leaderId: ObjectId,   // 部门负责人
  description: String,  // 描述
  order: Number,        // 排序
  createdAt: Date,
  updatedAt: Date
}
```

### Role（角色）

```javascript
{
  name: String,         // 角色名称
  permissions: [String], // 权限列表
  description: String,  // 描述
  createdAt: Date,
  updatedAt: Date
}
```

## 快速开始

### 环境要求

- Node.js 20+
- MongoDB 7.0+

### 安装依赖

```bash
npm install
```

### 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lowcodes
JWT_SECRET=your-secret-key
```

### 启动开发服务器

```bash
npm run dev
```

后端服务将运行在 http://localhost:3000

### 初始化数据库

```bash
npm run seed
```

## 中间件

### 认证中间件

`auth.js` 提供 JWT 认证保护：

```javascript
const authMiddleware = require('./middleware/auth');
router.use(authMiddleware.protect);
```

## 相关链接

- [Express 文档](https://expressjs.com/)
- [Mongoose 文档](https://mongoosejs.com/)
- [MongoDB 文档](https://www.mongodb.com/docs/)
- [JWT 文档](https://jwt.io/)
