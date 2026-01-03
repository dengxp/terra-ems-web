import { ApiClient } from './client';

/**
 * 系统常量响应
 */
export interface ConstantResponse {
  [key: string]: Array<{ label: string; value: any; color?: string }>;
}

/**
 * 系统常量映射
 */
export interface ConstantMapResponse {
  [key: string]: { [key: string]: string };
}

/**
 * 系统常量相关 API
 * 提供枚举、字典等常量数据
 */
export class ConstantApi {
  private static readonly BASE_URL = '/api/system/constant';

  /**
   * 获取所有系统常量选项
   * 用于下拉框、单选框等
   */
  static async getOptions() {
    return ApiClient.get<ConstantResponse>(`${this.BASE_URL}/options`);
  }

  /**
   * 获取所有系统常量映射
   * 用于显示转换（如状态码转文字）
   */
  static async getMaps() {
    return ApiClient.get<ConstantMapResponse>(`${this.BASE_URL}/maps`);
  }

  /**
   * 获取指定枚举的选项
   * @param enumName - 枚举名称
   */
  static async getEnumOptions(enumName: string) {
    return ApiClient.get<Array<{ label: string; value: any }>>(`${this.BASE_URL}/enum/${enumName}`);
  }

  /**
   * 获取指定字典的数据
   * @param dictType - 字典类型
   */
  static async getDictData(dictType: string) {
    return ApiClient.get<Array<{ label: string; value: string; color?: string }>>(
      `${this.BASE_URL}/dict/${dictType}`
    );
  }
}

// 保持向后兼容
export const getConstantOptions = ConstantApi.getOptions.bind(ConstantApi);
export const getConstantMaps = ConstantApi.getMaps.bind(ConstantApi);
export const fetchAllOptions = ConstantApi.getOptions.bind(ConstantApi);
export const fetchAllMaps = ConstantApi.getMaps.bind(ConstantApi);

export default ConstantApi;
