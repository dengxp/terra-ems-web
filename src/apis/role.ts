import { request } from '@umijs/max';

const BASE_URL = '/api/system/role';

/**
 * 分页查询角色列表
 */
export async function findRolesByPage(params: API.PageParams) {
  return request<API.Result<API.PageResult<RoleDTO>>>(`${BASE_URL}/page`, {
    method: 'GET',
    params,
  });
}

/**
 * 查询所有角色
 */
export async function findRoles() {
  return request<API.Result<RoleDTO[]>>(BASE_URL, {
    method: 'GET',
  });
}

/**
 * 根据ID查询角色详情
 */
export async function findRoleById(roleId: number | string) {
  return request<API.Result<RoleDTO>>(`${BASE_URL}/${roleId}`, {
    method: 'GET',
  });
}

/**
 * 创建角色
 */
export async function createRole(role: Partial<RoleDTO>) {
  return request<API.Result<RoleDTO>>(BASE_URL, {
    method: 'POST',
    data: role,
  });
}

/**
 * 更新角色信息
 */
export async function updateRole(roleId: number, role: Partial<RoleDTO>) {
  return request<API.Result<RoleDTO>>(`${BASE_URL}/${roleId}`, {
    method: 'PUT',
    data: role,
  });
}

/**
 * 删除角色
 */
export async function deleteRole(roleId: number) {
  return request<API.Result<void>>(`${BASE_URL}/${roleId}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除角色
 */
export async function batchDeleteRoles(roleIds: number[]) {
  return request<API.Result<void>>(`${BASE_URL}/batch`, {
    method: 'DELETE',
    data: { ids: roleIds },
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
    method: 'PUT',
    data: { permissionIds },
  });
}

// 兼容旧名称
export const getRole = findRoleById;
