---
trigger: always_on
---

# 代码风格规范 (Frontend Code Style)

## 一、 命名约定

| 类型 | 规范 | 示例 |
|------|------|------|
| React 组件 | PascalCase | `UserList.tsx` |
| Hook 文件 | camelCase (use前缀) | `useAuth.ts` |
| API/工具文件 | camelCase | `auth.ts`, `dict.ts` |
| 变量/函数 | camelCase | `handleDelete` |
| 常量 | UPPER_CASE | `LOGIN_PATH` |

## 1.1 单复数命名规范 (Singular vs Plural)

| 对象类型 | 规范 | 示例 | 说明 |
|---|---|---|---|
| **数据库表名** | **单数 (Singular)** | `ems_product`, `sys_user` | 定义数据模型/模具，保持与 Entity 类名一致 |
| **实体类名** | **单数 (Singular)** | `Product`, `SysUser` | Java 类定义 |
| **集合/列表变量** | **复数 (Plural)** | `products`, `userList` | 代码中表示多个实例的容器 |
| **统计数量字段** | **复数 (Plural)** | `totalElements`, `totalPages` | 遵循 Spring Data 及业界标准，严禁使用 `totalElement` |

## 二、 编码习惯

1. **函数式编程**：强制使用函数组件（FC）和 Hooks。
2. **解构赋值**：提倡对 Props 和 State 进行解构。
3. **副作用管理**：明确 `useEffect` 的依赖项，禁止滥用 `any`。
4. **数据完整性**：在所有增删改表单中，必须使用 `ProFormText` 配合 `hidden` 属性显式承载 `id` 或 `parentId`，严禁仅依赖闭包或内存状态。
5. **ProTable 列表优化**：
    - **视觉焦点原则**：描述性质的“名称 (Name)”列必须显示于技术性质的“编码 (Code/Key/Type)”列之前。
    - **ID 列**：固定宽度 `60-80px`，通常 `hideInSearch: true`。
    - **编码/名称列**：对重要标识符列开启 `copyable: true`，宽度保证不折行（通常 `160px+`）。
    - **状态与枚举**：数值枚举值必须通过 `valueEnum` 映射为展示文本。

## 三、 UI 统一封装

- 禁止直接调用 `Button` 进行删除等排他性操作。
- 必须使用 `@/components` 下的按钮封装：
  - `AddButton`：带统一样式和权限，默认 `variant="outlined"`。
  - `EditButton`：编辑入口，统一使用 `EditFilled` 图标，默认 `variant="outlined"`。
  - `DeleteButton`：**必须内置 `Popconfirm`**，统一使用 `DeleteFilled` 图标，默认 `variant="outlined"`。
  - `IconButton`：列表行内操作按钮，强制 `shape="circle"` 且默认 `variant="text"`。
- **图标风格**：优先使用 `Filled` (实心) 系列图标以增强视觉识别度。

## 四、 样式规范

- **样式变量与主题**：优先使用 Ant Design 的 Design Token 或项目全局 CSS 变量，避免硬编码颜色和间距。
- **UI 框架适配原则**：
  - **升级适配**：在框架版本升级（如 Ant Design v5 -> v6）时，应优先采用官方推荐的新一代 API 和布局模式。
  - **Ref 稳定性**：所有自定义 UI 组件**强制要求**使用 `React.forwardRef` 包装，以确保与 Pro-Components 等上层框架的自动注入和测量兼容。

## 五、 工程化流程

1. **Git 提交**：
    * Copyright (c) 2025 泰若科技（广州）有限公司. All rights reserved.
    - **语言约定**：Commit Message 必须使用**简体中文**。
    - **格式**：遵循 `type: 描述` (如 `fix: 修复搜索分页失效`)。
2. **文档同步**：重大交互变更或技术选型变更后，需同步更新 `.agent/rules/` 下的文档。

## 六、 UI 设计规范 (UI Design Standards)

1. **表单布局标准 (Form Layout)**:
    - **Grid 模式**: 所有 `ProForm` / `ProModalForm` 必须开启 `grid={true}` 并设置 `rowProps={{ gutter: 0 }}`。
    - **标签对齐 (关键)**:
        - 半宽字段 (`span=12`): 设置 `labelCol={{ span: 6 }}`。
        - 全宽字段 (`span=24`): 设置 `labelCol={{ span: 3 }}`。
        - **原理**: 保持标签占据相同的绝对宽度 (3/24 of total)，实现垂直左对齐。
2. **组件分组 (Component Grouping)**:
    - **同类项合并**: 将交互类型相似的组件（如 `RadioGroup`, `Checkbox`）尽量安排在同一行，增强视觉一致性（如：性别 + 状态）。
