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
3. **分页与排序适配**：
    - **页码索引**：前端分页组件通常使用 1-based 索引，后端框架已统一处理偏移，前端直接传递 `current` 即可。
    - **排序字段**：前端 `Sorter` 对象属性应与后端实体字段名保持一致。
4. **Hook 依赖**：
    - 列表与 CRUD 场景 **强制优先** 使用 `@/hooks/common/useCrud`。
5. **异常处理逻辑**：
    - **401 (Unauthorized)**：用户未登录或 Token 过期，系统应自动清理状态并跳转至登录页。
    - **403 (Forbidden)**：用户已登录但无权进行此操作，系统应弹出错误提示（Message），**禁止** 自动跳转登录页以防循环。
    - **500/其他错误**：由全局 `request` 拦截器统一提示。

## 四、 useCrud Hook 使用规范

### 4.1 基本用法

标准 CRUD 页面必须使用 `useCrud` hook 管理状态和操作：

```tsx
const {
    getState,
    actionRef,
    toCreate,        // 新建操作
    toEdit,          // 编辑操作
    toBatchDelete,   // 批量删除
    setDialogVisible,
} = useCrud<EntityType>({
    pathname: '/module/page',  // 全局唯一路径标识
    entityName: '实体名称',     // 用于提示信息
    baseUrl: '/api/entities',
});

const state = getState('/module/page');
```

### 4.2 禁止的本地状态模式

以下本地状态模式已废弃，**禁止在新代码中使用**：

```tsx
// ❌ 禁止使用
const [formVisible, setFormVisible] = useState(false);
const [currentRecord, setCurrentRecord] = useState<T>();
const handleAdd = () => { setCurrentRecord(undefined); setFormVisible(true); };
const handleEdit = (record) => { setCurrentRecord(record); setFormVisible(true); };

// ✅ 应使用
const { toCreate, toEdit, getState, setDialogVisible } = useCrud(...);
const state = getState(pathname);
```

### 4.3 对话框组件连接

```tsx
<EntityForm
    visible={state?.dialogVisible || false}
    record={state?.editData as EntityType | undefined}
    onCancel={() => setDialogVisible(false)}
    onSuccess={() => {
        setDialogVisible(false);
        // ✅ 必须调用 actionRef 刷新当前列表
        actionRef.current?.reload();
    }}
/>
```

### 4.4 批量删除实现

```tsx
const handleBatchDelete = async () => {
    if (deleteDisabled) return;
    try {
        await toBatchDelete(selectedRowKeys as number[], true);
        setSelectedRowKeys([]);
        setSelectedRows([]);
    } catch (error) {
        // 错误由全局处理
    }
};
```

### 4.5 不适用场景

以下场景不强制使用 useCrud：
- 树形结构管理页面（如用能单元管理）
- 多列复合布局页面（如报警配置）
- 纯展示/分析页面

## 五、 权限与认证

- 权限判断使用 `Access` 组件或 `useAccess` Hook。
- 敏感操作按钮（新增、编辑、删除）必须绑定权限标识。
