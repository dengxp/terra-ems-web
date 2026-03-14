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

import { TOKEN_HEADER_NAME, X_TERRA_SESSION_ID } from "@/config/constants";
import Cookie from 'js-cookie';

export function getSessionId() {
  return Cookie.get(X_TERRA_SESSION_ID) || '';
}

export function setSessionId(sessionId: string) {
  Cookie.set(X_TERRA_SESSION_ID, sessionId);
}

/**
 * 获取 Token
 */
export function getToken(): string {
  const token = localStorage.getItem(TOKEN_HEADER_NAME);
  console.log("token: " + token);
  return localStorage.getItem(TOKEN_HEADER_NAME) || '';
}

/**
 * 设置 Token（使用 localStorage 存储）
 */
export function setToken(token: string) {
  localStorage.setItem(TOKEN_HEADER_NAME, token);
}

/**
 * 移除 Token
 */
export function removeToken() {
  const token = getToken();
  console.log("token: " + token);
  localStorage.removeItem(TOKEN_HEADER_NAME);
}

/**
 * 判断用户是否已登录
 */
export function isUserLoggedIn(): boolean {
  const token = getToken();
  return !!token;
}
