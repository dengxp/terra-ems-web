import { ApiClient } from './client';
import type { PageData, PageParams } from '@/types';

/**
 * 职位信息
 */
export interface PositionDTO {
  id?: number;
  code: string;
  name: string;
  ranking?: number;
  status?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 职位相关 API
 * 提供类型安全的职位管理接口
 */
export class PositionApi {
  private static readonly BASE_URL = '/api/system/position';

  /**
   * 分页查询职位列表
   * @param params - 分页参数
   */
  static async findByPage(params: PageParams) {
    return ApiClient.get<PageData<PositionDTO>>(`${this.BASE_URL}/page`, params);
  }

  /**
   * 查询所有职位
   */
  static async findAll() {
    return ApiClient.get<PositionDTO[]>(this.BASE_URL);
  }

  /**
   * 根据ID查询职位详情
   * @param positionId - 职位ID
   */
  static async findById(positionId: number) {
    return ApiClient.get<PositionDTO>(`${this.BASE_URL}/${positionId}`);
  }

  /**
   * 创建职位
   * @param position - 职位信息
   */
  static async create(position: Partial<PositionDTO>) {
    return ApiClient.post<PositionDTO>(this.BASE_URL, position);
  }

  /**
   * 更新职位信息
   * @param positionId - 职位ID
   * @param position - 职位信息
   */
  static async update(positionId: number, position: Partial<PositionDTO>) {
    return ApiClient.put<PositionDTO>(`${this.BASE_URL}/${positionId}`, position);
  }

  /**
   * 删除职位
   * @param positionId - 职位ID
   */
  static async delete(positionId: number) {
    return ApiClient.delete<void>(`${this.BASE_URL}/${positionId}`);
  }

  /**
   * 获取职位选项列表（用于下拉框）
   */
  static async getOptions() {
    return ApiClient.get<Array<{ value: number; label: string }>>(`${this.BASE_URL}/options`);
  }

  /**
   * 修改职位状态
   * @param positionId - 职位ID
   * @param status - 状态
   */
  static async changeStatus(positionId: number, status: string) {
    return ApiClient.put<void>(`${this.BASE_URL}/${positionId}/status`, { status });
  }
}

// 保持向后兼容
export const getPositionOptions = PositionApi.getOptions.bind(PositionApi);
export const findOptions = PositionApi.getOptions.bind(PositionApi);
export const exportPosition = () => {
  // 如果后端有导出接口，这里调用；否则先返回一个提示
  console.warn('exportPosition not implemented yet');
  return Promise.resolve();
};

export default PositionApi;
