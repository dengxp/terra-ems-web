import { request } from '@umijs/max';

const BASE_URL = '/api/system/post';

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
 * 分页查询岗位列表
 */
export async function findPostsByPage(params: API.PageParams) {
  return request<API.Result<API.PageResult<PostDTO>>>(`${BASE_URL}/page`, {
    method: 'GET',
    params,
  });
}

/**
 * 查询所有岗位
 */
export async function findAllPosts() {
  return request<API.Result<PostDTO[]>>(BASE_URL, {
    method: 'GET',
  });
}

/**
 * 根据ID查询岗位详情
 */
export async function findPostById(postId: number) {
  return request<API.Result<PostDTO>>(`${BASE_URL}/${postId}`, {
    method: 'GET',
  });
}

/**
 * 创建岗位
 */
export async function createPost(post: Partial<PostDTO>) {
  return request<API.Result<PostDTO>>(BASE_URL, {
    method: 'POST',
    data: post,
  });
}

/**
 * 更新岗位信息
 */
export async function updatePost(postId: number, post: Partial<PostDTO>) {
  return request<API.Result<PostDTO>>(`${BASE_URL}/${postId}`, {
    method: 'PUT',
    data: post,
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
    method: 'PUT',
    data: { status },
  });
}

/**
 * 导出岗位
 */
export async function exportPost() {
  console.warn('exportPost not implemented yet');
  return Promise.resolve();
}

// 兼容旧名称
export const findPostOptions = getPostOptions;
