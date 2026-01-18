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

## 三、 UI 统一封装

- 禁止直接调用 `Button` 进行删除等排他性操作。
- 必须使用 `@/components` 下的按钮封装：
  - `AddButton`：带统一样式和权限。
  - `EditButton`：编辑入口。
  - `DeleteButton`：带 `Popconfirm` 气泡确认提示。

## 四、 样式规范

- **Vanilla CSS**：复杂的动效或特定布局使用 Vanilla CSS。
- **变量引用**：优先使用项目全局 CSS 变量。
- **禁止硬编码**：颜色、间距等建议引用全局设计令牌。
