/**
 * 选项数据
 */
export interface Option {
    value: any;
    label: string;
    key?: any;
    index?: any;
}

/**
 * 树形数据
 */
export interface TreeNode {
    id: string | number;
    label: string;
    children?: TreeNode[];
}

/**
 * 表格操作类型
 */
export type TableAction = 'add' | 'edit' | 'delete' | 'view' | 'export' | 'import';

/**
 * 通用状态
 */
export type CommonStatus = 'ENABLED' | 'DISABLED';
