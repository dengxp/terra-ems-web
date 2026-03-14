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

const BASE_URL = '/api/system/user';

/**
 * 根据ID查询用户详情
 */
export async function findUserById(userId: number | string) {
  return request<API.Result<SysUser>>(`${BASE_URL}/${userId}`, {
    method: 'GET',
  });
}

/**
 * 获取当前登录用户信息
 */
export async function fetchCurrentUser(options?: { [key: string]: any }) {
  return request<API.Result<SysUser>>(`${BASE_URL}/current-user`, {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 分页查询用户
 */
export async function findUserPage(params?: any) {
  return request<API.Result<API.PageResult<SysUser>>>(BASE_URL, {
    method: 'GET',
    params,
  });
}

/**
 * 根据用户名查询用户
 */
export async function findByUsername(username: string) {
  return request<API.Result<SysUser>>(`${BASE_URL}/username/${username}`, {
    method: 'GET',
  });
}

/**
 * 修改用户状态
 */
export async function changeUserStatus(userId: number, status: string) {
  return request<API.Result<void>>(`${BASE_URL}/changeStatus`, {
    method: 'POST',
    data: { userId, status },
  });
}

/**
 * 重置用户密码
 */
export async function resetUserPwd(userId: string, password: string) {
  return request<API.Result<void>>(`${BASE_URL}/resetPwd`, {
    method: 'POST',
    data: { userId, password },
  });
}

/**
 * 获取用户的角色
 */
export async function getAuthRole(userId: string) {
  return request<API.Result<any>>(`${BASE_URL}/authRole/${userId}`, {
    method: 'GET',
  });
}

/**
 * 更新用户的角色
 */
export async function updateUserRoles(userId: number | string, roleIds: (number | string)[]) {
  return request<API.Result<void>>(`${BASE_URL}/${userId}/roles`, {
    method: 'POST',
    data: roleIds,
  });
}

/**
 * 导入用户数据
 */
export async function importUser(formData: FormData) {
  return request<API.Result<any>>(`${BASE_URL}/importData`, {
    method: 'POST',
    data: formData,
    skipErrorHandler: true,
  });
}

/**
 * 下载导入结果
 */
export async function downloadImportResult(fileName: string) {
  return request(`${BASE_URL}/import/result/download`, {
    method: 'GET',
    params: { fileName },
    responseType: 'blob',
  });
}

/**
 * 导出用户模板
 */
export async function exportTemplate() {
  return request(`${BASE_URL}/exportTemplate`, {
    method: 'POST',
    responseType: 'blob',
  });
}

/**
 * 导出用户数据
 */
export async function exportUser() {
  return request(`${BASE_URL}/export`, {
    method: 'POST',
    responseType: 'blob',
  });
}

/**
 * 查询部门管理员选项
 */
export async function findOptionsForDepartmentManager(departmentId?: number, keyword?: string) {
  return request<API.Result<any>>(`${BASE_URL}/options-for-department-manager`, {
    method: 'GET',
    params: { departmentId, keyword },
  });
}

/**
 * 设置超级管理员状态
 */
export async function setSuperAdmin(userId: number | string, isSuper: boolean) {
  return request<API.Result<void>>(`${BASE_URL}/${userId}/setSuper`, {
    method: 'POST',
    data: { isSuper },
  });
}

/**
 * 修改当前用户资料
 */
export async function updateUserProfile(data: Partial<SysUser>) {
  return request<API.Result<void>>(`${BASE_URL}/profile`, {
    method: 'PUT',
    data,
  });
}

/**
 * 修改当前用户密码
 */
export async function updateUserPassword(data: any) {
  return request<API.Result<void>>(`${BASE_URL}/updatePwd`, {
    method: 'PUT',
    data,
  });
}
