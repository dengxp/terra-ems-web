import { request } from "@@/exports";

export async function getMenuTree() {
  return request(
    '/api/system/menu/tree',
    {
      method: 'GET'
    }
  )
}

/**
 * 根据ID查询菜单详情
 */
export async function findMenuById(id: number) {
  return request<API.Result<any>>(`/api/system/menu/${id}`, {
    method: 'GET',
  });
}
