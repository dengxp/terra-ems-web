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

const BASE_URL = '/api/system/dept';

/**
 * 部门信息
 */
export interface SysDept {
  id?: number;
  name: string;
  managerId?: number;
  managerName?: string;
  parentId?: number;
  parentName?: string;
  memberCount?: number;
  status?: import("@/enums").DataItemStatus;
  description?: string;
  children?: SysDept[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 获取部门树形结构
 */
export async function getDeptTree() {
  return request<API.Result<SysDept[]>>(`${BASE_URL}/tree`, {
    method: 'GET',
  });
}

/**
 * 根据ID查询部门详情
 */
export async function findDeptById(deptId: number) {
  return request<API.Result<SysDept>>(`${BASE_URL}/${deptId}`, {
    method: 'GET',
  });
}

/**
 * 获取部门选项列表（用于下拉框）
 */
export async function getDeptOptions() {
  return request<API.Result<Array<{ value: number; label: string }>>>(`${BASE_URL}/options`, {
    method: 'GET',
  });
}

/**
 * 获取部门成员列表
 */
export async function findMembers(deptId: number, params?: API.PageParams) {
  return request<API.Result<API.PageResult<any>>>(`${BASE_URL}/${deptId}/members`, {
    method: 'GET',
    params,
  });
}

/**
 * 添加部门成员
 */
export async function addMembers(deptId: number, userIds: number[]) {
  return request<API.Result<void>>(`${BASE_URL}/${deptId}/members`, {
    method: 'POST',
    data: { userIds },
  });
}

/**
 * 移除部门成员
 */
export async function removeMember(deptId: number, userId: number) {
  return request<API.Result<void>>(`${BASE_URL}/${deptId}/members/${userId}`, {
    method: 'DELETE',
  });
}

/**
 * 批量移除部门成员
 */
export async function removeMembers(deptId: number, userIds: number[]) {
  return request<API.Result<void>>(`${BASE_URL}/${deptId}/members`, {
    method: 'DELETE',
    data: userIds,
  });
}

/**
 * 获取部门树形选择器数据
 */
export async function getDeptTreeSelect() {
  return request<API.Result<TreeNode[]>>(`${BASE_URL}/tree-select`, {
    method: 'GET',
  });
}

/**
 * 移动部门
 */
export async function moveDepartment(data: SysDept) {
  return request<API.Result<SysDept>>(BASE_URL, {
    method: 'POST',
    data: data,
  });
}

// 兼容旧名称
export const findDeptTree = getDeptTree;
