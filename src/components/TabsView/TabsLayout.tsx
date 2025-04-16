import React from 'react';
import {Tabs, Dropdown, Button} from 'antd';
import type {MenuProps} from 'antd';
import {
  EllipsisOutlined,
  VerticalRightOutlined,
  VerticalLeftOutlined,
  CloseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {useIntl} from '@umijs/max';
import type {TabPaneProps} from 'antd';

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

const TabsLayout: React.FC<TabsLayoutProps> = (props) => {
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

  const selectAction = ({key}: { key: string }) => {
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
      icon: <VerticalRightOutlined/>,
      key: "left",
    },
    {
      label: intl.formatMessage({
        id: `tabs.close.right`,
        defaultMessage: "关闭右侧",
      }),
      icon: <VerticalLeftOutlined/>,
      key: "right",
    },
    {
      label: intl.formatMessage({
        id: `tabs.close.others`,
        defaultMessage: "关闭其他",
      }),
      icon: <CloseOutlined/>,
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
      icon: <ReloadOutlined/>,
      key: "refresh",
    },
  ];

  if (!isKeep) return null;

  return (
    <div
      className="runtime-keep-alive-tabs-layout"
      style={{height: '40px', marginBottom: '12px'}}
    >
      <Tabs tabBarExtraContent={
        <div style={{position: 'fixed', right: 0, transform: 'translateY(-50%)'}}>
          <Dropdown menu={{items, onClick: selectAction}} trigger={['click']}>
            <Button size="small" icon={<EllipsisOutlined/>} style={{marginRight: 12}}/>
          </Dropdown>
        </div>
      }
            hideAdd
            onChange={(key: string) => {
              const path = key.split('::')[0];
              const {pathname, hash, search} = keepElements.current[path?.toLowerCase()].location;
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
              ([pathname, {name, icon, closable, ...other}]: any) => ({
                label: (
                  <>
                    {icon}
                    {name}
                  </>
                ),
                key: `${pathname?.toLowerCase()}::${tabNameMap[pathname?.toLowerCase()]}`,
                closable: Object.entries(keepElements.current).length === 1 ? false : closable,
                style: {paddingTop: '20px'},
                ...other
              })
            )}
      ></Tabs>
    </div>
  );
};

export default TabsLayout;
