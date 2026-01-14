import { request } from '@umijs/max';

/**
 * 用户登录
 */
export async function login(params: LoginParams) {
  return request<API.Result<LoginResponse>>('/api/login', {
    method: 'POST',
    data: params,
  });
}

/**
 * 用户登出
 */
export async function logout() {
  return request<API.Result<void>>('/api/logout', {
    method: 'POST',
  });
}

/**
 * 获取验证码
 */
export async function getCaptcha(identity?: string, category?: string) {
  return request<API.Result<CaptchaResponse>>('/api/captcha/create', {
    method: 'GET',
    params: { identity, category },
  });
}

/**
 * 发送短信验证码
 */
export async function sendSmsCode(phone: string) {
  return request<API.Result<{ success: boolean; message: string }>>('/api/sms/send', {
    method: 'POST',
    data: { phoneNumber: phone },
  });
}

/**
 * 手机号登录
 */
export async function loginBySms(params: { phone: string; code: string }) {
  return request<API.Result<LoginResponse>>('/api/sms/login', {
    method: 'POST',
    data: params,
  });
}

/**
 * 刷新Token
 */
export async function refreshToken() {
  return request<API.Result<{ token: string }>>('/auth/refresh', {
    method: 'POST',
  });
}

// 兼容旧名称
export const createCaptcha = getCaptcha;
