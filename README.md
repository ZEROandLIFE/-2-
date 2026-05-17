# 低代码平台

一个基于 Vue3 + Express + MongoDB 的低代码表单平台，支持可视化表单设计、数据管理和应用发布。

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite
- Pinia (状态管理)
- Element Plus
- Vue Router

### 后端
- Node.js 20+
- Express
- MongoDB + Mongoose
- JWT (认证)

## 项目结构

```
low-codes/
├── frontend/          # 前端项目
│   ├── src/
│   │   ├── api/          # API 接口封装
│   │   ├── components/   # 组件
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # Pinia 状态管理
│   │   ├── views/        # 页面
│   │   └── styles/       # 全局样式
│   └── package.json
├── backend/           # 后端项目
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── middleware/    # 中间件
│   │   ├── models/       # 数据模型
│   │   ├── routes/       # 路由配置
│   │   └── app.js        # 应用入口
│   └── package.json
└── PLAN.md            # 项目开发计划
```

## 快速开始

### 环境要求
- Node.js 20+
- MongoDB 7.0+

### 后端启动

```bash
cd backend
npm install
npm run dev
```

后端服务将运行在 http://localhost:3000

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

前端服务将运行在 http://localhost:5173

## 功能模块

| 阶段 | 模块 | 状态 |
| :--- | :--- | :--- |
| 1 | 环境搭建与基础配置 | ✅ 已完成 |
| 2 | 用户认证模块 | ✅ 已完成 |
| 3 | 应用管理模块 | ✅ 已完成 |
| 4 | 表单编辑器（核心模块） | ✅ 已完成 |
| 5 | 组件库模块 | ✅ 已完成 |
| 6 | 表单数据管理 | ✅ 已完成 |
| 7 | 表单发布模块 | ⏳ 进行中 |
| 8 | 扩展功能模块 | ⏳ 未开始 |
| 9 | 流程审批模块 | ⏳ 未开始 |
| 10 | 部署与发布 | ⏳ 未开始 |

## 开发说明

### API 代理
前端开发环境通过 Vite 代理访问后端 API：
- `/api` -> `http://localhost:3000`

### 环境变量
后端需要配置 `.env` 文件：
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/lowcodes
JWT_SECRET=your-secret-key
```

## License

MIT
