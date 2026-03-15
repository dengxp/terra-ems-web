/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
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
    status?: number;
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
    name?: string;
    code?: string;
    status?: number;
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
export const periodTypeOptions = [
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
            name: params.name,
            code: params.code,
            status: params.status,
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
 * 修改电价策略状态
 */
export async function updatePricePolicyStatus(id: number, status: number) {
    return request<API.Result<PricePolicy>>(`/api/price-policies/${id}/status`, {
        method: 'POST',
        params: { status },
    });
}
