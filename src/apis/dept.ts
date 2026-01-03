import { ApiClient } from './client';
import type { PageData, PageParams, TreeNode } from '@/types';

/**
 * 部门信息
 */
export interface DepartmentDTO {
  id?: number;
  name: string;
  managerId?: number;
  managerName?: string;
  parentId?: number;
  parentName?: string;
  memberCount?: number;
  status?: string;
  description?: string;
  children?: DepartmentDTO[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 部门相关 API
 * 提供类型安全的部门管理接口
 */
export class DepartmentApi {
  private static readonly BASE_URL = '/api/system/dept';

  /**
   * 获取部门树形结构
   */
  static async getTree() {
    return ApiClient.get<DepartmentDTO[]>(`${this.BASE_URL}/tree`);
  }

  /**
   * 分页查询部门列表
   * @param params - 分页参数
   */
  static async findByPage(params: PageParams) {
    return ApiClient.get<PageData<DepartmentDTO>>(`${this.BASE_URL}/page`, params);
  }

  /**
   * 查询所有部门
   */
  static async findAll() {
    return ApiClient.get<DepartmentDTO[]>(this.BASE_URL);
  }

  /**
   * 根据ID查询部门详情
   * @param deptId - 部门ID
   */
  static async findById(deptId: number) {
    return ApiClient.get<DepartmentDTO>(`${this.BASE_URL}/${deptId}`);
  }

  /**
   * 创建部门
   * @param dept - 部门信息
   */
  static async create(dept: Partial<DepartmentDTO>) {
    return ApiClient.post<DepartmentDTO>(this.BASE_URL, dept);
  }

  /**
   * 更新部门信息
   * @param deptId - 部门ID
   * @param dept - 部门信息
   */
  static async update(deptId: number, dept: Partial<DepartmentDTO>) {
    return ApiClient.put<DepartmentDTO>(`${this.BASE_URL}/${deptId}`, dept);
  }

  /**
   * 删除部门
   * @param deptId - 部门ID
   */
  static async delete(deptId: number) {
    return ApiClient.delete<void>(`${this.BASE_URL}/${deptId}`);
  }

  /**
   * 获取部门选项列表（用于下拉框）
   */
  static async getOptions() {
    return ApiClient.get<Array<{ value: number; label: string }>>(`${this.BASE_URL}/options`);
  }

  /**
   * 获取部门成员列表
   * @param deptId - 部门ID
   */
  static async getMembers(deptId: number) {
    return ApiClient.get<any[]>(`${this.BASE_URL}/${deptId}/members`);
  }

  /**
   * 添加部门成员
   * @param deptId - 部门ID
   * @param userIds - 用户ID列表
   */
  static async addMembers(deptId: number, userIds: number[]) {
    return ApiClient.post<void>(`${this.BASE_URL}/${deptId}/members`, { userIds });
  }

  /**
   * 移除部门成员
   * @param deptId - 部门ID
   * @param userId - 用户ID
   */
  static async removeMember(deptId: number, userId: number) {
    return ApiClient.delete<void>(`${this.BASE_URL}/${deptId}/members/${userId}`);
  }

  /**
   * 获取部门树形选择器数据
   */
  static async getTreeSelect() {
    return ApiClient.get<TreeNode[]>(`${this.BASE_URL}/tree-select`);
  }
}

// 保持向后兼容
export const findDeptById = DepartmentApi.findById.bind(DepartmentApi);
export const findDeptListAll = DepartmentApi.findAll.bind(DepartmentApi);
export const getDeptTree = DepartmentApi.getTree.bind(DepartmentApi);
export const getDeptOptions = DepartmentApi.getOptions.bind(DepartmentApi);
export const findDeptTree = DepartmentApi.getTree.bind(DepartmentApi);
export const findDeptTreeByCondition = DepartmentApi.findByPage.bind(DepartmentApi);
export const findMembers = DepartmentApi.getMembers.bind(DepartmentApi);
export const addMembers = DepartmentApi.addMembers.bind(DepartmentApi);
export const removeMembers = (deptId: number, userIds: number[]) => {
  // 批量删除需要循环调用单个删除
  return Promise.all(userIds.map(userId => DepartmentApi.removeMember(deptId, userId)));
};
export const moveDepartment = async (id: number, parentId: number) => {
  return DepartmentApi.update(id, { parentId });
};

export default DepartmentApi;
