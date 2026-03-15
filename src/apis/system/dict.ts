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
 * 字典类型
 */
export interface SysDictType {
    id: number;
    name?: string;
    type?: string;
    status?: import("@/enums").DataItemStatus;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 字典数据
 */
export interface SysDictData {
    id: number;
    sortOrder?: number;
    label?: string;
    value?: string;
    typeCode?: string;
    status?: import("@/enums").DataItemStatus;
    tagType?: string;
    tagColor?: string;
    isDefault?: string;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 字典数据管理接口
 */
export const dictDataApi = {
    // 根据类型获取字典项 (useDict 使用)
    getByType: (type: string) => request(`/api/system/dict/data/type/${type}`, { method: 'GET' }),
};

/**
 * 字典类型管理接口 (保留兼容对象，但主要使用 useCrud)
 */
export const dictTypeApi = {};
