/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
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

import { login as loginApi, logout as logoutApi } from '@/apis/login';
import { TAB_STORAGE_KEY } from "@/config/constants";
import { removeToken, setToken } from "@/utils/auth";
import { history } from "@@/core/history";
import { useModel } from "@umijs/max";

export default function useAuth() {
  const { setInitialState } = useModel('@@initialState');

  const redirect = () => {
    const urlParams = new URL(window.location.href).searchParams;
    const redirectUrl = urlParams.get('redirect') || '/';

    urlParams.delete('redirect');
    const remainingParams = new URLSearchParams(urlParams);

    history.push(
      remainingParams.toString()
        ? `${redirectUrl}?${remainingParams.toString()}`
        : redirectUrl
    );
  }

  const login = async (userInfo: LoginParams) => {
    const res = await loginApi(userInfo);
    if (res.success) {
      const data = res.data;
      setToken(data.token);
      setInitialState(s => ({ ...s, currentUser: { ...s?.currentUser, token: data.token, name: data.username } }))
    }
  }

  const logout = async () => {
    try {
      await logoutApi();
    } finally {
      removeToken();
      // 清除 TabsLayout 缓存，避免下次登录时恢复之前的页签
      localStorage.removeItem(TAB_STORAGE_KEY);
      localStorage.removeItem(TAB_STORAGE_KEY + '_active');
      setInitialState(s => ({ ...s, currentUser: undefined }));
      redirect();
    }
  }

  return {
    login,
    logout,
    redirect
  }
}
