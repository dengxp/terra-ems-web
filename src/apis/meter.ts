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
    current?: number;
    pageNumber?: number;
    pageSize?: number;
}) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<Meter>>>('/api/meters', {
        method: 'GET',
        params: {
            pageNumber: pageNumber ?? (current ? current - 1 : 0),
            pageSize: pageSize ?? 10,
            ...rest,
        },
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
    return request<API.Result<Meter>>('/api/meters', {
        method: 'POST',
        data: { ...data, id },
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
    return request<API.Result<void>>('/api/meters', {
        method: 'DELETE',
        data: ids,
    });
}
