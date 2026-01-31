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
- `src/components/`：跨页面的公共 UI 组件。**强制要求**：所有封装的底层 UI 组件（如按钮、图标）必须支持 `React.forwardRef`。
- `src/utils/`：无副作用的工具函数。

## 三、 API 交互协议

1. **响应包装**：所有接口返回值必须适配 `API.Result<T>`。
2. **后端对接习惯**：
    - `POST /api/path` -> 对应后端的 `saveOrUpdate`。
    - `DELETE /api/path/{id}` -> 单选删除。
    - `DELETE /api/path` (Request Body 传 IDs 数组) -> 批量删除。**禁止使用 params**。
3. **分页与列表接口规范**：
    - **标准分页**：`GET /api/path`，对应后端 `findByPage`。
    - **标准列表**：`GET /api/path/list`，对应后端 `findList`（不分页）。
3. **分页与排序适配**：
    - **页码索引**：前端分页组件通常使用 1-based 索引 (`current`)，而后台 (Spring Data JPA) 通常使用 0-based 索引 (`pageNumber`)。
    - **API 层鲁棒性**：API 方法应自动处理偏移。推荐模式：`pageNumber: pageNumber ?? (current ? current - 1 : 0)`。
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
    fetchPage,       // 分页查询 (已处理 0 索引转换)
    search,          // 搜索别名 (适配 ProTable request)
    toCreate,        // 打开新建对话框
    toEdit,          // 打开编辑对话框
    handleSaveOrUpdate, // 提交保存/更新逻辑
    toBatchDelete,   // 批量删除 (带二次确认)
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

### 4.3 字段顺序与表单显示策略

1. **视觉一致性**：所有列表 (ProTable) 和表单 (ProForm) 应遵循“名称在前，编码在后”的原则，确保用户首先看到易读的业务标示。
2. **表单布局标准**：
    - 针对字段较多的实体，优先使用 `grid` 模式的分栏布局，提高屏幕利用率。ID 等技术主键应显式设置为 `hidden` 以支持自动提交，但不在 UI 中展示。
3. **对话框组件连接**：

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

1. **二段确认**：具备“删除”语义的按钮（如 `DeleteButton`）必须内置 `Popconfirm` 气泡确认框，严禁直接触发删除 API。
2. **批量逻辑示例**：
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
- 多列复合布局页面（如报警配置）
- 纯展示/分析页面

## 七、 数据一致性与工程细节 (Engineering Best Practices)

1. **JPA 枚举转换**：实体类中使用 `@Convert` 时，数据库 SQL 或 Mock 数据必须使用转换后的存值（通常是 `'1'`, `'2'`），禁止插入枚举名。
2. **国际化完整性**：新模块开发必须检查 `src/locales/zh-CN/`，确保菜单和提示无 `Missing message` 警告。
3. **Ref 稳定性**：避免在 `render` 函数或 `columns.render` 中直接定义匿名函数作为组件，以防 Ref 失效或不必要的重新渲染。

## 五、 特殊组件交互规范

### 5.1 树形组件 (Tree) 下下文菜单

为保证 Tree 组件的 Flex 布局稳定性和防止换行 Bug：
1. **禁止行为**：禁止在 `Tree.TreeNode` 的 `title` 中嵌套 `Dropdown` 组件。
2. **推荐方案**：使用 `Tree` 的 `onRightClick` 事件驱动。
    - 在页面根部定义一个受控的 `Dropdown` 和一个 `fixed` 定位的隐藏锚点 `div`。
    - `onRightClick` 时，捕获鼠标坐标、更新锚点位置并显示菜单。
    - 必须调用 `event.preventDefault()`。
3. **数据冗余挂载**：在 `convertToTreeData` 时，将原始对象挂载到 `rawData` 属性下。事件回调中通过 `info.node.rawData` 直接访问 ID 和业务属性。

### 5.2 数据完整性 (Hidden Fields)

1. **原则**：所有增删改表单必须包含显式的隐藏标识符字段。
2. **实现**：使用 `ProFormText` 并设置 `hidden` 属性承载 `id`（用于更新）或 `parentId`（用于创建子节点）。
3. **优势**：确保表单在 `onFinish` 时自动收集所有必要的 API 字段，避免 Hook 内部进行不可控的“智能合并”。

## 六、 权限与认证

- 权限判断使用 `Access` 组件或 `useAccess` Hook。
- 敏感操作按钮（新增、编辑、删除）必须绑定权限标识。
