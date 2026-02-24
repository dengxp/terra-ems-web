import { TAB_STORAGE_KEY } from "@/config/constants";
import { isUserLoggedIn } from "@/utils/auth";
import {
  CaretLeftFilled,
  CaretRightFilled,
  CloseOutlined,
  DownOutlined,
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
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Checks if scrolling is possible in either direction
  const updateScrollArrows = () => {
    if (scrollRef.current) {
      const navWrap = scrollRef.current.querySelector('.ant-tabs-nav-wrap');
      if (navWrap) {
        const { scrollLeft, scrollWidth, clientWidth } = navWrap;
        setCanScrollLeft(scrollLeft > 1);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
      }
    }
  };

  // Sync manual scroll logic
  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const navWrap = scrollRef.current.querySelector('.ant-tabs-nav-wrap');
      if (navWrap) {
        navWrap.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  // Effect to attach scroll and wheel listeners
  useEffect(() => {
    const navWrap = scrollRef.current?.querySelector('.ant-tabs-nav-wrap');
    if (!navWrap) return;

    const onScroll = () => updateScrollArrows();
    const onWheel = (e: WheelEvent) => {
      // Direct wheel/trackpad support
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        navWrap.scrollLeft += e.deltaY;
      } else {
        navWrap.scrollLeft += e.deltaX;
      }
      e.preventDefault();
    };

    // Use ResizeObserver to detect when scrollability changes
    const resizeObserver = new ResizeObserver(() => updateScrollArrows());
    resizeObserver.observe(navWrap);
    resizeObserver.observe(scrollRef.current!);

    navWrap.addEventListener('scroll', onScroll, { passive: true });
    navWrap.addEventListener('wheel', onWheel as any, { passive: false });

    // Initial check
    updateScrollArrows();

    return () => {
      navWrap.removeEventListener('scroll', onScroll);
      navWrap.removeEventListener('wheel', onWheel as any);
      resizeObserver.disconnect();
    };
  }, [restored, Object.keys(keepElements.current).length]);

  // 1. 恢复页签逻辑
  useEffect(() => {
    if (!isUserLoggedIn()) {
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
            paths = paths.filter(path => {
              const pathname = path.split(/[?#]/)[0];
              const matches = matchRoutes(Object.values(routes), pathname);
              if (!matches || matches.length === 0) return false;
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

            let index = 0;
            const timer = setInterval(() => {
              if (index >= paths.length) {
                clearInterval(timer);
                tabsRestoredFlag = true;
                setRestored(true);
                if (savedActiveTab && paths.some((p: string) => p.toLowerCase().startsWith(savedActiveTab.toLowerCase()))) {
                  navigate(savedActiveTab);
                }
                return;
              }
              const path = paths[index++];
              const pathname = path.split(/[?#]/)[0].toLowerCase();
              if (pathname && !keepElements.current[pathname]) {
                navigate(path);
              }
            }, 100);
          } else {
            tabsRestoredFlag = true;
            setRestored(true);
          }
        } catch (e) {
          tabsRestoredFlag = true;
          setRestored(true);
        }
      } else {
        tabsRestoredFlag = true;
        setRestored(true);
      }
    }
  }, [isKeep, restored]);

  // 2. 持久化页签逻辑
  useEffect(() => {
    if (isKeep && restored && keepElements.current) {
      const currentActiveLocation = keepElements.current[activeKey?.toLowerCase()]?.location;
      if (currentActiveLocation) {
        const activePath = `${currentActiveLocation.pathname}${currentActiveLocation.search || ''}${currentActiveLocation.hash || ''}`;
        localStorage.setItem(TAB_STORAGE_KEY + '_active', activePath);
      }

      const currentPathnames = Object.keys(keepElements.current).map(k => k.toLowerCase());
      let orderedByStorage: string[] = [];
      try {
        const saved = localStorage.getItem(TAB_STORAGE_KEY);
        if (saved) orderedByStorage = JSON.parse(saved);
      } catch (e) { }

      const storedPathnames = orderedByStorage.map(p => p.split(/[?#]/)[0].toLowerCase());
      const newPaths: string[] = [];
      const processedPathnames = new Set<string>();

      orderedByStorage.forEach((_fullPath, index) => {
        const pathname = storedPathnames[index];
        if (currentPathnames.includes(pathname)) {
          const item = keepElements.current[pathname];
          if (item && item.location) {
            const loc = item.location;
            newPaths.push(`${loc.pathname}${loc.search || ''}${loc.hash || ''}`);
            processedPathnames.add(pathname);
          }
        }
      });

      currentPathnames.forEach(pathname => {
        if (!processedPathnames.has(pathname)) {
          const item = keepElements.current[pathname];
          if (item && item.location) {
            const loc = item.location;
            newPaths.push(`${loc.pathname}${loc.search || ''}${loc.hash || ''}`);
          }
        }
      });

      localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(newPaths));
    }
  }, [activeKey, Object.keys(keepElements.current).length, restored]);

  const selectAction = ({ key }: { key: string }) => {
    switch (key) {
      case 'left': dropLeftTabs(activeKey?.toLowerCase()); break;
      case 'right': dropRightTabs(activeKey?.toLowerCase()); break;
      case 'others': dropOtherTabs(activeKey?.toLowerCase()); break;
      case 'refresh': refreshTab(activeKey?.toLowerCase()); break;
      default: break;
    }
  };

  const menuItems: MenuProps['items'] = [
    { label: intl.formatMessage({ id: `tabs.close.left`, defaultMessage: "关闭左侧" }), icon: <VerticalRightOutlined />, key: "left" },
    { label: intl.formatMessage({ id: `tabs.close.right`, defaultMessage: "关闭侧" }), icon: <VerticalLeftOutlined />, key: "right" },
    { label: intl.formatMessage({ id: `tabs.close.others`, defaultMessage: "关闭其他" }), icon: <CloseOutlined />, key: "others" },
    { type: 'divider' },
    { label: intl.formatMessage({ id: `tabs.refresh`, defaultMessage: "刷新" }), icon: <ReloadOutlined />, key: "refresh" },
  ];

  if (!isKeep) return null;

  const getSortedItems = () => {
    const entries = Object.entries(keepElements.current);
    let storedPathnames: string[] = [];
    try {
      const saved = localStorage.getItem(TAB_STORAGE_KEY);
      if (saved) {
        const paths: string[] = JSON.parse(saved);
        storedPathnames = paths.map(p => p.split(/[?#]/)[0].toLowerCase());
      }
    } catch (e) { }

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
      ([pathname, { name, icon, closable, children: _unusedChildren, ...other }]: any) => ({
        label: (
          <Dropdown menu={{ items: menuItems, onClick: selectAction }} trigger={['contextMenu']}>
            <Space align={'center'} size={4}>
              {icon}
              {name}
            </Space>
          </Dropdown>
        ),
        key: `${pathname?.toLowerCase()}::${tabNameMap[pathname?.toLowerCase()]}`,
        closable: Object.entries(keepElements.current).length === 1 ? false : closable,
        ...other
      })
    );
  };

  return (
    <div
      className="runtime-keep-alive-tabs-layout"
      style={{
        position: 'sticky',
        top: 48, // Header height offset to prevent overlapping
        zIndex: 1000,
        background: 'white',
        width: '100%',
        boxSizing: 'border-box',
        marginBottom: '0px'
      }}
    >
      <Tabs
        hideAdd
        onChange={(key: string) => {
          const path = key.split('::')[0];
          const { pathname, hash, search } = keepElements.current[path?.toLowerCase()].location;
          navigate(`${pathname}${search}${hash}`);
        }}
        renderTabBar={(props, DefaultTabBar) => (
          <div
            ref={scrollRef}
            className="tabs-layout-tabbar-container"
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              background: 'white',
              borderBottom: '1px solid #f0f0f0',
              padding: '0 8px',
              flexWrap: 'nowrap',
              overflow: 'hidden',
              height: '40px',
              boxSizing: 'border-box'
            }}
          >
            <style>
              {`
                /* Standardize the nav container for predictable flow */
                .runtime-keep-alive-tabs-layout .ant-tabs-nav {
                  margin-bottom: 0 !important;
                  border: none !important;
                  display: flex !important;
                  align-items: center !important;
                  width: 100% !important;
                  height: 40px !important;
                }
                
                /* Precise reordering for classic side-buttons layout */
                /* 1. Far Left: Custom Left Scroll Button */
                .custom-nav-left { order: 1; flex-shrink: 0; display: flex; align-items: center; justify-content: center; height: 40px; margin-right: 4px; }
                
                /* 2. Center: Tabs Scroll Area (Grow to fill) */
                .runtime-keep-alive-tabs-layout .ant-tabs-nav-wrap {
                  order: 2 !important;
                  flex: 1 !important;
                  flex-wrap: nowrap !important;
                  white-space: nowrap !important;
                  overflow: hidden !important;
                  height: 40px !important;
                  display: flex !important;
                  align-items: center !important;
                }
                
                /* 3. After Tabs: Custom Right Scroll Button */
                .custom-nav-right { order: 3; flex-shrink: 0; display: flex; align-items: center; justify-content: center; height: 40px; margin-left: 4px; }
                
                /* 4. Native more tabs menu [...] */
                .runtime-keep-alive-tabs-layout .ant-tabs-nav-operations {
                  order: 4 !important;
                  display: flex !important;
                  align-items: center !important;
                  height: 40px !important;
                  padding: 0 4px !important;
                  background: white !important;
                  border-bottom: none !important;
                }
                
                /* 5. Far Right: Custom Action Menu Button */
                .custom-nav-menu { order: 5; flex-shrink: 0; display: flex; align-items: center; justify-content: center; height: 40px; margin-left: 8px; }

                /* Standardize tab internal height */
                .runtime-keep-alive-tabs-layout .ant-tabs-nav-list {
                   flex-wrap: nowrap !important;
                   display: flex !important;
                   height: 40px !important;
                   align-items: flex-end !important;
                }
                .runtime-keep-alive-tabs-layout .ant-tabs-nav::before {
                  display: none !important;
                }
                /* Hide only duplicated internal scroll buttons */
                .runtime-keep-alive-tabs-layout .ant-tabs-nav-btn {
                  display: none !important;
                }
                
                /* Ensure NO content area is rendered by Tabs component */
                .runtime-keep-alive-tabs-layout .ant-tabs-content-holder {
                  display: none !important;
                }
              `}
            </style>

            {/* 1. Left Switcher */}
            <div className="custom-nav-left">
              <Button
                size="small"
                icon={<CaretLeftFilled />}
                onClick={() => handleScroll('left')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 32,
                  visibility: canScrollLeft ? 'visible' : 'hidden'
                }}
              />
            </div>

            {/* 2. Main Tabs Area */}
            <DefaultTabBar
              {...props}
              style={{
                marginBottom: 0,
                flex: 1,
                minWidth: 0,
                height: 40
              }}
            />

            {/* 3. Right Switcher */}
            <div className="custom-nav-right">
              <Button
                size="small"
                icon={<CaretRightFilled />}
                onClick={() => handleScroll('right')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 32,
                  visibility: canScrollRight ? 'visible' : 'hidden'
                }}
              />
            </div>

            {/* 5. Custom Functional Menu */}
            <div className="custom-nav-menu">
              <Dropdown menu={{ items: menuItems, onClick: selectAction }} trigger={['click']}>
                <Button
                  size="small"
                  type="text"
                  icon={<DownOutlined style={{ fontSize: '12px', color: 'rgba(0,0,0,0.45)' }} />}
                  style={{
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #f0f0f0',
                    borderRadius: '4px',
                    background: '#fafafa'
                  }}
                />
              </Dropdown>
            </div>
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
