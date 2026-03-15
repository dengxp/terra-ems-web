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
 * 产品产量记录API
 */

export interface ProductionRecord {
    id?: number;
    energyUnitId: number;
    recordDate: string;
    productName: string;
    quantity: number;
    unit?: string;
    granularity: 'HOUR' | 'DAY' | 'MONTH' | 'YEAR';
    dataType: string;
    productType?: string;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ProductQuantitySummary {
    [productName: string]: number;
}

/**
 * 创建产量记录
 */
export async function createProductionRecord(data: ProductionRecord) {
    return request<API.Result<ProductionRecord>>('/api/ems/production-records', {
        method: 'POST',
        data,
    });
}

/**
 * 更新产量记录
 */
export async function updateProductionRecord(id: number, data: ProductionRecord) {
    return request<API.Result<ProductionRecord>>('/api/ems/production-records', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除产量记录
 */
export async function deleteProductionRecord(id: number) {
    return request<API.Result<void>>(`/api/ems/production-records/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 批量删除产量记录
 */
export async function batchDeleteProductionRecords(ids: number[]) {
    return request<API.Result<void>>('/api/ems/production-records', {
        method: 'DELETE',
        data: ids,
    });
}

/**
 * 获取产量记录详情
 */
export async function getProductionRecord(id: number) {
    return request<API.Result<ProductionRecord>>(`/api/ems/production-records/${id}`, {
        method: 'GET',
    });
}

/**
 * 分页查询产量记录
 */
export async function getProductionRecords(params: {
    energyUnitId: number;
    dataType?: string;
    startDate: string;
    endDate: string;
    current?: number;
    pageNumber?: number;
    pageSize?: number;
}) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<ProductionRecord>>>('/api/ems/production-records', {
        method: 'GET',
        params: {
            pageNumber: pageNumber ?? (current ? current - 1 : 0),
            pageSize: pageSize ?? 10,
            ...rest,
        },
    });
}

/**
 * 汇总产量
 */
export async function sumProductionQuantity(params: {
    energyUnitId: number;
    dataType?: string;
    startDate: string;
    endDate: string;
}) {
    return request<API.Result<number>>('/api/ems/production-records/summary', {
        method: 'GET',
        params,
    });
}

/**
 * 按产品分组统计产量
 */
export async function sumProductionByProduct(params: {
    energyUnitId: number;
    dataType?: string;
    startDate: string;
    endDate: string;
}) {
    return request<API.Result<ProductQuantitySummary>>('/api/ems/production-records/summary/by-product', {
        method: 'GET',
        params,
    });
}

/**
 * 获取产品名称列表
 */
export async function getProductNames(energyUnitId: number, dataType?: string) {
    return request<API.Result<string[]>>('/api/ems/production-records/products', {
        method: 'GET',
        params: { energyUnitId, dataType },
    });
}
