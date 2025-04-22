import {request} from "@umijs/max";

export async function getRoleListAll() {
  return request(
    '/api/system/role/list-all',
    {
      method: 'GET'
    }
  )
}
