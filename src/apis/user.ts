import {request} from "@umijs/max";
import {getToken, parseStrEmpty} from "@/utils";

export async function findByPage(params: Record<string, string>) {
  return request(
    '/api/system/user/page',
    {
      method: 'GET',
      params
    }
  )
}

export async function getUser(userId: string) {
  return request(
    '/api/system/user/' + parseStrEmpty(userId),
    {
      method: 'GET'
    }
  )
}
export async function changeUserStatus(userId: number, status: string) {
  return request(
    '/api/system/user/changeStatus',
    {
      method: 'PUT',
      data: {userId, status}
    }
  )
}

export async function resetUserPwd(userId: string, password: string) {
  return request(
    '/api/system/user/resetPwd',
    {
      method: 'PUT',
      data: {userId, password}
    }
  )
}

export async function getAuthRole(userId: string) {
  return request(
    '/api/system/user/authRole/' + userId,
    {
      method: 'GET'
    }
  )
}

export async function updateAuthRole(userId: number, roleIds: string) {
  return request(
    '/api/system/user/authRole',
    {
      method: 'PUT',
      // headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      params: {userId, roleIds}
    }
  )
}

export async function importUser(data: FormData) {
  return request(
    '/api/system/user/importData',
    {
      method: 'POST',
      data,
      skipErrorHandler: true
    }
  )
}

export async function exportTemplate() {
  return request(
    '/api/system/user/exportTemplate',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      skipErrorHandler: true
    }
  )
}

export async function exportUser() {
  return request(
    '/api/system/user/export',
    {
      method: 'POST',
      responseType: 'blob',
      skipErrorHandler: true
    }
  )
}
