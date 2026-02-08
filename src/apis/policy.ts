import { request } from '@umijs/max';

/**
 * 政策法规 API
 */

export interface Policy {
    id: number;
    title: string;
    type: PolicyType;
    department?: string;
    issuingDate?: string;
    fileUrl?: string;
    summary?: string;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type PolicyType = 'NATIONAL' | 'LOCAL' | 'INDUSTRY' | 'OTHER';

/**
 * 政策类型选项
 */
export const policyTypeOptions = [
    { label: '国家级', value: 'NATIONAL', color: '#f5222d' },
    { label: '地方级', value: 'LOCAL', color: '#fa8c16' },
    { label: '行业标准', value: 'INDUSTRY', color: '#1890ff' },
    { label: '其他', value: 'OTHER', color: '#999' },
];

export interface PolicyPageParams {
    current?: number;
    pageSize?: number;
    title?: string;
    type?: PolicyType;
    status?: number;
}

/**
 * 分页查询政策法规
 */
export async function getPolicyPage(params: PolicyPageParams) {
    return request<API.Result<API.PageResult<Policy>>>('/api/ems/policies', {
        method: 'GET',
        params: {
            pageNumber: (params.current || 1) - 1,
            pageSize: params.pageSize || 10,
            title: params.title,
            type: params.type,
            status: params.status,
        },
    });
}

/**
 * 获取所有启用的政策法规
 */
export async function getEnabledPolicies() {
    return request<API.Result<Policy[]>>('/api/ems/policies/enabled', {
        method: 'GET',
    });
}

/**
 * 按类型查询政策法规
 */
export async function getPoliciesByType(type: PolicyType) {
    return request<API.Result<Policy[]>>(`/api/ems/policies/type/${type}`, {
        method: 'GET',
    });
}

/**
 * 根据ID查询政策法规
 */
export async function getPolicyById(id: number) {
    return request<API.Result<Policy>>(`/api/ems/policies/${id}`, {
        method: 'GET',
    });
}

/**
 * 创建政策法规
 */
export async function createPolicy(data: Partial<Policy>) {
    return request<API.Result<Policy>>('/api/ems/policies', {
        method: 'POST',
        data,
    });
}

/**
 * 更新政策法规
 */
export async function updatePolicy(id: number, data: Partial<Policy>) {
    return request<API.Result<Policy>>('/api/ems/policies', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除政策法规
 */
export async function deletePolicy(id: number) {
    return request<API.Result<void>>(`/api/ems/policies/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 更新政策状态
 */
export async function updatePolicyStatus(id: number, status: number) {
    return request<API.Result<Policy>>(`/api/ems/policies/${id}/status`, {
        method: 'POST',
        params: { status },
    });
}

/**
 * 按类型统计政策数量
 */
export async function countByType(type: PolicyType) {
    return request<API.Result<number>>(`/api/ems/policies/statistics/count/${type}`, {
        method: 'GET',
    });
}
