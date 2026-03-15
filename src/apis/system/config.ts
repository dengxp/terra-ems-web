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
 * 参数配置
 */
export interface SysConfig {
    id: number;
    configName?: string;
    configKey?: string;
    configValue?: string;
    configType?: string; // Y/N default
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 根据键名查询参数值
 */
export async function findConfigValue(configKey: string) {
    return request<API.Result<string>>(`/api/system/config/configKey/${configKey}`, {
        method: 'GET',
    });
}

/**
 * 根据ID查询参数配置详情
 */
export async function findConfigById(id: number) {
    return request<API.Result<SysConfig>>(`/api/system/config/${id}`, {
        method: 'GET',
    });
}

/**
 * 参数配置管理接口 (保留兼容对象，但主要使用 useCrud)
 */
export const configApi = {
    getConfigValue: findConfigValue,
};
