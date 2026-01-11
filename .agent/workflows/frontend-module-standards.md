---
description: Frontend module development standards for terra-ems-react
---
# 前端模块开发规范

本规范适用于 `terra-ems-react` 项目中新增业务模块的开发。

## ProTable 列表页规范

```tsx
<ProTable
    form={{ span: 6 }}
    search={{
        collapseRender: false,
        defaultCollapsed: false,
        span: 6,  // 搜索字段每列占 6/24，一行可放 4 个字段
    }}
    cardProps={{ bordered: false }}
    tableAlertRender={false}
    tableAlertOptionRender={false}
/>
```

**关键配置：**
- `form.span: 6` — 搜索字段紧凑布局，一行可放 3-4 个字段 + 按钮
- `search.span: 6` — 与 form.span 保持一致
- `collapseRender: false` — 禁用折叠按钮，保持简洁

---

## ModalForm 弹窗表单规范

```tsx
<ModalForm
    modalProps={{
        destroyOnClose: true,
        maskClosable: false,
        width: 800,
    }}
    layout="horizontal"           // 标签在左侧
    labelCol={{ span: 6 }}        // 标签宽度占 6/24
    wrapperCol={{ span: 18 }}     // 控件宽度占 18/24
    grid={true}
    colProps={{ span: 12 }}       // 两列布局
    rowProps={{ gutter: [16, 0] }}
>
    {/* 普通字段自动两列 */}
    <ProFormText name="code" label="编码" />
    
    {/* 全宽字段（如备注） */}
    <ProFormTextArea
        name="remark"
        label="备注"
        colProps={{ span: 24 }}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
    />
</ModalForm>
```

---

## 删除确认规范

**单行删除：**
- 使用 `DeleteButton` 组件 + `useCrud().toDelete(id, true)`

**批量删除：**
```tsx
ModalConfirm({
    title: '删除' + '实体名称',
    content: '实体名称删除后将无法恢复，请确认是否删除？',
    onOk: async () => { /* 删除逻辑 */ },
});
```

---

## 状态字段规范

- 使用 `StatusIcon` 组件展示状态
- 状态值：`0 = 启用`, `1 = 停用`
- 下拉选项：
```tsx
options={[
    { label: '启用', value: 0 },
    { label: '停用', value: 1 },
]}
```
