/*
 * Copyright (c) 2024 泰若科技（广州）有限公司. All rights reserved.
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
    return request<API.Result<ProductionRecord>>(`/api/ems/production-records/${id}`, {
        method: 'PUT',
        data,
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
    return request<API.Result<void>>('/api/ems/production-records/batch', {
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
    page?: number;
    size?: number;
}) {
    return request<API.Result<API.PageResult<ProductionRecord>>>('/api/ems/production-records/search', {
        method: 'GET',
        params,
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
