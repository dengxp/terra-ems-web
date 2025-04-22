import {request} from "@umijs/max";

export async function getDeptTree() {
  return request(
    '/api/system/dept/deptTree',
    {
      method: 'GET'
    }
  )
}
