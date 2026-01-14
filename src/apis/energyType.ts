import { request } from '@umijs/max';

/**
 * 能源类型 API
 */

// 能源类型接口
export interface EnergyType {
    id: number;
    code: string;
    name: string;
    unit: string;
    category: string;
    storable: boolean;
    coefficient?: number;
    emissionFactor?: number;
    defaultPrice?: number;
    icon?: string;
    color?: string;
    sortOrder: number;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

// 能源类型类别
export const EnergyTypeCategory = {
    ELECTRIC: '电力',
    GAS: '燃气',
    STEAM: '蒸汽',
    WATER: '水',
    OTHER: '其他',
};

/**
 * 分页查询能源类型
 */
export async function getEnergyTypes(params: {
    code?: string;
    name?: string;
    category?: string;
    status?: number;
    pageNumber?: number;
    pageSize?: number;
}) {
    return request<API.Result<API.PageResult<EnergyType>>>('/api/energy-types/search', {
        method: 'GET',
        params,
    });
}

/**
 * 查询所有启用的能源类型
 */
export async function getEnabledEnergyTypes() {
    return request<API.Result<EnergyType[]>>('/api/energy-types/enabled', {
        method: 'GET',
    });
}

/**
 * 根据ID查询能源类型
 */
export async function getEnergyTypeById(id: number) {
    return request<API.Result<EnergyType>>(`/api/energy-types/${id}`, {
        method: 'GET',
    });
}

/**
 * 创建能源类型
 */
export async function createEnergyType(data: Partial<EnergyType>) {
    return request<API.Result<EnergyType>>('/api/energy-types', {
        method: 'POST',
        data,
    });
}

/**
 * 更新能源类型
 */
export async function updateEnergyType(id: number, data: Partial<EnergyType>) {
    return request<API.Result<EnergyType>>(`/api/energy-types/${id}`, {
        method: 'PUT',
        data,
    });
}

/**
 * 删除能源类型
 */
export async function deleteEnergyType(id: number) {
    return request<API.Result<void>>(`/api/energy-types/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 批量删除能源类型
 */
export async function deleteEnergyTypesBatch(ids: (number | string)[]) {
    return request<API.Result<void>>('/api/energy-types/batch', {
        method: 'DELETE',
        params: { ids: ids.join(',') },
    });
}

/**
 * 修改能源类型状态
 */
export async function updateEnergyTypeStatus(id: number, status: number) {
    return request<API.Result<EnergyType>>(`/api/energy-types/${id}/status`, {
        method: 'PATCH',
        params: { status },
    });
}
