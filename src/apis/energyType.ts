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

// 能源类型类别 (从 enums 中重新导出)
export { EnergyCategory, EnergyCategoryLabel } from '@/enums';

/**
 * 分页查询能源类型
 */
export async function getEnergyTypes(params: {
    code?: string;
    name?: string;
    category?: string;
    status?: number;
    current?: number;
    pageNumber?: number;
    pageSize?: number;
}) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<EnergyType>>>('/api/energy-types', {
        method: 'GET',
        params: {
            pageNumber: pageNumber ?? (current ? current - 1 : 0),
            pageSize: pageSize ?? 10,
            ...rest,
        },
    });
}

export async function getEnabledEnergyTypes() {
    return request<API.Result<EnergyType[]>>('/api/energy-types/enabled', {
        method: 'GET',
    });
}

/**
 * 获取能源类型选项 (Label/Value)
 */
export async function getEnergyTypeOptions() {
    return request<API.Result<API.Option[]>>('/api/energy-types/options', {
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
    return request<API.Result<EnergyType>>('/api/energy-types', {
        method: 'POST',
        data: { ...data, id },
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
    return request<API.Result<void>>('/api/energy-types', {
        method: 'DELETE',
        data: ids,
    });
}

/**
 * 修改能源类型状态
 */
export async function updateEnergyTypeStatus(id: number, status: number) {
    return request<API.Result<EnergyType>>(`/api/energy-types/${id}/status`, {
        method: 'POST',
        params: { status },
    });
}
