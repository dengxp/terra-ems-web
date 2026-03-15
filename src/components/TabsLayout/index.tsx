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

import { TAB_STORAGE_KEY } from "@/config/constants";
import { isUserLoggedIn } from "@/utils/auth";
import {
  CloseOutlined,
  EllipsisOutlined,
  ReloadOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@ant-design/icons';
import { useAccess, useAppData, useIntl, matchRoutes } from '@umijs/max';
import type { MenuProps, TabPaneProps } from 'antd';
import { Button, Dropdown, Space, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';

export interface TabConfig extends TabPaneProps {
  icon?: React.ReactNode;
  name?: string;
  closable?: boolean;
}

export interface TabsLayoutProps {
  isKeep: boolean;
  keepElements: React.MutableRefObject<any>;
  navigate: (path: string) => void;
  dropByCacheKey: (path: string) => void;
  dropLeftTabs: (path: string) => void;
  dropRightTabs: (path: string) => void;
  dropOtherTabs: (path: string) => void;
  refreshTab: (path: string) => void;
  updateTab: (path: string, config: TabConfig) => void;
  closeTab: (path: string) => void;
  local: Record<string, string>;
  icons: Record<string, string>;
  activeKey: string;
  tabProps: any;
  tabNameMap: Record<string, number>;
}

// 模块级标记：防止组件因异常重新挂载后反复恢复标签导致死循环
let tabsRestoredFlag = false;

const Index: React.FC<TabsLayoutProps> = (props) => {
  const {
    isKeep,
    keepElements,
    navigate,
    dropLeftTabs,
    dropRightTabs,
    dropOtherTabs,
    refreshTab,
    closeTab,
    activeKey,
    tabProps,
    tabNameMap
  } = props;

  const intl = useIntl();
  const { routes } = useAppData();
  const access = useAccess();
  const [restored, setRestored] = useState(tabsRestoredFlag);

  // 1. 恢复页签逻辑 (增加延时和错开并发，防止 Umi 路由冲突)
  useEffect(() => {
    // 如果未登录，不执行恢复逻辑，防止与 onPageChange 的重定向形成死循环
    if (!isUserLoggedIn()) {
      console.log('[TabsLayout] User not logged in, skipping tab restoration');
      tabsRestoredFlag = true;
      setRestored(true);
      return;
    }

    if (isKeep && !restored) {
      const savedTabs = localStorage.getItem(TAB_STORAGE_KEY);
      const savedActiveTab = localStorage.getItem(TAB_STORAGE_KEY + '_active');

      if (savedTabs) {
        try {
          let paths = JSON.parse(savedTabs);
          if (Array.isArray(paths) && paths.length > 0) {
            // 校验路径是否存在且用户有权限访问，防止跳转到已删除或无权限的路由导致死循环
            paths = paths.filter(path => {
              const pathname = path.split(/[?#]/)[0];
              const matches = matchRoutes(Object.values(routes), pathname);
              if (!matches || matches.length === 0) return false;

              // 检查路由权限：如果路由配置了 access: 'canAccess'，则校验用户权限
              const matchedRoute = matches[matches.length - 1]?.route as any;
              if (matchedRoute?.access === 'canAccess') {
                return access.canAccess(matchedRoute);
              }

              return true;
            });

            if (paths.length === 0) {
              tabsRestoredFlag = true;
              setRestored(true);
              return;
            }

            console.log('[TabsLayout] Found saved tabs to restore:', paths);

            // 错开导航，防止短时间多次 history.push 导致只有最后一个生效
            let index = 0;
            const timer = setInterval(() => {
              if (index >= paths.length) {
                clearInterval(timer);
                tabsRestoredFlag = true;
                setRestored(true);

                // 恢复完所有标签后，跳转到之前激活的标签
                if (savedActiveTab && paths.some((p: string) => p.toLowerCase().startsWith(savedActiveTab.toLowerCase()))) {
                  console.log('[TabsLayout] Restoring active tab:', savedActiveTab);
                  navigate(savedActiveTab);
                }
                return;
              }
              const path = paths[index++];
              const pathname = path.split(/[?#]/)[0].toLowerCase();

              // 如果页签尚未打开，则进行导航
              if (pathname && !keepElements.current[pathname]) {
                // 如果当前要恢复的 tab 就是之前激活的 tab，暂时跳过，留到最后再激活 (避免跳来跳去)
                // 但如果不 navigate，keepElements 里就没有它。必须 navigate。
                // 只是最后再 navigate 一次 active tab 即可。
                navigate(path);
              }
            }, 100); // 稍微加快一点速度
          } else {
            tabsRestoredFlag = true;
            setRestored(true);
          }
        } catch (e) {
          console.error('[TabsLayout] Failed to parse saved tabs:', e);
          tabsRestoredFlag = true;
          setRestored(true);
        }
      } else {
        tabsRestoredFlag = true;
        setRestored(true);
      }
    }
  }, [isKeep, restored]);

  // 2. 持久化页签逻辑 (仅在恢复完成后或正常操作时保存)
  useEffect(() => {
    // 只有在恢复流程走完（或者确定没有需要恢复的）之后，才允许保存，防止启动时的竞态覆盖
    if (isKeep && restored && keepElements.current) {
      // 保存当前激活的 Tab
      const currentActiveLocation = keepElements.current[activeKey?.toLowerCase()]?.location;
      if (currentActiveLocation) {
        const activePath = `${currentActiveLocation.pathname}${currentActiveLocation.search || ''}${currentActiveLocation.hash || ''}`;
        localStorage.setItem(TAB_STORAGE_KEY + '_active', activePath);
      }

      // 获取当前所有活跃的 pathname
      const currentPathnames = Object.keys(keepElements.current).map(k => k.toLowerCase());

      // 读取当前的存储顺序（如果存在）
      let orderedByStorage: string[] = [];
      try {
        const saved = localStorage.getItem(TAB_STORAGE_KEY);
        if (saved) {
          orderedByStorage = JSON.parse(saved);
        }
      } catch (e) { }

      // 提取存储中的 pathname 用于匹配
      const storedPathnames = orderedByStorage.map(p => p.split(/[?#]/)[0].toLowerCase());

      // 构建新的保存列表：
      // 1. 按照存储顺序，保留依然存在的 tab
      // 2. 追加新出现的 tab (storage 中没有但 keepElements 中有的)
      const newPaths: string[] = [];
      const processedPathnames = new Set<string>();

      // 第一步：保留原有顺序
      orderedByStorage.forEach((_fullPath, index) => {
        const pathname = storedPathnames[index];
        if (currentPathnames.includes(pathname)) {
          // 使用 keepElements 中的最新 location 信息（这就保证了 query param 的更新），但维持 storage 的顺序
          // 或者是直接用 storage 的 path？
          // 通常我们希望保留最新的 query params，所以最好从 keepElements 取
          const item = keepElements.current[pathname];
          if (item && item.location) {
            const loc = item.location;
            newPaths.push(`${loc.pathname}${loc.search || ''}${loc.hash || ''}`);
            processedPathnames.add(pathname);
          }
        }
      });

      // 第二步：追加新 Tab
      currentPathnames.forEach(pathname => {
        if (!processedPathnames.has(pathname)) {
          const item = keepElements.current[pathname];
          if (item && item.location) {
            const loc = item.location;
            newPaths.push(`${loc.pathname}${loc.search || ''}${loc.hash || ''}`);
          }
        }
      });

      console.log('[TabsLayout] Synchronizing tabs to localStorage (Sorted):', newPaths);
      localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(newPaths));
    }
  }, [activeKey, Object.keys(keepElements.current).length, restored]);

  const selectAction = ({ key }: { key: string }) => {
    switch (key) {
      case 'left':
        dropLeftTabs(activeKey?.toLowerCase());
        break;
      case 'right':
        dropRightTabs(activeKey?.toLowerCase());
        break;
      case 'others':
        dropOtherTabs(activeKey?.toLowerCase());
        break;
      case 'refresh':
        refreshTab(activeKey?.toLowerCase());
        break;
      default:
        break;
    }
  };

  const items: MenuProps['items'] = [
    {
      label: intl.formatMessage({
        id: `tabs.close.left`,
        defaultMessage: "关闭左侧",
      }),
      icon: <VerticalRightOutlined />,
      key: "left",
    },
    {
      label: intl.formatMessage({
        id: `tabs.close.right`,
        defaultMessage: "关闭右侧",
      }),
      icon: <VerticalLeftOutlined />,
      key: "right",
    },
    {
      label: intl.formatMessage({
        id: `tabs.close.others`,
        defaultMessage: "关闭其他",
      }),
      icon: <CloseOutlined />,
      key: "others",
    },
    {
      type: 'divider',
    },
    {
      label: intl.formatMessage({
        id: `tabs.refresh`,
        defaultMessage: "刷新",
      }),
      icon: <ReloadOutlined />,
      key: "refresh",
    },
  ];

  if (!isKeep) return null;

  // 计算渲染用的 Tab Items (排序)
  const getSortedItems = () => {
    const entries = Object.entries(keepElements.current);

    // 读取存储顺序
    let storedPathnames: string[] = [];
    try {
      const saved = localStorage.getItem(TAB_STORAGE_KEY);
      if (saved) {
        const paths: string[] = JSON.parse(saved);
        storedPathnames = paths.map(p => p.split(/[?#]/)[0].toLowerCase());
      }
    } catch (e) { }

    // 排序：如果 pathname 在存储列表中，使用其索引；否则排在最后
    entries.sort((a, b) => {
      const pathA = a[0].toLowerCase();
      const pathB = b[0].toLowerCase();

      let indexA = storedPathnames.indexOf(pathA);
      let indexB = storedPathnames.indexOf(pathB);

      if (indexA === -1) indexA = 9999;
      if (indexB === -1) indexB = 9999;

      return indexA - indexB;
    });

    return entries.map(
      ([pathname, { name, icon, closable, children, ...other }]: any) => ({
        label: (
          <Dropdown menu={{ items, onClick: selectAction }} trigger={['contextMenu']}>
            <Space align={'center'} size={4}>
              {icon}
              {name}
            </Space>
          </Dropdown>
        ),
        key: `${pathname?.toLowerCase()}::${tabNameMap[pathname?.toLowerCase()]}`,
        closable: Object.entries(keepElements.current).length === 1 ? false : closable,
        style: { paddingTop: '20px' },
        ...other
      })
    );
  };

  return (
    <div
      className="runtime-keep-alive-tabs-layout"
      style={{ height: '40px', marginBottom: '12px' }}
    >
      <Tabs tabBarExtraContent={
        <div style={{ position: 'fixed', right: 0, transform: 'translateY(-50%)' }}>
          <Dropdown menu={{ items, onClick: selectAction }} trigger={['click']}>
            <Button size="small" icon={<EllipsisOutlined />} style={{ marginRight: 12 }} />
          </Dropdown>
        </div>
      }
        hideAdd
        onChange={(key: string) => {
          const path = key.split('::')[0];
          const { pathname, hash, search } = keepElements.current[path?.toLowerCase()].location;
          navigate(`${pathname}${search}${hash}`);
        }}
        renderTabBar={(props, DefaultTabBar) => (
          <div
            style={{
              position: 'fixed',
              zIndex: 1,
              padding: 0,
              width: '100%',
              background: 'white'
            }}
          >
            <DefaultTabBar
              {...props}
              style={{
                marginBottom: 0
              }}
            />
          </div>
        )}
        activeKey={`${activeKey?.toLowerCase()}::${tabNameMap[activeKey?.toLowerCase()]}`}
        type="editable-card"
        onEdit={(key: string) => {
          const targetKey = key.split('::')[0];
          closeTab(targetKey?.toLowerCase());
        }}
        {...tabProps}
        items={getSortedItems()}
      ></Tabs>
    </div>
  );
};

export default Index;
