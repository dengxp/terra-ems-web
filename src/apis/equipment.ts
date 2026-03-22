import { request } from '@umijs/max';

/**
 * 用能设备 API
 */

export interface Equipment {
    id: number;
    code: string;
    name: string;
    type?: string;
    modelNumber?: string;
    manufacturer?: string;
    ratedPower?: number;
    location?: string;
    energyUnitId?: number;
    energyUnit?: any;
    sortOrder?: number;
    status: number;
    remark?: string;
}

export async function getEquipments(params: any) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<Equipment>>>('/api/equipments', {
        method: 'GET',
        params: { pageNumber: pageNumber ?? (current ? current - 1 : 0), pageSize: pageSize ?? 10, ...rest },
    });
}

export async function getEquipmentsByEnergyUnitId(energyUnitId: number) {
    return request<API.Result<Equipment[]>>(`/api/equipments/energy-unit/${energyUnitId}`, { method: 'GET' });
}

export async function getAllEquipments() {
    return request<API.Result<Equipment[]>>('/api/equipments/all', { method: 'GET' });
}

export async function saveEquipment(data: any) {
    return request<API.Result<Equipment>>('/api/equipments', { method: 'POST', data });
}

export async function deleteEquipment(id: number) {
    return request<API.Result<void>>(`/api/equipments/${id}`, { method: 'DELETE' });
}

export async function deleteEquipmentsBatch(ids: (number | string)[]) {
    return request<API.Result<void>>('/api/equipments', { method: 'DELETE', data: ids });
}
