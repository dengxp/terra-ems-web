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

import useAuth from "@/hooks/useAuth";
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import { Spin } from 'antd';
import { createStyles } from 'antd-style';
import type { MenuInfo } from 'rc-menu/lib/interface';
import React, { useCallback } from 'react';
import { flushSync } from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';

export type GlobalHeaderRightProps = {
    menu?: boolean;
    children?: React.ReactNode;
};

export const AvatarName = () => {
    const { initialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    return <span className="anticon">{currentUser?.name}</span>;
};

const useStyles = createStyles(({ token }) => {
    return {
        action: {
            display: 'flex',
            height: '48px',
            marginLeft: 'auto',
            overflow: 'hidden',
            alignItems: 'center',
            padding: '0 8px',
            cursor: 'pointer',
            borderRadius: token.borderRadius,
            '&:hover': {
                backgroundColor: token.colorBgTextHover,
            },
        },
    };
});

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({ menu, children }) => {
    /**
     * 退出登录，并且将当前的 url 保存
     */

    const { styles } = useStyles();

    const { initialState, setInitialState } = useModel('@@initialState');
    const { logout } = useAuth();

    const onMenuClick = useCallback(
        (event: MenuInfo) => {
            const { key } = event;

            if (key === 'logout') {
                flushSync(() => {
                    setInitialState((s) => ({ ...s, currentUser: undefined }));
                });
                void logout();
                return;
            }
            const tabMap: Record<string, string> = {
                profile: 'base',
                security: 'security',
                avatar: 'base',
            };
            history.push(`/account/settings?tab=${tabMap[key] || 'base'}`);
        },
        [setInitialState],
    );

    const loading = (
        <span className={styles.action}>
            <Spin size="small"
                style={{
                    marginLeft: 8,
                    marginRight: 8,
                }}
            />
        </span>
    );

    if (!initialState) {
        return loading;
    }

    const { currentUser } = initialState;

    if (!currentUser || !currentUser.name) {
        return loading;
    }

    const menuItems = [
        ...(menu
            ? [
                {
                    key: 'profile',
                    icon: <UserOutlined />,
                    label: '个人资料',
                },
                {
                    key: 'avatar',
                    icon: <UserOutlined />, // Placeholder for avatar icon if needed
                    label: '修改头像',
                },
                {
                    key: 'security',
                    icon: <LockOutlined />,
                    label: '安全设置',
                },
                {
                    type: 'divider' as const,
                },
            ]
            : []),
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出系统',
            danger: true,
        },
    ];

    return (
        <HeaderDropdown menu={{
            selectedKeys: [],
            onClick: onMenuClick,
            items: menuItems,
        }}
        >
            {children}
        </HeaderDropdown>
    );
};
