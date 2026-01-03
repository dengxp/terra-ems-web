import { ApiClient } from './client';
import type { UserDTO, PageData, PageParams } from '@/types';

/**
 * 用户相关 API
 * 提供类型安全的用户管理接口
 */
export class UserApi {
  private static readonly BASE_URL = '/api/system/user';

  /**
   * 分页查询用户列表
   * @param params - 分页参数
   */
  static async findByPage(params: PageParams) {
    return ApiClient.get<PageData<UserDTO>>(`${this.BASE_URL}/page`, params);
  }

  /**
   * 根据ID查询用户详情
   * @param userId - 用户ID
   */
  static async findById(userId: number | string) {
    return ApiClient.get<UserDTO>(`${this.BASE_URL}/${userId}`);
  }

  /**
   * 获取当前登录用户信息
   * @param options - 请求选项
   */
  static async getCurrentUser(options?: { skipErrorHandler?: boolean; showType?: number }) {
    return ApiClient.get<UserDTO>(`${this.BASE_URL}/current-user`, undefined, options);
  }

  /**
   * 根据用户名查询用户
   * @param username - 用户名
   */
  static async findByUsername(username: string) {
    return ApiClient.get<UserDTO>(`${this.BASE_URL}/username/${username}`);
  }

  /**
   * 创建用户
   * @param user - 用户信息
   */
  static async create(user: Partial<UserDTO>) {
    return ApiClient.post<UserDTO>(this.BASE_URL, user);
  }

  /**
   * 更新用户信息
   * @param userId - 用户ID
   * @param user - 用户信息
   */
  static async update(userId: number, user: Partial<UserDTO>) {
    return ApiClient.put<UserDTO>(`${this.BASE_URL}/${userId}`, user);
  }

  /**
   * 删除用户
   * @param userId - 用户ID
   */
  static async delete(userId: number) {
    return ApiClient.delete<void>(`${this.BASE_URL}/${userId}`);
  }

  /**
   * 批量删除用户
   * @param userIds - 用户ID列表
   */
  static async batchDelete(userIds: number[]) {
    return ApiClient.delete<void>(`${this.BASE_URL}/batch`, {
      data: { ids: userIds },
    });
  }

  /**
   * 修改用户状态
   * @param userId - 用户ID
   * @param status - 状态
   */
  static async changeStatus(userId: number, status: string) {
    return ApiClient.put<void>(`${this.BASE_URL}/changeStatus`, { userId, status });
  }

  /**
   * 重置用户密码
   * @param userId - 用户ID
   * @param password - 新密码
   */
  static async resetPassword(userId: string, password: string) {
    return ApiClient.put<void>(`${this.BASE_URL}/resetPwd`, { userId, password });
  }

  /**
   * 获取用户的角色
   * @param userId - 用户ID
   */
  static async getAuthRole(userId: string) {
    return ApiClient.get<any>(`${this.BASE_URL}/authRole/${userId}`);
  }

  /**
   * 更新用户的角色
   * @param userId - 用户ID
   * @param roleIds - 角色ID列表
   */
  static async updateAuthRole(userId: number, roleIds: string) {
    return ApiClient.put<void>(`${this.BASE_URL}/authRole`, undefined, {
      params: { userId, roleIds },
    });
  }

  /**
   * 导入用户数据
   * @param formData - 包含Excel文件的FormData
   */
  static async importUsers(formData: FormData) {
    return ApiClient.upload<any>(`${this.BASE_URL}/importData`, formData, {
      skipErrorHandler: true,
    });
  }

  /**
   * 导出用户模板
   */
  static async exportTemplate() {
    return ApiClient.download(`${this.BASE_URL}/exportTemplate`, undefined, 'user_template.xlsx');
  }

  /**
   * 导出用户数据
   */
  static async exportUsers() {
    return ApiClient.download(`${this.BASE_URL}/export`, undefined, 'users.xlsx');
  }

  /**
   * 查询部门管理员选项
   * @param departmentId - 部门ID
   * @param keyword - 搜索关键词
   */
  static async findOptionsForDepartmentManager(departmentId?: number, keyword?: string) {
    return ApiClient.get<any>(`${this.BASE_URL}/options-for-department-manager`, {
      departmentId,
      keyword,
    });
  }

  /**
   * 查询没有部门的用户
   * @param params - 查询参数
   */
  static async findUsersWithoutDepartment(params?: Record<string, any>) {
    return ApiClient.get<PageData<UserDTO>>(`${this.BASE_URL}/no-department`, params);
  }
}

// 保持向后兼容，导出原有的函数
export const findByPage = UserApi.findByPage.bind(UserApi);
export const findUserById = UserApi.findById.bind(UserApi);
export const fetchCurrentUser = UserApi.getCurrentUser.bind(UserApi);
export const changeUserStatus = UserApi.changeStatus.bind(UserApi);
export const resetUserPwd = UserApi.resetPassword.bind(UserApi);
export const getAuthRole = UserApi.getAuthRole.bind(UserApi);
export const updateAuthRole = UserApi.updateAuthRole.bind(UserApi);
export const importUser = UserApi.importUsers.bind(UserApi);
export const exportTemplate = UserApi.exportTemplate.bind(UserApi);
export const exportUser = UserApi.exportUsers.bind(UserApi);
export const findOptionsForDepartmentManager =
  UserApi.findOptionsForDepartmentManager.bind(UserApi);
export const findUsersWithoutDepartment = UserApi.findUsersWithoutDepartment.bind(UserApi);

export default UserApi;
