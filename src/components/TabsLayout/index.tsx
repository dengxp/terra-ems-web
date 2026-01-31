import React, { useEffect, useState } from 'react';
import type { MenuProps, TabPaneProps } from 'antd';
import { Button, Dropdown, Space, Tabs } from 'antd';
import {
  CloseOutlined,
  EllipsisOutlined,
  ReloadOutlined,
  VerticalLeftOutlined,
  VerticalRightOutlined
} from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { TAB_STORAGE_KEY } from "@/config/constants";

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
  const [restored, setRestored] = useState(false);

  // 1. 恢复页签逻辑 (增加延时和错开并发，防止 Umi 路由冲突)
  useEffect(() => {
    if (isKeep && !restored) {
      const savedTabs = localStorage.getItem(TAB_STORAGE_KEY);
      if (savedTabs) {
        try {
          const paths = JSON.parse(savedTabs);
          if (Array.isArray(paths) && paths.length > 0) {
            console.log('[TabsLayout] Found saved tabs to restore:', paths);

            // 错开导航，防止短时间多次 history.push 导致只有最后一个生效
            let index = 0;
            const timer = setInterval(() => {
              if (index >= paths.length) {
                clearInterval(timer);
                setRestored(true);
                return;
              }
              const path = paths[index++];
              const pathname = path.split(/[?#]/)[0].toLowerCase();

              // 如果页签尚未打开，则进行导航
              if (pathname && !keepElements.current[pathname]) {
                console.log(`[TabsLayout] Restoring tab ${index}/${paths.length}:`, path);
                navigate(path);
              }
            }, 150); // 150ms 间隔，给路由系统一点喘息时间
          } else {
            setRestored(true);
          }
        } catch (e) {
          console.error('[TabsLayout] Failed to parse saved tabs:', e);
          setRestored(true);
        }
      } else {
        setRestored(true);
      }
    }
  }, [isKeep, restored]);

  // 2. 持久化页签逻辑 (仅在恢复完成后或正常操作时保存)
  useEffect(() => {
    // 只有在恢复流程走完（或者确定没有需要恢复的）之后，才允许保存，防止启动时的竞态覆盖
    if (isKeep && restored && keepElements.current) {
      const paths = Object.values(keepElements.current)
        .map((item: any) => {
          const loc = item.location;
          if (loc) {
            return `${loc.pathname}${loc.search || ''}${loc.hash || ''}`;
          }
          return null;
        })
        .filter(Boolean);

      console.log('[TabsLayout] Synchronizing tabs to localStorage:', paths);
      localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(paths));
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
        items={Object.entries(keepElements.current).map(
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
        )}
      ></Tabs>
    </div>
  );
};

export default Index;
