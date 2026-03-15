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
 * 登录日志
 */
export interface SysLoginLog {
    id: number;
    userName?: string;
    status?: string;
    ipaddr?: string;
    loginLocation?: string;
    browser?: string;
    os?: string;
    msg?: string;
    loginTime?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 登录日志管理接口
 */
export const loginLogApi = {
    // 分页查询登录日志
    findByPage: (params: any) => {
        const { current, pageSize, ...rest } = params;
        return request('/api/monitor/login-log', {
            method: 'GET',
            params: {
                pageNumber: current ? current - 1 : 0,
                pageSize: pageSize || 10,
                ...rest,
            },
        });
    },

    // 获取登录日志详细
    findById: (id: number) => request(`/api/monitor/login-log/${id}`, { method: 'GET' }),

    // 删除登录日志
    remove: (ids: number | number[]) => {
        if (Array.isArray(ids)) {
            return request('/api/monitor/login-log', { method: 'DELETE', data: ids });
        }
        return request(`/api/monitor/login-log/${ids}`, { method: 'DELETE' });
    },

    // 清空登录日志
    clean: () => request('/api/monitor/login-log/clean', { method: 'DELETE' }),
};
