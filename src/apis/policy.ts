/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

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
    keyword?: string;
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
            keyword: params.keyword,
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
