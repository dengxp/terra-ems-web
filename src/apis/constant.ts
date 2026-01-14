import { request } from '@umijs/max';

const BASE_URL = '/api/system/constant';

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
 * 获取所有系统常量选项
 */
export async function getConstantOptions() {
  return request<API.Result<ConstantResponse>>(`${BASE_URL}/options`, {
    method: 'GET',
  });
}

/**
 * 获取所有系统常量映射
 */
export async function getConstantMaps() {
  return request<API.Result<ConstantMapResponse>>(`${BASE_URL}/maps`, {
    method: 'GET',
  });
}

/**
 * 获取指定枚举的选项
 */
export async function getEnumOptions(enumName: string) {
  return request<API.Result<Array<{ label: string; value: any }>>>(`${BASE_URL}/enum/${enumName}`, {
    method: 'GET',
  });
}

/**
 * 获取指定字典的数据
 */
export async function getDictData(dictType: string) {
  return request<API.Result<Array<{ label: string; value: string; color?: string }>>>(
    `${BASE_URL}/dict/${dictType}`,
    { method: 'GET' }
  );
}

// 兼容旧名称
export const fetchAllOptions = getConstantOptions;
export const fetchAllMaps = getConstantMaps;
