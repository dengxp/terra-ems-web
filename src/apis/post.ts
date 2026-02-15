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
 * 分页查询岗位列表
 */
export async function findPostsByPage(params: API.PageParams & { current?: number; pageNumber?: number }) {
  const { current, pageNumber, pageSize, ...rest } = params;
  return request<API.Result<API.PageResult<SysPost>>>(`${BASE_URL}/page`, {
    method: 'GET',
    params: {
      pageNumber: pageNumber ?? (current ? current - 1 : 0),
      pageSize: pageSize ?? 10,
      ...rest,
    },
  });
}

/**
 * 查询所有岗位
 */
export async function findAllPosts() {
  return request<API.Result<SysPost[]>>(BASE_URL, {
    method: 'GET',
  });
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
 * 创建岗位
 */
export async function createPost(post: Partial<SysPost>) {
  return request<API.Result<SysPost>>(BASE_URL, {
    method: 'POST',
    data: post,
  });
}

/**
 * 更新岗位信息
 */
export async function updatePost(postId: number, post: Partial<SysPost>) {
  return request<API.Result<SysPost>>(`${BASE_URL}`, {
    method: 'POST',
    data: { ...post, id: postId },
  });
}

/**
 * 删除岗位
 */
export async function deletePost(postId: number) {
  return request<API.Result<void>>(`${BASE_URL}/${postId}`, {
    method: 'DELETE',
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
