import { request } from '@umijs/max';

const BASE_URL = '/api/system/role';

/**
 * 分页查询角色列表
 */
export async function findRolesByPage(params: API.PageParams & { current?: number; pageNumber?: number }) {
  const { current, pageNumber, pageSize, ...rest } = params;
  return request<API.Result<API.PageResult<SysRole>>>(`${BASE_URL}/page`, {
    method: 'GET',
    params: {
      pageNumber: pageNumber ?? (current ? current - 1 : 0),
      pageSize: pageSize ?? 10,
      ...rest,
    },
  });
}

/**
 * 查询所有角色
 */
export async function findRoles() {
  return request<API.Result<SysRole[]>>(BASE_URL, {
    method: 'GET',
  });
}

/**
 * 根据ID查询角色详情
 */
export async function findRoleById(roleId: number | string) {
  return request<API.Result<SysRole>>(`${BASE_URL}/${roleId}`, {
    method: 'GET',
  });
}

/**
 * 创建角色
 */
export async function createRole(role: Partial<SysRole>) {
  return request<API.Result<SysRole>>(BASE_URL, {
    method: 'POST',
    data: role,
  });
}

/**
 * 更新角色信息
 */
export async function updateRole(roleId: number, role: Partial<SysRole>) {
  return request<API.Result<SysRole>>(`${BASE_URL}`, {
    method: 'POST',
    data: { ...role, id: roleId },
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
  return request<API.Result<void>>(`${BASE_URL}`, {
    method: 'DELETE',
    data: roleIds,
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
    method: 'POST',
    data: { permissionIds },
  });
}

// 兼容旧名称
export const getRole = findRoleById;
