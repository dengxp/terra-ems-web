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
