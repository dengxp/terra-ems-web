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
