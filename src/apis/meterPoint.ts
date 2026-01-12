import { request } from '@umijs/max';

/**
 * 采集点位 API
 */

export interface MeterPoint {
    id: number;
    code: string;
    name: string;
    pointType: string;
    category?: string;
    meter?: {
        id: number;
        code: string;
        name: string;
    };
    energyType?: {
        id: number;
        code: string;
        name: string;
    };
    unit?: string;
    initialValue?: number;
    minValue?: number;
    maxValue?: number;
    stepMin?: number;
    stepMax?: number;
    sortOrder: number;
    status: number;
    remark?: string;
    energyUnits?: Array<{
        id: number;
        code: string;
        name: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
}

export interface MeterPointPageParams {
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
}

/**
 * 分页查询采集点位
 */
export async function getMeterPointPage(params: MeterPointPageParams) {
    return request<API.Result<API.PageResult<MeterPoint>>>('/api/meter-points/search', {
        method: 'GET',
        params: {
            current: params.current || 1,
            pageSize: params.pageSize || 10,
            sortField: params.sortField || 'sortOrder',
            sortOrder: params.sortOrder || 'asc',
        },
    });
}

/**
 * 根据ID查询采集点位
 */
export async function getMeterPointById(id: number) {
    return request<API.Result<MeterPoint>>(`/api/meter-points/${id}`, {
        method: 'GET',
    });
}

/**
 * 根据编码查询采集点位
 */
export async function getMeterPointByCode(code: string) {
    return request<API.Result<MeterPoint>>(`/api/meter-points/code/${code}`, {
        method: 'GET',
    });
}

/**
 * 根据计量器具ID查询采集点位
 */
export async function getMeterPointsByMeterId(meterId: number) {
    return request<API.Result<MeterPoint[]>>(`/api/meter-points/meter/${meterId}`, {
        method: 'GET',
    });
}

/**
 * 根据能源类型ID查询采集点位
 */
export async function getMeterPointsByEnergyTypeId(energyTypeId: number) {
    return request<API.Result<MeterPoint[]>>(`/api/meter-points/energy-type/${energyTypeId}`, {
        method: 'GET',
    });
}

/**
 * 根据用能单元ID查询关联的采集点位
 */
export async function getMeterPointsByEnergyUnitId(energyUnitId: number) {
    return request<API.Result<MeterPoint[]>>(`/api/meter-points/energy-unit/${energyUnitId}`, {
        method: 'GET',
    });
}

/**
 * 创建采集点位
 */
export async function createMeterPoint(
    data: Partial<MeterPoint>,
    meterId?: number,
    energyTypeId?: number
) {
    return request<API.Result<MeterPoint>>('/api/meter-points/create', {
        method: 'POST',
        data,
        params: { meterId, energyTypeId },
    });
}

/**
 * 更新采集点位
 */
export async function updateMeterPoint(
    id: number,
    data: Partial<MeterPoint>,
    meterId?: number,
    energyTypeId?: number
) {
    return request<API.Result<MeterPoint>>(`/api/meter-points/${id}`, {
        method: 'PUT',
        data,
        params: { meterId, energyTypeId },
    });
}

/**
 * 删除采集点位
 */
export async function deleteMeterPoint(id: number) {
    return request<API.Result<void>>(`/api/meter-points/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 修改采集点位状态
 */
export async function updateMeterPointStatus(id: number, status: number) {
    return request<API.Result<MeterPoint>>(`/api/meter-points/${id}/status`, {
        method: 'PATCH',
        params: { status },
    });
}

/**
 * 关联用能单元
 */
export async function assignEnergyUnits(id: number, energyUnitIds: number[]) {
    return request<API.Result<MeterPoint>>(`/api/meter-points/${id}/energy-units`, {
        method: 'POST',
        data: energyUnitIds,
    });
}
