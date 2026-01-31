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

- **Vanilla CSS**：复杂的动效或特定布局使用 Vanilla CSS。
- **变量引用**：优先使用项目全局 CSS 变量。
- **UI 框架 (Ant Design v6 适配)**：
  - **Dropdown**：弃用 `overlayClassName` (改用 `classNames.root`)。
  - **Drawer**：优先使用 `size` 属性定义标准宽度。
  - **Ref 稳定性**：所有自定义 UI 组件必须使用 `React.forwardRef` 包装，以支持 Pro-Components 的自动 ref 注入和测量。

## 五、 工程化流程

1. **Git 提交**：
    - **语言约定**：Commit Message 必须使用**简体中文**。
    - **格式**：遵循 `type: 描述` (如 `fix: 修复搜索分页失效`)。
2. **文档同步**：重大交互变更或技术选型变更后，需同步更新 `.agent/rules/` 下的文档。
