import { request } from '@umijs/max';
import { EnergyType } from './energyType';

/**
 * 计量器具 API
 */

export interface Meter {
    id: number;
    code: string;
    name: string;
    type: string;
    energyType: EnergyType;
    modelNumber?: string;
    measureRange?: string;
    manufacturer?: string;
    personCharge?: string;
    location?: string;
    startTime?: string;
    putrunTime?: string;
    checkCycle?: number;
    reminderCycle?: number;
    maxPower?: string;
    wireDiameter?: string;
    gatewayId?: string;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 分页查询计量器具
 * @param params 查询参数
 */
export async function getMeters(params: {
    code?: string;
    name?: string;
    type?: string;
    status?: number;
    page?: number;
    size?: number;
}) {
    return request<API.Result<API.PageResult<Meter>>>('/api/meters', {
        method: 'GET',
        params,
    });
}

/**
 * 根据ID查询计量器具
 * @param id 器具ID
 */
export async function getMeterById(id: number) {
    return request<API.Result<Meter>>(`/api/meters/${id}`, {
        method: 'GET',
    });
}

/**
 * 创建计量器具
 * @param data 器具数据
 */
export async function createMeter(data: any) {
    return request<API.Result<Meter>>('/api/meters', {
        method: 'POST',
        data,
    });
}

/**
 * 更新计量器具
 * @param id 器具ID
 * @param data 器具数据
 */
export async function updateMeter(id: number, data: any) {
    return request<API.Result<Meter>>(`/api/meters/${id}`, {
        method: 'PUT',
        data,
    });
}

/**
 * 删除计量器具
 * @param id 器具ID
 */
export async function deleteMeter(id: number) {
    return request<API.Result<void>>(`/api/meters/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 批量删除计量器具
 * @param ids 器具ID列表
 */
export async function deleteMetersBatch(ids: (number | string)[]) {
    return request<API.Result<void>>('/api/meters/batch', {
        method: 'DELETE',
        params: { ids: ids.join(',') },
    });
}
