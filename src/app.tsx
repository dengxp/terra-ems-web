import { Footer, Question, SelectLang, AvatarDropdown, AvatarName, IconMap } from '@/components';
import Icon, { LinkOutlined } from '@ant-design/icons';
import type { MenuDataItem, Settings as LayoutSettings } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history, Link } from '@umijs/max';
import defaultSettings from '../config/defaultSettings';
import { errorConfig } from './requestErrorConfig';

import React from 'react';
import { generateAvatar } from "@/utils/avatar";
import { getToken, removeToken } from "@/utils/auth";
import { LOGIN_PATH } from "@/config/constants";
import TabsLayout, { TabsLayoutProps } from "@/components/TabsLayout";
import { fetchCurrentUser } from "@/apis";
import { PERMISSIONS } from "@/config/permissions";

const isDev = process.env.NODE_ENV === 'development';

export const getCustomTabs = () => (props: TabsLayoutProps) => {
  return <TabsLayout {...props} />
}

const handleIcon = (icon?: React.ReactNode) => {
  return typeof icon === 'string' && icon.includes('|svg')
    ? <Icon component={IconMap[icon.replace('|svg', '')]} />
    : icon;
};

const menuDataRender = (menuData: MenuDataItem[]): MenuDataItem[] => {
  return menuData.map(item => {
    let icon = handleIcon(item.icon);
    let children = item.children ? menuDataRender(item.children) : undefined;
    return {
      ...item,
      icon,
      children
    }
  });
}

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  layoutSettings?: Partial<LayoutSettings>;
  currentUser?: CurrentUser;
  fetchUserInfo?: () => Promise<CurrentUser | undefined>;
}> {
  const fetchUserInfo = async () => {
    try {
      console.log('[getInitialState] fetchUserInfo called, token:', getToken());
      const result = await fetchCurrentUser({
        skipErrorHandler: true,
        showType: 1,
      });
      const user = result.data; // SysUser
      let avatar = user.avatar || generateAvatar();

      // 从 user.roles 提取角色代码
      const roles = user.roles?.map((role: { code?: string }) => role.code || '').filter(Boolean) || ['ROLE_DEFAULT'];

      // 后端 SysUser 暂未返回 permissions，从 user.roles 或特定字段尝试提取，或在此处根据开发需求 Mock
      const permissions: string[] = user.permissions || [];

      // 开发环境下，如果是 admin 用户，注入超级管理员权限以便调试
      if (isDev && user.username === 'admin') {
        permissions.push(PERMISSIONS.SUPER_ADMIN);
      }

      return {
        id: user.id?.toString(),
        name: user.username,
        nickname: user.nickname,
        avatar,
        roles,
        permissions
      }
    } catch (error) {
      console.log(error);
      removeToken();
      return undefined;
    }
  };
  // 如果不是登录页且有 Token，才获取用户信息
  const { location } = history;
  const isLoginPage = location.pathname === LOGIN_PATH;
  const currentUser = (!isLoginPage && getToken()) ? await fetchUserInfo() : undefined;

  return {
    fetchUserInfo,
    currentUser,
    layoutSettings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {

  return {
    actionsRender: () => [<Question key="doc" />, <SelectLang key="SelectLang" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar || generateAvatar(),
      title: <AvatarName />,
      render: (_, avatarChildren) => {
        return <AvatarDropdown menu={true}>{avatarChildren}</AvatarDropdown>;
      },
    },
    waterMarkProps: {
      content: initialState?.currentUser?.name,
    },
    footerRender: () => <Footer />,
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (!initialState?.currentUser && location.pathname !== LOGIN_PATH) {
        removeToken();
        history.push(LOGIN_PATH);
      }
    },
    bgLayoutImgList: [
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/D2LWSqNny4sAAAAAAAAAAAAAFl94AQBr',
        left: 85,
        bottom: 100,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/C2TWRpJpiC0AAAAAAAAAAAAAFl94AQBr',
        bottom: -68,
        right: -45,
        height: '303px',
      },
      {
        src: 'https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/F6vSTbj8KpYAAAAAAAAAAAAAFl94AQBr',
        bottom: 0,
        left: 0,
        width: '331px',
      },
    ],
    links: isDev
      ? [
        <Link key="openapi" to="/umi/plugin/openapi" target="_blank">
          <LinkOutlined />
          <span>接口文档 (OpenAPI)</span>
        </Link>,
      ]
      : [],
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // if (initialState?.loading) return <PageLoading />;
      return (
        <>
          {children}
          {isDev && (
            <SettingDrawer
              disableUrlParams
              enableDarkTheme
              settings={initialState?.layoutSettings}
              onSettingChange={(settings) => {
                setInitialState((preInitialState) => ({
                  ...preInitialState,
                  layoutSettings: settings,
                }));
              }}
            />
          )}
        </>
      );
    },
    menuItemRender: (menuItemProps, defaultDom) => {
      // 如果是外部链接或没有路径，使用默认渲染
      if (menuItemProps.isUrl || !menuItemProps.path) {
        return defaultDom;
      }
      // 对于所有有路径的菜单项，使用Link包装实现路由跳转，利用defaultDom处理收起状态
      return <Link to={menuItemProps.path}>{defaultDom}</Link>
    },
    menuDataRender,

    ...initialState?.layoutSettings,
  };
};

// export const onRouteChange = async ({location}: any) => {
//
//   if (location.pathname !== LOGIN_PATH && !isUserLoggedIn()) {
//     history.replace(LOGIN_PATH);
//   }
//
//   if (location.pathname === LOGIN_PATH && isUserLoggedIn()) {
//     console.log("onRouteChange: login");
//     // 获取 redirect 参数
//     const redirectUri = new URLSearchParams(location.search).get('redirect') || '/';
//     console.log("onRouteChange: ", redirectUri);
//     history.push(redirectUri);
//   }
//
//   if (WHITE_LIST.includes(location.pathname)) {
//     return;
//   }
// };

/**
 * @name request 配置，可以配置错误处理
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const request = {
  ...errorConfig,
};

// export function rootContainer(container: any) {
//   return (
//     <ConfigProvider theme={{
//       token: {
//         colorPrimary: '#13C2C2', // 设置主题颜色
//       },
//     }}
//     >
//       {container}
//     </ConfigProvider>
//   );
// }
