---
trigger: always_on
---

# 前端架构规范 (Frontend Architecture)

## 一、 技术栈约定

- **核心**：React 18 + TypeScript 5 + Umijs (@umijs/max)
- **UI 框架**：Ant Design 5.x + Pro-Components
- **状态管理**：useModel (DVA 简版)
- **API 请求**：@umijs/max 提供的 `request`

## 二、 目录分层逻辑

- `src/apis/`：API 模块化定义。禁止在组件内直接写 `request` URL。
- `src/pages/`：业务页面组件。一个页面一个文件夹，内部拆分主组件与子组件（如 `EditDialog.tsx`）。
- `src/hooks/common/`：抽象后的通用逻辑（如 `useCrud.ts`）。
- `src/components/`：跨页面的公共 UI 组件。
- `src/utils/`：无副作用的工具函数。

## 三、 API 交互协议

1. **响应包装**：所有接口返回值必须适配 `API.Result<T>`。
2. **后端对接习惯**：
    - `POST /api/path` -> 对应后端的 `saveOrUpdate`。
    - `DELETE /api/path/{id}` -> 单选删除。
    - `DELETE /api/path` (Body 传 IDs) -> 批量删除。
3. **Hook 依赖**：
    - 列表与 CRUD 场景 **强制优先** 使用 `@/hooks/common/useCrud`。

## 四、 权限与认证

- 权限判断使用 `Access` 组件或 `useAccess` Hook。
- 敏感操作按钮（新增、编辑、删除）必须绑定权限标识。
