import { request } from '@umijs/max';

const BASE_URL = '/api/system/post';

/**
 * 岗位信息
 */
export interface SysPost {
  id?: number;
  code: string;
  name: string;
  ranking?: number;
  status?: import("@/enums").DataItemStatus;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 根据ID查询岗位详情
 */
export async function findPostById(postId: number) {
  return request<API.Result<SysPost>>(`${BASE_URL}/${postId}`, {
    method: 'GET',
  });
}

/**
 * 获取岗位选项列表（用于下拉框）
 */
export async function getPostOptions() {
  return request<API.Result<Array<{ value: number; label: string }>>>(`${BASE_URL}/options`, {
    method: 'GET',
  });
}

/**
 * 修改岗位状态
 */
export async function changePostStatus(postId: number, status: string) {
  return request<API.Result<void>>(`${BASE_URL}/${postId}/status`, {
    method: 'POST',
    data: { status },
  });
}

/**
 * 导出岗位
 */
export async function exportPost(params: Record<string, any>) {
  return request<Blob>(`${BASE_URL}/export`, {
    method: 'POST',
    data: params,
    requestType: 'form',
    responseType: 'blob',
  });
}

// 兼容旧名称
export const findPostOptions = getPostOptions;
