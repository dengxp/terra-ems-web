import { Dropdown, Menu, message, Tabs } from 'antd';
import type { MenuInfo } from 'rc-menu/lib/interface';
import type { FC } from 'react';
import routes from '../../../config/routes';
import './index.less';
// import { getLanguage } from '@/utils/utils';
// import RightContent from '../RightContent';
const { TabPane } = Tabs;

export interface TabsViewPropsData {
  activeKey: string;
  dropByCacheKey: (path: string) => void;
  isKeep: boolean;
  keepElements: {
    current: object;
  };
  local: object;
  navigate: (to: string, options?: any) => void;
}

export interface TabsViewProps {
  data: TabsViewPropsData;
}

const TabsView: FC<TabsViewProps> = ({ data }) => {
  const onEdit = (activeKey: any) => {
    const buffer = Object.keys(data.keepElements.current);
    if (buffer.length <= 1) {
      message.destroy();
      message.warning('至少留一个标签页');
      return;
    }
    if (activeKey === data.activeKey) {
      const index = buffer.findIndex((it) => it === activeKey);
      if (index === 0) {
        data.navigate(buffer[1]);
        data.dropByCacheKey(activeKey);
        return;
      }
      data.navigate(buffer[index - 1]);
      data.dropByCacheKey(activeKey);
    } else {
      data.dropByCacheKey(activeKey);
    }
  };

  const getRoute = (routesArr: any[], path: any) => {
    const buffer: any[] = [];
    const eachItem = (list: { routes: any }[], path2: any) => {
      list.forEach((it: { routes: any }) => {
        if (it.routes) {
          eachItem(it.routes, path2);
        } else {
          buffer.push(it);
        }
      });
    };
    eachItem(routesArr, path);
    const item = buffer.find((it) => it.path === path);
    // return { ...item, name: getLanguage(item?.title) };
    return { ...item, name: item?.title};
  };

  const getOperation = (arr: any[], path: any) => {
    let buffer: any = [];
    const index = arr.findIndex((it: any) => it === path);
    if (index === 0 && arr.length === 1) {
      buffer = [
        {
          key: 1,
          label: <a>刷新</a>,
        },
      ];
    } else if (index === 0 && arr.length > 1) {
      buffer = [
        {
          key: 1,
          label: <a>刷新</a>,
        },
        {
          key: 2,
          label: <a>关闭右边侧标签</a>,
        },
        {
          key: 4,
          label: <a>关闭全部标签</a>,
        },
      ];
    } else if (index === arr.length - 1) {
      buffer = [
        {
          key: 1,
          label: <a>刷新</a>,
        },
        {
          key: 3,
          label: <a>关闭左边侧标签</a>,
        },
        {
          key: 4,
          label: <a>关闭全部标签</a>,
        },
      ];
    } else {
      buffer = [
        {
          key: 1,
          label: <a>刷新</a>,
        },
        {
          key: 2,
          label: <a>关闭右侧标签</a>,
        },
        {
          key: 3,
          label: <a>关闭左边侧标签</a>,
        },
        {
          key: 4,
          label: <a>关闭全部标签</a>,
        },
      ];
    }
    return buffer;
  };

  const operationAction = (event: MenuInfo, it: string) => {
    const buffer = Object.keys(data.keepElements.current);

    if (event.key === '1') {
      data.navigate(it);
      return;
    }

    if (event.key === '2') {
      const currentIndex = buffer.findIndex((it2) => it2 === it);
      const bufferArr = buffer.filter((_, index) => {
        return index > currentIndex;
      });
      bufferArr.forEach((item: any) => {
        data.dropByCacheKey(item);
      });
    }

    if (event.key === '3') {
      const currentIndex = buffer.findIndex((it2) => it2 === it);
      const bufferArr = buffer.filter((_, index) => {
        return index < currentIndex;
      });
      bufferArr.forEach((item: any) => {
        data.dropByCacheKey(item);
      });
    }

    if (event.key === '4') {
      const bufferArr = buffer.filter((item) => {
        return item !== it;
      });
      bufferArr.forEach((item: any) => {
        data.dropByCacheKey(item);
      });
    }
  };

  return (
    <div className="card-container">
      <Tabs
        hideAdd
        type="editable-card"
        activeKey={data.activeKey}
        onChange={(activeKey) => {
          data.navigate(activeKey);
        }}
        onEdit={(activeKey) => onEdit(activeKey)}
      >
        {Object.keys(data.keepElements.current).map((it: any) => {
          return (
            it && (
              <TabPane
                closable={Object.keys(data.keepElements.current).length > 1}
                tab={
                  <div className={'layout-tabs-title'}>
                    <Dropdown
                      overlay={
                        <Menu
                          style={{ width: 150 }}
                          items={getOperation(Object.keys(data.keepElements.current), it)}
                          onClick={(event) => operationAction(event, it)}
                        />
                      }
                      trigger={['contextMenu']}
                    >
                      <div>
                        <span style={{ marginLeft: '2px' }}>{getRoute(routes, it)?.name}</span>
                      </div>
                    </Dropdown>
                  </div>
                }
                key={it}
              />
            )
          );
        })}
      </Tabs>
      {/*<RightContent />*/}
    </div>

  );
};

export default TabsView;
