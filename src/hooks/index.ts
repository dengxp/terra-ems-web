/**
 * Hooks 统一导出
 * 提供常用的自定义 Hooks
 */

// API 调用相关
export { useApi } from './useApi';
export type { UseApiOptions } from './useApi';

// 表格数据管理
export { useTableData } from './useTableData';
export type { UseTableDataOptions } from './useTableData';

// 表单弹窗管理
export { useFormModal } from './useFormModal';
export type { UseFormModalOptions } from './useFormModal';

// 删除操作
export { useDelete } from './useDelete';
export type { UseDeleteOptions } from './useDelete';

// TODO: 其他自定义 Hooks
// export { usePermission } from './usePermission';
// export { useConstant } from './useConstant';
// export { useDebounce } from './useDebounce';
// export { useThrottle } from './useThrottle';
