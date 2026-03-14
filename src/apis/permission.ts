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

const BASE_URL = '/api/system/permission';

/**
 * 分页查询权限
 */
export async function findPermissionPage(params?: API.PageParams) {
    return request<API.Result<API.PageResult<SysPermission>>>(BASE_URL, {
        method: 'GET',
        params: {
            ...params,
            pageNumber: params?.current ? params.current - 1 : (params?.pageNumber || 0),
        },
    });
}

/**
 * 查询权限详情
 */
export async function findPermissionById(id: number) {
    return request<API.Result<SysPermission>>(`${BASE_URL}/${id}`, {
        method: 'GET',
    });
}

/**
 * 获取权限选项列表
 */
export async function findPermissionOptions() {
    return request<API.Result<API.Option<number>[]>>(`${BASE_URL}/options`, {
        method: 'GET',
    });
}

/**
 * 保存或更新权限
 */
export async function saveOrUpdatePermission(data: SysPermission) {
    return request<API.Result<SysPermission>>(BASE_URL, {
        method: 'POST',
        data,
    });
}

/**
 * 批量删除权限
 */
export async function batchDeletePermissions(ids: number[]) {
    return request<API.Result<void>>(BASE_URL, {
        method: 'DELETE',
        data: ids,
    });
}

/**
 * 同步扫码权限
 */
export async function syncPermissions() {
    return request<API.Result<void>>(`${BASE_URL}/sync`, {
        method: 'POST',
    });
}
