import { request } from '@umijs/max';

/**
 * 成本策略绑定 API
 */

export interface CostPolicyBinding {
    id: number;
    energyUnit?: {
        id: number;
        name: string;
        code: string;
    };
    pricePolicy?: {
        id: number;
        name: string;
        code: string;
    };
    effectiveStartDate: string;
    effectiveEndDate?: string;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CostPolicyBindingPageParams {
    current?: number;
    pageSize?: number;
    energyUnitId?: number;
    pricePolicyId?: number;
    status?: number;
}

/**
 * 分页查询
 */
export async function getCostPolicyBindingPage(params: CostPolicyBindingPageParams) {
    return request<API.Result<API.PageResult<CostPolicyBinding>>>('/api/ems/cost-policy-bindings', {
        method: 'GET',
        params: {
            pageNumber: (params.current || 1) - 1,
            pageSize: params.pageSize || 10,
            energyUnitId: params.energyUnitId,
            pricePolicyId: params.pricePolicyId,
            status: params.status,
        },
    });
}

/**
 * 按用能单元查询
 */
export async function getCostPolicyBindingsByEnergyUnit(energyUnitId: number) {
    return request<API.Result<CostPolicyBinding[]>>(`/api/ems/cost-policy-bindings/energy-unit/${energyUnitId}`, {
        method: 'GET',
    });
}

/**
 * 按电价策略查询
 */
export async function getCostPolicyBindingsByPricePolicy(pricePolicyId: number) {
    return request<API.Result<CostPolicyBinding[]>>(`/api/ems/cost-policy-bindings/price-policy/${pricePolicyId}`, {
        method: 'GET',
    });
}

/**
 * 查询有效绑定
 */
export async function getEffectiveBinding(energyUnitId: number, date?: string) {
    return request<API.Result<CostPolicyBinding>>('/api/ems/cost-policy-bindings/effective', {
        method: 'GET',
        params: { energyUnitId, date },
    });
}

/**
 * 根据ID查询
 */
export async function getCostPolicyBindingById(id: number) {
    return request<API.Result<CostPolicyBinding>>(`/api/ems/cost-policy-bindings/${id}`, {
        method: 'GET',
    });
}

/**
 * 创建绑定
 */
export async function createCostPolicyBinding(data: {
    energyUnitId: number;
    pricePolicyId: number;
    startDate: string;
    endDate?: string;
    remark?: string;
}) {
    return request<API.Result<CostPolicyBinding>>('/api/ems/cost-policy-bindings', {
        method: 'POST',
        params: data,
    });
}

/**
 * 更新绑定
 */
export async function updateCostPolicyBinding(id: number, data: {
    pricePolicyId?: number;
    startDate: string;
    endDate?: string;
    remark?: string;
}) {
    return request<API.Result<CostPolicyBinding>>(`/api/ems/cost-policy-bindings/${id}`, {
        method: 'PUT',
        params: data,
    });
}

/**
 * 删除绑定
 */
export async function deleteCostPolicyBinding(id: number) {
    return request<API.Result<void>>(`/api/ems/cost-policy-bindings/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 更新状态
 */
export async function updateCostPolicyBindingStatus(id: number, status: number) {
    return request<API.Result<CostPolicyBinding>>(`/api/ems/cost-policy-bindings/${id}/status`, {
        method: 'PUT',
        params: { status },
    });
}
