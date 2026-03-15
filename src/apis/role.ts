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

const BASE_URL = '/api/system/role';

/**
 * 根据ID查询角色详情
 */
export async function findRoleById(roleId: number | string) {
  return request<API.Result<SysRole>>(`${BASE_URL}/${roleId}`, {
    method: 'GET',
  });
}

/**
 * 获取角色选项列表（用于下拉框）
 */
export async function getRoleOptions() {
  return request<API.Result<Array<{ value: number; label: string }>>>(`${BASE_URL}/options`, {
    method: 'GET',
  });
}

/**
 * 获取角色列表（不分页）
 */
export async function findRoleList(params?: any) {
  return request<API.Result<SysRole[]>>(`${BASE_URL}/list`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取角色的权限
 */
export async function getRolePermissions(roleId: number) {
  return request<API.Result<number[]>>(`${BASE_URL}/${roleId}/permissions`, {
    method: 'GET',
  });
}

/**
 * 更新角色的权限
 */
export async function updateRolePermissions(roleId: number, permissionIds: number[]) {
  return request<API.Result<void>>(`${BASE_URL}/${roleId}/permissions`, {
    method: 'POST',
    data: { permissionIds },
  });
}

/**
 * 修改角色状态
 */
export async function changeRoleStatus(roleId: number | string, status: string) {
  return request<API.Result<SysRole>>(`${BASE_URL}/${roleId}/status`, {
    method: 'PATCH',
    params: { status },
  });
}

/**
 * 添加角色成员
 */
export async function addRoleMembers(roleId: number, memberIds: number[]) {
  return request<API.Result<void>>(`${BASE_URL}/${roleId}/members`, {
    method: 'POST',
    data: memberIds,
  });
}

/**
 * 移除角色成员
 */
export async function removeRoleMembers(roleId: number, memberIds: number[]) {
  return request<API.Result<void>>(`${BASE_URL}/${roleId}/members`, {
    method: 'DELETE',
    data: memberIds,
  });
}

// 兼容旧名称
export const getRole = findRoleById;
