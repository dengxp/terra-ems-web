import { request } from '@umijs/max';

/**
 * 电价策略 API
 */

export interface PricePolicyItem {
    id?: number;
    periodType: string;  // SHARP, PEAK, FLAT, VALLEY, DEEP
    price: number;
    startTime?: string;  // HH:mm 格式，如 08:00
    endTime?: string;    // HH:mm 格式，如 12:00
    sortOrder?: number;
    remark?: string;
}

export interface PricePolicy {
    id: number;
    code: string;
    name: string;
    energyType?: {
        id: number;
        code: string;
        name: string;
    };
    isMultiRate: boolean;
    items: PricePolicyItem[];
    sortOrder: number;
    effectiveStartDate?: string;
    effectiveEndDate?: string;
    effectiveDateRange?: [string, string];  // 用于表单处理
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PricePolicyPageParams {
    current?: number;
    pageNumber?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
}

export interface CreatePricePolicyParams {
    code: string;
    name: string;
    energyTypeId?: number;
    isMultiRate: boolean;
    items: PricePolicyItem[];
    sortOrder?: number;
    status?: number;
    effectiveStartDate?: string;
    effectiveEndDate?: string;
    remark?: string;
}

/**
 * 时段类型选项
 */
export const PeriodTypeOptions = [
    { label: '尖', value: 'SHARP', color: '#f5222d' },
    { label: '峰', value: 'PEAK', color: '#fa8c16' },
    { label: '平', value: 'FLAT', color: '#52c41a' },
    { label: '谷', value: 'VALLEY', color: '#1890ff' },
    { label: '深谷', value: 'DEEP', color: '#722ed1' },
];

/**
 * 分页查询电价策略
 */
export async function getPricePolicyPage(params: PricePolicyPageParams) {
    return request<API.Result<API.PageResult<PricePolicy>>>('/api/price-policies', {
        method: 'GET',
        params: {
            pageNumber: (params.current || 1) - 1,
            pageSize: params.pageSize || 10,
            sortField: params.sortField || 'sortOrder',
            sortOrder: params.sortOrder || 'asc',
        },
    });
}

/**
 * 查询所有电价策略
 */
export async function getAllPricePolicies() {
    return request<API.Result<PricePolicy[]>>('/api/price-policies/all', {
        method: 'GET',
    });
}

/**
 * 查询启用的电价策略
 */
export async function getEnabledPricePolicies() {
    return request<API.Result<PricePolicy[]>>('/api/price-policies/enabled', {
        method: 'GET',
    });
}

/**
 * 根据ID查询电价策略
 */
export async function getPricePolicyById(id: number) {
    return request<API.Result<PricePolicy>>(`/api/price-policies/${id}`, {
        method: 'GET',
    });
}

/**
 * 根据能源类型ID查询电价策略
 */
export async function getPricePoliciesByEnergyTypeId(energyTypeId: number) {
    return request<API.Result<PricePolicy[]>>(`/api/price-policies/energy-type/${energyTypeId}`, {
        method: 'GET',
    });
}

/**
 * 创建电价策略
 */
export async function createPricePolicy(data: CreatePricePolicyParams) {
    return request<API.Result<PricePolicy>>('/api/price-policies/create', {
        method: 'POST',
        data,
    });
}

/**
 * 更新电价策略
 */
export async function updatePricePolicy(id: number, data: CreatePricePolicyParams) {
    return request<API.Result<PricePolicy>>('/api/price-policies', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除电价策略
 */
export async function deletePricePolicy(id: number) {
    return request<API.Result<void>>(`/api/price-policies/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 修改电价策略状态
 */
export async function updatePricePolicyStatus(id: number, status: number) {
    return request<API.Result<PricePolicy>>(`/api/price-policies/${id}/status`, {
        method: 'POST',
        params: { status },
    });
}
