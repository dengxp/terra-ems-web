import React, { useState, useLayoutEffect, useRef } from 'react';
import { GridContent } from '@ant-design/pro-components';
import { Menu, Card } from 'antd';
import { useLocation, history } from '@umijs/max';
import BaseView from './BaseView';
import SecurityView from './SecurityView';
import useStyles from './style';

type SettingsStateKeys = 'base' | 'security';

const Settings: React.FC = () => {
    const { styles } = useStyles();
    const location = useLocation();
    const [activeKey, setActiveKey] = useState<SettingsStateKeys>('base');
    const dom = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const query = new URLSearchParams(location.search);
        const tab = query.get('tab') as SettingsStateKeys;
        if (tab && (tab === 'base' || tab === 'security')) {
            setActiveKey(tab);
        }
    }, [location.search]);

    const menuMap: Record<string, React.ReactNode> = {
        base: '个人资料',
        security: '安全设置',
    };

    const renderChildren = () => {
        switch (activeKey) {
            case 'base':
                return <BaseView />;
            case 'security':
                return <SecurityView />;
            default:
                return null;
        }
    };

    return (
        <GridContent>
            <div className={styles.main} ref={dom}>
                <div className={styles.leftMenu}>
                    <Menu
                        mode="inline"
                        selectedKeys={[activeKey]}
                        onClick={({ key }) => {
                            history.push(`/account/settings?tab=${key}`);
                            setActiveKey(key as SettingsStateKeys);
                        }}
                        items={Object.keys(menuMap).map((item) => ({
                            key: item,
                            label: menuMap[item],
                        }))}
                    />
                </div>
                <div className={styles.right}>
                    <div className={styles.title}>{menuMap[activeKey]}</div>
                    {renderChildren()}
                </div>
            </div>
        </GridContent>
    );
};

export default Settings;
