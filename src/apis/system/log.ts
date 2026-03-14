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
 * 系统日志
 */
export interface SysLog {
    id: number;
    logType?: string;
    title?: string;
    businessType?: number;
    method?: string;
    requestMethod?: string;
    username?: string;
    deptName?: string;
    url?: string;
    ip?: string;
    location?: string;
    param?: string;
    result?: string;
    status?: number;
    errorMsg?: string;
    costTime?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 系统日志管理接口
 */
export const logApi = {
    // 分页查询系统日志
    findByPage: (params: any) => request('/api/system/log', { method: 'GET', params }),

    // 获取系统日志详细
    findById: (id: number) => request(`/api/system/log/${id}`, { method: 'GET' }),

    // 删除系统日志
    remove: (ids: any) => {
        if (Array.isArray(ids)) {
            return request('/api/system/log', { method: 'DELETE', data: ids });
        }
        return request(`/api/system/log/${ids}`, { method: 'DELETE' });
    },

    // 清空系统日志 (Optional, check if backend supports)
    clean: () => request('/api/system/log/clean', { method: 'DELETE' }),
};
