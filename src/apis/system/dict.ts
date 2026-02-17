import { request } from '@umijs/max';

/**
 * 字典类型
 */
export interface SysDictType {
    id: number;
    name?: string;
    type?: string;
    status?: import("@/enums").DataItemStatus;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 字典数据
 */
export interface SysDictData {
    id: number;
    sortOrder?: number;
    label?: string;
    value?: string;
    typeCode?: string;
    status?: import("@/enums").DataItemStatus;
    tagType?: string;
    tagColor?: string;
    isDefault?: string;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 字典数据管理接口
 */
export const dictDataApi = {
    // 根据类型获取字典项 (useDict 使用)
    getByType: (type: string) => request(`/api/system/dict/data/type/${type}`, { method: 'GET' }),
};

/**
 * 字典类型管理接口 (保留兼容对象，但主要使用 useCrud)
 */
export const dictTypeApi = {};
