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

const BASE_URL = '/api/system/post';

/**
 * 岗位信息
 */
export interface SysPost {
  id?: number;
  code: string;
  name: string;
  ranking?: number;
  status?: import("@/enums").DataItemStatus;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 根据ID查询岗位详情
 */
export async function findPostById(postId: number) {
  return request<API.Result<SysPost>>(`${BASE_URL}/${postId}`, {
    method: 'GET',
  });
}

/**
 * 获取岗位选项列表（用于下拉框）
 */
export async function getPostOptions() {
  return request<API.Result<Array<{ value: number; label: string }>>>(`${BASE_URL}/options`, {
    method: 'GET',
  });
}

/**
 * 修改岗位状态
 */
export async function changePostStatus(postId: number, status: string) {
  return request<API.Result<void>>(`${BASE_URL}/${postId}/status`, {
    method: 'POST',
    data: { status },
  });
}

/**
 * 导出岗位
 */
export async function exportPost(params: Record<string, any>) {
  return request<Blob>(`${BASE_URL}/export`, {
    method: 'POST',
    data: params,
    requestType: 'form',
    responseType: 'blob',
  });
}

// 兼容旧名称
export const findPostOptions = getPostOptions;
