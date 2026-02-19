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
