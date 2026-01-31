import React, { useEffect } from 'react';
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

  // 1. 恢复页签逻辑
  useEffect(() => {
    if (isKeep) {
      const savedTabs = localStorage.getItem(TAB_STORAGE_KEY);
      if (savedTabs) {
        try {
          const paths = JSON.parse(savedTabs);
          if (Array.isArray(paths)) {
            paths.forEach((path: string) => {
              // 提交导航请求以恢复页签
              // 提取纯路径用于判断是否存在
              const pathname = path.split(/[?#]/)[0].toLowerCase();
              if (!keepElements.current[pathname]) {
                navigate(path);
              }
            });
          }
        } catch (e) {
          console.error('[TabsLayout] Failed to restore tabs:', e);
        }
      }
    }
  }, [isKeep]);

  // 2. 持久化页签逻辑
  useEffect(() => {
    if (isKeep && keepElements.current) {
      const paths = Object.values(keepElements.current)
        .map((item: any) => {
          const loc = item.location;
          if (loc) {
            return `${loc.pathname}${loc.search || ''}${loc.hash || ''}`;
          }
          return null;
        })
        .filter(Boolean);

      localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(paths));
    }
  }, [activeKey, Object.keys(keepElements.current).length]);

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
      type: 'divider', // 这是正确的 divider 定义方式
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
