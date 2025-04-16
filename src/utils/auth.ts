import Cookie from 'js-cookie';
import {TOKEN_HEADER_NAME} from "@/config/constants";
import {history} from "@umijs/max";

export function getToken(): string {
  return Cookie.get(TOKEN_HEADER_NAME) || '';
}

export function setToken(token: string) {
  Cookie.set(TOKEN_HEADER_NAME, token);
}

export function removeToken() {
  Cookie.remove(TOKEN_HEADER_NAME);
}

export function isUserLoggedIn(): boolean {
  const token = getToken();
  return !!token;
}
