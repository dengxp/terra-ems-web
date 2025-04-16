import {request} from "@@/exports";

export async function login(data: LoginParams) {
  return request(
    '/api/login',
    {
      method: 'POST',
      data
    }
  )
}

export async function getInfo(options?: {[key: string]: any}) {
  return request(
    '/api/getInfo',
    {
      method: 'GET',
      ...options
    }
  )
}

export async function logout(options?: {[key: string]: any}) {
  return request(
    '/api/logout',
    {
      method: 'POST',
      ...options
    }
  )
}

export async function getCodeImg()  {
  return request<Record<string, any>>(
    '/api/captchaImage',
    {
      method: 'GET',
      timeout: 20000
    }
  )
}
