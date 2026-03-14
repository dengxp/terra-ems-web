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
 * 对标值 API
 */

export interface Benchmark {
    id: number;
    code: string;
    name: string;
    type: BenchmarkType;
    grade?: string;
    value?: number;
    unit?: string;
    nationalNum?: string;
    energyType?: {
        id: number;
        code: string;
        name: string;
    };
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type BenchmarkType = 'NATIONAL' | 'INDUSTRY' | 'ENTERPRISE' | 'REGIONAL';

/**
 * 对标类型选项
 */
export const benchmarkTypeOptions = [
    { label: '国家标准', value: 'NATIONAL', color: '#f5222d' },
    { label: '行业标准', value: 'INDUSTRY', color: '#fa8c16' },
    { label: '企业标准', value: 'ENTERPRISE', color: '#1890ff' },
    { label: '区域标准', value: 'REGIONAL', color: '#52c41a' },
];

export interface BenchmarkPageParams {
    current?: number;
    pageSize?: number;
    code?: string;
    keyword?: string;
    type?: BenchmarkType;
    status?: number;
}

/**
 * 分页查询对标值
 */
export async function getBenchmarkPage(params: BenchmarkPageParams) {
    return request<API.Result<API.PageResult<Benchmark>>>('/api/ems/benchmarks', {
        method: 'GET',
        params: {
            pageNumber: (params.current || 1) - 1,
            pageSize: params.pageSize || 10,
            code: params.code,
            keyword: params.keyword,
            type: params.type,
            status: params.status,
        },
    });
}

/**
 * 获取所有对标值
 */
export async function getAllBenchmarks() {
    return request<API.Result<Benchmark[]>>('/api/ems/benchmarks/all', {
        method: 'GET',
    });
}

/**
 * 获取所有启用的对标值
 */
export async function getEnabledBenchmarks() {
    return request<API.Result<Benchmark[]>>('/api/ems/benchmarks/enabled', {
        method: 'GET',
    });
}

/**
 * 按类型查询对标值
 */
export async function getBenchmarksByType(type: BenchmarkType) {
    return request<API.Result<Benchmark[]>>(`/api/ems/benchmarks/type/${type}`, {
        method: 'GET',
    });
}

/**
 * 按能源类型查询对标值
 */
export async function getBenchmarksByEnergyType(energyTypeId: number) {
    return request<API.Result<Benchmark[]>>(`/api/ems/benchmarks/energy-type/${energyTypeId}`, {
        method: 'GET',
    });
}

/**
 * 根据ID查询对标值
 */
export async function getBenchmarkById(id: number) {
    return request<API.Result<Benchmark>>(`/api/ems/benchmarks/${id}`, {
        method: 'GET',
    });
}

/**
 * 根据编码查询对标值
 */
export async function getBenchmarkByCode(code: string) {
    return request<API.Result<Benchmark>>(`/api/ems/benchmarks/code/${code}`, {
        method: 'GET',
    });
}

/**
 * 创建对标值
 */
export async function createBenchmark(data: Partial<Benchmark>) {
    return request<API.Result<Benchmark>>('/api/ems/benchmarks', {
        method: 'POST',
        data,
    });
}

/**
 * 更新对标值
 */
export async function updateBenchmark(id: number, data: Partial<Benchmark>) {
    return request<API.Result<Benchmark>>('/api/ems/benchmarks', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除对标值
 */
export async function deleteBenchmark(id: number) {
    return request<API.Result<void>>(`/api/ems/benchmarks/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 更新状态
 */
export async function updateBenchmarkStatus(id: number, status: number) {
    return request<API.Result<Benchmark>>(`/api/ems/benchmarks/${id}/status`, {
        method: 'POST',
        params: { status },
    });
}
