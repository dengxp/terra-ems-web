import {LockOutlined, LogoutOutlined, UserOutlined} from '@ant-design/icons';
import {history, useModel} from '@umijs/max';
import {Spin} from 'antd';
import {createStyles} from 'antd-style';
import type {MenuInfo} from 'rc-menu/lib/interface';
import React, {useCallback} from 'react';
import {flushSync} from 'react-dom';
import HeaderDropdown from '../HeaderDropdown';
import useAuth from "@/hooks/auth";

export type GlobalHeaderRightProps = {
    menu?: boolean;
    children?: React.ReactNode;
};

export const AvatarName = () => {
    const {initialState} = useModel('@@initialState');
    const {currentUser} = initialState || {};
    return <span className="anticon">{currentUser?.name}</span>;
};

const useStyles = createStyles(({token}) => {
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

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({menu, children}) => {
    /**
     * 退出登录，并且将当前的 url 保存
     */

    const {styles} = useStyles();

    const {initialState, setInitialState} = useModel('@@initialState');
    const {logout} = useAuth();

    const onMenuClick = useCallback(
        (event: MenuInfo) => {
            const {key} = event;

            if (key === 'logout') {
                flushSync(() => {
                    setInitialState((s) => ({...s, currentUser: undefined}));
                });
                void logout();
                return;
            }
            history.push(`/personal/${key}`);
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

    const {currentUser} = initialState;

    if (!currentUser || !currentUser.name) {
        return loading;
    }

    const menuItems = [
        ...(menu
            ? [
                {
                    key: 'info',
                    icon: <UserOutlined/>,
                    label: '个人信息',
                },
                {
                    key: 'change-password',
                    icon: <LockOutlined/>,
                    label: '修改密码',
                },
                {
                    type: 'divider' as const,
                },
            ]
            : []),
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '退出登录',
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
