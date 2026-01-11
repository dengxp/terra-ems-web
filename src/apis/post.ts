import { ApiClient } from './client';
import type { PageData, PageParams } from '@/types';

/**
 * 岗位信息
 */
export interface PostDTO {
  id?: number;
  code: string;
  name: string;
  ranking?: number;
  status?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 岗位相关 API
 * 提供类型安全的岗位管理接口
 */
export class PostApi {
  private static readonly BASE_URL = '/api/system/post';

  /**
   * 分页查询岗位列表
   * @param params - 分页参数
   */
  static async findByPage(params: PageParams) {
    return ApiClient.get<PageData<PostDTO>>(`${this.BASE_URL}/page`, params);
  }

  /**
   * 查询所有岗位
   */
  static async findAll() {
    return ApiClient.get<PostDTO[]>(this.BASE_URL);
  }

  /**
   * 根据ID查询岗位详情
   * @param postId - 岗位ID
   */
  static async findById(postId: number) {
    return ApiClient.get<PostDTO>(`${this.BASE_URL}/${postId}`);
  }

  /**
   * 创建岗位
   * @param post - 岗位信息
   */
  static async create(post: Partial<PostDTO>) {
    return ApiClient.post<PostDTO>(this.BASE_URL, post);
  }

  /**
   * 更新岗位信息
   * @param postId - 岗位ID
   * @param post - 岗位信息
   */
  static async update(postId: number, post: Partial<PostDTO>) {
    return ApiClient.put<PostDTO>(`${this.BASE_URL}/${postId}`, post);
  }

  /**
   * 删除岗位
   * @param postId - 岗位ID
   */
  static async delete(postId: number) {
    return ApiClient.delete<void>(`${this.BASE_URL}/${postId}`);
  }

  /**
   * 获取岗位选项列表（用于下拉框）
   */
  static async getOptions() {
    return ApiClient.get<Array<{ value: number; label: string }>>(`${this.BASE_URL}/options`);
  }

  /**
   * 修改岗位状态
   * @param postId - 岗位ID
   * @param status - 状态
   */
  static async changeStatus(postId: number, status: string) {
    return ApiClient.put<void>(`${this.BASE_URL}/${postId}/status`, { status });
  }
}

// 保持向后兼容
export const getPostOptions = PostApi.getOptions.bind(PostApi);
export const findPostOptions = PostApi.getOptions.bind(PostApi);
export const exportPost = () => {
  console.warn('exportPost not implemented yet');
  return Promise.resolve();
};

export default PostApi;
