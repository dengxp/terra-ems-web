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
 * 计量点 API
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
    pageNumber?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: string;
    // 查询条件
    code?: string;
    name?: string;
    meterId?: number;
    energyTypeId?: number;
    pointType?: string;
    category?: string;
    status?: number;
}

/**
 * 分页查询计量点
 */
export async function getMeterPointPage(params: MeterPointPageParams) {
    const { current, pageNumber, pageSize, sortField, sortOrder, ...queryParams } = params;
    return request<API.Result<API.PageResult<MeterPoint>>>('/api/meter-points', {
        method: 'GET',
        params: {
            pageNumber: pageNumber ?? (current ? current - 1 : 0),
            pageSize: pageSize || 10,
            sortField: sortField || 'sortOrder',
            sortOrder: sortOrder || 'asc',
            ...queryParams,
        },
    });
}

/**
 * 根据ID查询计量点
 */
export async function getMeterPointById(id: number) {
    return request<API.Result<MeterPoint>>(`/api/meter-points/${id}`, {
        method: 'GET',
    });
}

/**
 * 根据编码查询计量点
 */
export async function getMeterPointByCode(code: string) {
    return request<API.Result<MeterPoint>>(`/api/meter-points/code/${code}`, {
        method: 'GET',
    });
}

/**
 * 根据计量器具ID查询计量点
 */
export async function getMeterPointsByMeterId(meterId: number) {
    return request<API.Result<MeterPoint[]>>(`/api/meter-points/meter/${meterId}`, {
        method: 'GET',
    });
}

/**
 * 根据能源类型ID查询计量点
 */
export async function getMeterPointsByEnergyTypeId(energyTypeId: number) {
    return request<API.Result<MeterPoint[]>>(`/api/meter-points/energy-type/${energyTypeId}`, {
        method: 'GET',
    });
}

/**
 * 根据用能单元ID查询关联的计量点
 */
export async function getMeterPointsByEnergyUnitId(energyUnitId: number) {
    return request<API.Result<MeterPoint[]>>(`/api/meter-points/energy-unit/${energyUnitId}`, {
        method: 'GET',
    });
}

/**
 * 保存计量点（新增或更新）
 * 使用数据映射模式：直接在 data 中传递 meterId 和 energyTypeId
 */
export async function saveMeterPoint(data: Partial<MeterPoint> & { meterId?: number; energyTypeId?: number }) {
    return request<API.Result<MeterPoint>>('/api/meter-points', {
        method: 'POST',
        data,
    });
}

/**
 * 删除计量点
 */
export async function deleteMeterPoint(id: number) {
    return request<API.Result<void>>(`/api/meter-points/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 修改计量点状态
 */
export async function updateMeterPointStatus(id: number, status: number) {
    return request<API.Result<MeterPoint>>(`/api/meter-points/${id}/status`, {
        method: 'POST',
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

/**
 * 获取所有计量点
 */
export async function getAllMeterPoints() {
    return request<API.Result<MeterPoint[]>>('/api/meter-points/all', {
        method: 'GET',
    });
}

export interface PointLatestValue {
    value: number;
    timestamp: string;
    quality: number;
}

export async function getMeterPointLatestValues() {
    return request<API.Result<Record<string, PointLatestValue>>>('/api/meter-points/latest-values', { method: 'GET' });
}
