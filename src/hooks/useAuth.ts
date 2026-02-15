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
