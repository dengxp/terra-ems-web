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

const BASE_URL = '/api/system/module';

/**
 * 分页查询模块
 */
export async function findModulePage(params?: API.PageParams) {
    return request<API.Result<API.PageResult<SysModule>>>(BASE_URL, {
        method: 'GET',
        params: {
            ...params,
            pageNumber: params?.current ? params.current - 1 : (params?.pageNumber || 0),
        },
    });
}

/**
 * 根据ID查询模块详情
 */
export async function findModuleById(id: number) {
    return request<API.Result<SysModule>>(`${BASE_URL}/${id}`, {
        method: 'GET',
    });
}

/**
 * 获取模块选项列表
 */
export async function findModuleOptions() {
    return request<API.Result<API.Option<number>[]>>(`${BASE_URL}/options`, {
        method: 'GET',
    });
}

/**
 * 获取模块树（含权限列表）
 */
export async function findModuleTree() {
    return request<API.Result<SysModule[]>>(`${BASE_URL}/tree`, {
        method: 'GET',
    });
}

/**
 * 保存或更新模块
 */
export async function saveOrUpdateModule(data: SysModule) {
    return request<API.Result<SysModule>>(BASE_URL, {
        method: 'POST',
        data,
    });
}

/**
 * 批量删除模块
 */
export async function batchDeleteModules(ids: number[]) {
    return request<API.Result<void>>(BASE_URL, {
        method: 'DELETE',
        data: ids,
    });
}
