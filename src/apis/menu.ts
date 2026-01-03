import {request} from "@@/exports";

export async function getMenuTree() {
  return request(
    '/api/system/menu/tree',
    {
      method: 'GET'
    }
  )
}
