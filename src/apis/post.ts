import {request} from "@umijs/max";

export async function getPostListAll() {
  return request(
    '/api/system/post/list-all',
    {
      method: 'GET'
    }
  )
}
