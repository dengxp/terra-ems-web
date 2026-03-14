# Terra EMS Web — 前端应用

<p align="center">
  <strong>🌿 Terra 能源管理系统 — 基于 React + Ant Design 的企业级前端</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react" alt="React 18"/>
  <img src="https://img.shields.io/badge/UmiJS-4-purple?style=flat-square" alt="UmiJS 4"/>
  <img src="https://img.shields.io/badge/Ant%20Design-5-blue?style=flat-square&logo=antdesign" alt="Ant Design 5"/>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/ECharts-6-red?style=flat-square&logo=apacheecharts" alt="ECharts"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License"/>
</p>

---

## 📋 项目简介

Terra EMS Web 是 Terra 能源管理系统的前端应用，基于 **Ant Design Pro** 脚手架构建，采用 **UmiJS 4** 企业级前端框架，提供开箱即用的中后台管理界面。本应用包含完整的能源管理业务页面、数据可视化图表、权限控制体系，以及现代化的 UI 交互体验。

> 📦 后端仓库：[terra-ems](https://github.com/dengxp/terra-ems)

---

## ✨ 功能模块
... (中略) ...
## 📁 项目结构

```
terra-ems-web/
├── config/                     # 项目配置 (routes, proxy, settings)
├── public/                     # 静态资源
├── src/
│   ├── apis/                   # API 模块化定义
│   ├── pages/                  # 业务页面 (EMS 业务 + 系统管理)
│   ├── components/             # 公共 UI 组件
│   ├── hooks/                  # 通用 Hooks (含 useCrud)
│   ├── models/                 # 全局状态
│   ├── locales/                # 国际化
│   ├── utils/                  # 工具函数
│   └── requestErrorConfig.ts   # 请求拦截器
├── tailwind.config.js          # TailwindCSS 配置
└── package.json
```
... (中略) ...
## 📜 开源协议

[MIT License](LICENSE) — Copyright © 2024-2026 泰若科技（广州）有限公司

---

## ✨ 功能模块

### 能源管理

| 模块 | 页面 | 说明 |
|:---|:---|:---|
| 🔋 **基础数据** | 能源类型 / 用能单元 / 计量器具 / 采集点位 | 完整 CRUD + 树形结构管理 |
| 📊 **统计分析** | 能耗趋势 / 同比环比 / 排名分析 / 综合看板 | ECharts 数据可视化 |
| ⚡ **峰谷分析** | 分时电价配置 / 尖峰平谷用电量分析 | 多维度图表展示 |
| 💰 **成本管理** | 电价策略 / 成本绑定 / 成本记录 | 成本偏差分析 |
| 🌍 **碳排放** | 碳排放核算 / 趋势分析 / 排名 | 碳排放可视化 |
| 🎯 **对标管理** | 对标值配置（国标/行标/企标） | 多标准体系支持 |
| 🌱 **节能管理** | 节能项目跟踪 / 政策法规 | 全生命周期管理 |
| ⚠️ **告警管理** | 限值类型 / 告警配置 / 告警记录 | 多级告警、处理闭环 |
| 📖 **知识库** | 知识文章管理 | Markdown 编辑器 |
| 🏭 **生产管理** | 产品信息 / 生产记录 | 关联用能单元 |

### 系统管理

| 模块 | 说明 |
|:---|:---|
| 👤 用户管理 | 用户 CRUD、角色分配、头像管理 |
| 🔑 角色管理 | 角色权限配置、数据范围 |
| 🏢 部门管理 | 树形部门结构 |
| 📋 岗位管理 | 岗位配置 |
| 📑 菜单管理 | 动态菜单配置 |
| 🛡️ 权限管理 | 细粒度权限控制 |
| 📝 字典管理 | 字典类型 / 字典数据 |
| ⚙️ 系统配置 | 全局参数配置 |
| 🔔 通知公告 | 通知公告管理 |

### 系统监控

| 模块 | 说明 |
|:---|:---|
| 📋 登录日志 | 登录行为审计 |
| 📋 操作日志 | 操作行为追踪 |

---

## 🛠️ 技术栈

| 类别 | 技术 | 版本 |
|:---|:---|:---|
| **核心框架** | React | 18 |
| **前端框架** | UmiJS (`@umijs/max`) | 4.6+ |
| **UI 组件库** | Ant Design | 5.29+ |
| **高级组件** | Ant Design Pro Components | 2.8+ |
| **语言** | TypeScript | 5.3+ |
| **图表可视化** | ECharts + ECharts for React | 6.0 |
| **Markdown** | md-editor-rt | 6.3 |
| **样式方案** | Less + TailwindCSS + antd-style | — |
| **状态管理** | useModel (DVA 简版) | — |
| **权限控制** | Access + useAccess | — |
| **HTTP 请求** | @umijs/max `request` | — |
| **包管理** | pnpm | — |

---

## 📁 项目结构

```
terra-ems-react/
├── config/                     # 项目配置
│   ├── config.ts               # UmiJS 主配置
│   ├── routes.ts               # 路由配置
│   ├── proxy.ts                # 代理配置
│   └── defaultSettings.ts      # 默认主题设置
├── public/                     # 静态资源
├── src/
│   ├── apis/                   # API 模块化定义（禁止在组件内直接写请求 URL）
│   ├── pages/                  # 业务页面
│   │   ├── BasicData/          #   基础数据（能源类型/用能单元/计量器具/采集点位）
│   │   ├── Statistics/         #   统计分析（能耗趋势/同比环比/排名/综合看板）
│   │   ├── CostManagement/     #   成本管理（电价策略/成本绑定/成本记录）
│   │   ├── EnergySaving/       #   节能管理（节能项目/政策法规）
│   │   ├── Knowledge/          #   知识库
│   │   ├── Production/         #   生产管理（产品/生产记录）
│   │   ├── Account/            #   个人中心（个人设置/修改密码）
│   │   ├── system/             #   系统管理（用户/角色/部门/岗位/菜单/字典/配置）
│   │   ├── security/           #   安全中心（权限/模块管理）
│   │   ├── monitor/            #   系统监控（登录日志/操作日志）
│   │   ├── login/              #   登录页
│   │   ├── DashboardV3.tsx     #   综合仪表盘
│   │   └── Home.tsx            #   首页
│   ├── components/             # 公共组件（AddButton/EditButton/DeleteButton/IconButton...）
│   ├── hooks/                  # 通用 Hooks
│   │   └── common/useCrud.ts   #   标准 CRUD Hook（强制使用）
│   ├── models/                 # 全局状态
│   ├── icons/                  # 自定义图标
│   ├── locales/                # 国际化（zh-CN）
│   ├── enums/                  # 枚举定义
│   ├── utils/                  # 工具函数
│   ├── types/                  # TypeScript 类型定义
│   ├── access.ts               # 权限定义
│   ├── app.tsx                 # 应用入口配置
│   └── requestErrorConfig.ts   # 全局请求拦截与异常处理
├── tailwind.config.js          # TailwindCSS 配置
├── tsconfig.json               # TypeScript 配置
└── package.json
```

---

## 🚀 快速开始

### 环境要求

| 环境 | 最低版本 | 推荐版本 |
|:---|:---|:---|
| Node.js | 16 | 22+ |
| pnpm | 8 | 9+ |

### 1. 安装依赖

```bash
# 克隆项目
git clone https://gitee.com/dengxp/terra-ems-react.git
cd terra-ems-react

# 安装依赖
pnpm install
```

### 2. 启动开发服务器

```bash
# 开发模式（连接本地后端 API，关闭 Mock）
pnpm run dev

# 或使用 Mock 数据
pnpm run start
```

开发服务器启动后访问：**http://localhost:8000**

### 3. 代理配置

开发环境下，前端通过代理转发 API 请求到后端服务：

| 前端请求 | 代理目标 |
|:---|:---|
| `http://localhost:8000/api/**` | `http://127.0.0.1:8081/api/**` |

代理配置文件：`config/proxy.ts`

> 💡 后端已配置 `context-path: /api`，代理无需 pathRewrite。

### 4. 构建生产版本

```bash
# 构建
pnpm run build

# 预览构建结果
pnpm run preview
```

构建产物输出至 `dist/` 目录，可直接部署到 Nginx 等 Web 服务器。

---

## 🔧 开发约定

### API 层规范

- 所有 API 定义集中在 `src/apis/` 目录，**禁止在组件内直接写请求 URL**
- 分页接口自动处理 0-indexed 偏移（前端 1-based → 后端 0-based）

### CRUD 开发规范

所有标准 CRUD 页面**强制使用** `useCrud` Hook：

```tsx
const { getState, actionRef, search, toCreate, toEdit,
        handleSaveOrUpdate, toBatchDelete, setDialogVisible } = useCrud<Entity>({
  pathname: '/module/page',
  entityName: '实体名称',
  baseUrl: '/api/entities',
});
```

### 组件规范

- 操作按钮使用封装组件：`AddButton` / `EditButton` / `DeleteButton` / `IconButton`
- `DeleteButton` 内置 `Popconfirm` 二次确认
- 图标优先使用 `Filled`（实心）系列
- 自定义组件强制使用 `React.forwardRef`

### 表单布局

- 所有表单开启 `grid={true}`，`rowProps={{ gutter: 0 }}`
- 半宽字段 `labelCol={{ span: 6 }}`，全宽字段 `labelCol={{ span: 3 }}`
- ID 等技术字段使用 `ProFormText` + `hidden` 隐式提交

---

## 📋 常用命令

| 命令 | 说明 |
|:---|:---|
| `pnpm run dev` | 开发模式（连接后端 API） |
| `pnpm run start` | 开发模式（含 Mock） |
| `pnpm run build` | 生产构建 |
| `pnpm run preview` | 预览生产构建 |
| `pnpm run lint` | 代码检查 |
| `pnpm run lint:fix` | 自动修复代码问题 |
| `pnpm run tsc` | TypeScript 类型检查 |
| `pnpm run test` | 运行测试 |

---

## 🌐 部署

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;

    # 前端路由 - 所有非文件请求回退到 index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 环境变量

生产构建时通过环境变量切换 API 地址：

```bash
REACT_APP_ENV=prod pnpm run build
```

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📜 开源协议

[MIT License](LICENSE) — Copyright © 2024 泰若科技（广州）有限公司
