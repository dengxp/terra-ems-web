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

const BASE_URL = '/api/system/constant';

/**
 * 系统常量响应
 */
export interface ConstantResponse {
  [key: string]: Array<{ label: string; value: any; color?: string }>;
}

/**
 * 系统常量映射
 */
export interface ConstantMapResponse {
  [key: string]: { [key: string]: string };
}

/**
 * 获取所有系统常量选项
 */
export async function getConstantOptions() {
  return request<API.Result<ConstantResponse>>(`${BASE_URL}/options`, {
    method: 'GET',
  });
}

/**
 * 获取所有系统常量映射
 */
export async function getConstantMaps() {
  return request<API.Result<ConstantMapResponse>>(`${BASE_URL}/maps`, {
    method: 'GET',
  });
}

/**
 * 获取指定枚举的选项
 */
export async function getEnumOptions(enumName: string) {
  return request<API.Result<Array<{ label: string; value: any }>>>(`${BASE_URL}/enum/${enumName}`, {
    method: 'GET',
  });
}

/**
 * 获取指定字典的数据
 */
export async function getDictData(dictType: string) {
  return request<API.Result<Array<{ label: string; value: string; color?: string }>>>(
    `${BASE_URL}/dict/${dictType}`,
    { method: 'GET' }
  );
}

// 兼容旧名称
export const fetchAllOptions = getConstantOptions;
export const fetchAllMaps = getConstantMaps;
