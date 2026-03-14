/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

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
