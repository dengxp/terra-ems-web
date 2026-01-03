import { ApiClient } from './client';
import type { RoleDTO, PageData, PageParams } from '@/types';

/**
 * 角色相关 API
 * 提供类型安全的角色管理接口
 */
export class RoleApi {
  private static readonly BASE_URL = '/api/system/role';

  /**
   * 分页查询角色列表
   * @param params - 分页参数
   */
  static async findByPage(params: PageParams) {
    return ApiClient.get<PageData<RoleDTO>>(`${this.BASE_URL}/page`, params);
  }

  /**
   * 查询所有角色
   */
  static async findAll() {
    return ApiClient.get<RoleDTO[]>(this.BASE_URL);
  }

  /**
   * 根据ID查询角色详情
   * @param roleId - 角色ID
   */
  static async findById(roleId: number | string) {
    return ApiClient.get<RoleDTO>(`${this.BASE_URL}/${roleId}`);
  }

  /**
   * 创建角色
   * @param role - 角色信息
   */
  static async create(role: Partial<RoleDTO>) {
    return ApiClient.post<RoleDTO>(this.BASE_URL, role);
  }

  /**
   * 更新角色信息
   * @param roleId - 角色ID
   * @param role - 角色信息
   */
  static async update(roleId: number, role: Partial<RoleDTO>) {
    return ApiClient.put<RoleDTO>(`${this.BASE_URL}/${roleId}`, role);
  }

  /**
   * 删除角色
   * @param roleId - 角色ID
   */
  static async delete(roleId: number) {
    return ApiClient.delete<void>(`${this.BASE_URL}/${roleId}`);
  }

  /**
   * 批量删除角色
   * @param roleIds - 角色ID列表
   */
  static async batchDelete(roleIds: number[]) {
    return ApiClient.delete<void>(`${this.BASE_URL}/batch`, {
      data: { ids: roleIds },
    });
  }

  /**
   * 获取角色选项列表（用于下拉框）
   */
  static async getOptions() {
    return ApiClient.get<Array<{ value: number; label: string }>>(`${this.BASE_URL}/options`);
  }

  /**
   * 获取角色的权限
   * @param roleId - 角色ID
   */
  static async getPermissions(roleId: number) {
    return ApiClient.get<number[]>(`${this.BASE_URL}/${roleId}/permissions`);
  }

  /**
   * 更新角色的权限
   * @param roleId - 角色ID
   * @param permissionIds - 权限ID列表
   */
  static async updatePermissions(roleId: number, permissionIds: number[]) {
    return ApiClient.put<void>(`${this.BASE_URL}/${roleId}/permissions`, { permissionIds });
  }
}

// 保持向后兼容
export const findRoles = RoleApi.findAll.bind(RoleApi);
export const findRoleById = RoleApi.findById.bind(RoleApi);
export const getRole = RoleApi.findById.bind(RoleApi);

export default RoleApi;
