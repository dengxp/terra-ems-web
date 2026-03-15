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
 * 操作日志记录对象
 */
export interface OperationLog {
    id: number;
    title: string;
    businessType: number;
    method: string;
    requestMethod: string;
    operatorType: number;
    operationName: string;
    deptName: string;
    operationUrl: string;
    operationIp: string;
    operationLocation: string;
    operationParam: string;
    jsonResult: string;
    status: number;
    errorMsg: string;
    operationTime: Date;
    costTime: number;
}

/**
 * 查询操作日志列表
 * @param params
 */
export async function list(params: any) {
    return request<API.Result<API.PageResult<OperationLog>>>('/api/monitor/operation-log', {
        method: 'GET',
        params: {
            ...params,
            pageNumber: params.current ? params.current - 1 : 0,
            pageSize: params.pageSize,
        },
    });
}

/**
 * 根据ID查询操作日志详情
 * @param id
 */
export async function findOperationLogById(id: number) {
    return request<API.Result<OperationLog>>(`/api/monitor/operation-log/${id}`, {
        method: 'GET',
    });
}

/**
 * 删除操作日志
 * @param ids
 */
export async function del(ids: number[]) {
    return request<API.Result<void>>(`/api/monitor/operation-log/${ids}`, {
        method: 'DELETE',
    });
}

/**
 * 清空操作日志
 */
export async function clean() {
    return request<API.Result<void>>('/api/monitor/operation-log/clean', {
        method: 'DELETE',
    });
}

/**
 * 导出操作日志
 * @param params
 */
export async function exportOperlog(params: any) {
    return request<Blob>('/api/monitor/operation-log/export', {
        method: 'POST',
        data: params,
        responseType: 'blob',
    });
}
