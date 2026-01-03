import { ApiClient } from './client';
import type { LoginParams, LoginResponse, CaptchaResponse } from '@/types';

/**
 * 认证相关 API
 * 提供登录、登出、验证码等功能
 */
export class AuthApi {
  /**
   * 用户登录
   * @param params - 登录参数
   */
  static async login(params: LoginParams) {
    return ApiClient.post<LoginResponse>('/api/login', params);
  }

  /**
   * 用户登出
   */
  static async logout() {
    return ApiClient.post<void>('/api/logout');
  }

  /**
   * 获取验证码
   * @param identity - 验证码标识
   * @param category - 验证码类型
   */
  static async getCaptcha(identity?: string, category?: string) {
    return ApiClient.get<CaptchaResponse>('/api/captcha/create', { identity, category });
  }

  /**
   * 发送短信验证码
   * @param phone - 手机号
   */
  static async sendSmsCode(phone: string) {
    return ApiClient.post<{ success: boolean; message: string }>('/api/sms/send', { phoneNumber: phone });
  }

  /**
   * 手机号登录
   * @param params - 手机号和验证码
   */
  static async loginBySms(params: { phone: string; code: string }) {
    return ApiClient.post<LoginResponse>('/api/sms/login', params);
  }

  /**
   * 刷新Token (如果需要)
   */
  static async refreshToken() {
    return ApiClient.post<{ token: string }>('/auth/refresh');
  }
}

// 保持向后兼容
export const login = AuthApi.login.bind(AuthApi);
export const logout = AuthApi.logout.bind(AuthApi);
export const getCaptcha = AuthApi.getCaptcha.bind(AuthApi);
export const sendSmsCode = AuthApi.sendSmsCode.bind(AuthApi);
export const loginBySms = AuthApi.loginBySms.bind(AuthApi);

// 向后兼容旧的 createCaptcha 调用
export const createCaptcha = (identity?: string, category?: string) => {
  return AuthApi.getCaptcha(identity, category);
};

export default AuthApi;

