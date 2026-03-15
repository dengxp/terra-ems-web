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

import {
  CacheInfo, clearCacheAll, clearCacheKey, clearCacheName, getCacheInfo, getCacheValue, listCacheKeys, listCacheNames, SysCache
} from '@/apis/monitor/cache';
import { ProPageContainer } from '@/components/container';
import { DatabaseOutlined, DeleteOutlined, FileTextOutlined, KeyOutlined, ReloadOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';
import { App, Button, Card, Col, Descriptions, List, Row, Space, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

const { Title } = Typography;

const CacheContent: React.FC = () => {
    const { message, modal } = App.useApp();
    const [cacheInfo, setCacheInfo] = useState<CacheInfo>();
    const [cacheNames, setCacheNames] = useState<SysCache[]>([]);
    const [cacheKeys, setCacheKeys] = useState<string[]>([]);
    const [currentCacheName, setCurrentCacheName] = useState<string>('');
    const [currentCacheKey, setCurrentCacheKey] = useState<string>('');
    const [cacheValue, setCacheValue] = useState<SysCache>();
    const [loadingInfo, setLoadingInfo] = useState<boolean>(false);
    const [loadingNames, setLoadingNames] = useState<boolean>(false);
    const [loadingKeys, setLoadingKeys] = useState<boolean>(false);

    const fetchInfo = async () => {
        setLoadingInfo(true);
        try {
            const res = await getCacheInfo();
            if (res.success) {
                setCacheInfo(res.data || undefined);
            }
        } catch (error) {
            console.error('Failed to fetch cache info:', error);
        } finally {
            setLoadingInfo(false);
        }
    };

    const fetchCacheNames = async () => {
        setLoadingNames(true);
        try {
            const res = await listCacheNames();
            if (res.success) {
                setCacheNames(res.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch cache names:', error);
        } finally {
            setLoadingNames(false);
        }
    };

    const fetchCacheKeys = async (cacheName: string) => {
        setLoadingKeys(true);
        try {
            const res = await listCacheKeys(cacheName);
            if (res.success) {
                setCacheKeys(res.data || []);
                setCurrentCacheName(cacheName);
                setCurrentCacheKey('');
                setCacheValue(undefined);
            }
        } catch (error) {
            console.error('Failed to fetch cache keys:', error);
        } finally {
            setLoadingKeys(false);
        }
    };

    const fetchCacheValue = async (cacheKey: string) => {
        try {
            const res = await getCacheValue(currentCacheName, cacheKey);
            if (res.success) {
                setCacheValue(res.data || undefined);
                setCurrentCacheKey(cacheKey);
            }
        } catch (error) {
            console.error('Failed to fetch cache value:', error);
        }
    };

    const handleRefreshInfo = () => {
        fetchInfo();
        message.success('刷新成功');
    };

    const handleClearAll = () => {
        modal.confirm({
            title: '提示',
            content: '是否确认清空所有缓存？',
            onOk: async () => {
                const res = await clearCacheAll();
                if (res.success) {
                    message.success('清理成功');
                    fetchInfo();
                    fetchCacheNames();
                    setCacheKeys([]);
                    setCacheValue(undefined);
                    setCurrentCacheName('');
                    setCurrentCacheKey('');
                }
            },
        });
    };

    const handleClearCacheName = async (cacheName: string) => {
        const res = await clearCacheName(cacheName);
        if (res.success) {
            message.success(`清理缓存[${cacheName}]成功`);
            if (currentCacheName === cacheName) {
                fetchCacheKeys(cacheName);
            }
        }
    };

    const handleClearCacheKey = async (cacheKey: string) => {
        const res = await clearCacheKey(cacheKey);
        if (res.success) {
            message.success(`清理键名[${cacheKey}]成功`);
            fetchCacheKeys(currentCacheName);
        }
    };

    useEffect(() => {
        fetchInfo();
        fetchCacheNames();
    }, []);

    return (
        <ProPageContainer title="缓存监控" className="pt-1">
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card
                        title={<span><DatabaseOutlined /> 基本信息</span>}
                        loading={loadingInfo}
                        extra={<Space>
                            <Button icon={<ReloadOutlined />} onClick={handleRefreshInfo}>刷新</Button>
                            <Button danger icon={<DeleteOutlined />} onClick={handleClearAll}>清空缓存</Button>
                        </Space>}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Descriptions column={2} bordered size="small">
                                    <Descriptions.Item label="Redis版本">{cacheInfo?.info?.redis_version}</Descriptions.Item>
                                    <Descriptions.Item label="运行模式">{cacheInfo?.info?.redis_mode === 'standalone' ? '单机' : '集群'}</Descriptions.Item>
                                    <Descriptions.Item label="端口">{cacheInfo?.info?.tcp_port}</Descriptions.Item>
                                    <Descriptions.Item label="客户端数">{cacheInfo?.info?.connected_clients}</Descriptions.Item>
                                    <Descriptions.Item label="运行时间(天)">{cacheInfo?.info?.uptime_in_days}</Descriptions.Item>
                                    <Descriptions.Item label="使用内存">{cacheInfo?.info?.used_memory_human}</Descriptions.Item>
                                    <Descriptions.Item label="使用CPU">{cacheInfo?.info ? parseFloat(cacheInfo.info.used_cpu_user_children).toFixed(2) : ''}</Descriptions.Item>
                                    <Descriptions.Item label="内存配置">{cacheInfo?.info?.maxmemory_human}</Descriptions.Item>
                                    <Descriptions.Item label="AOF是否开启">{cacheInfo?.info?.aof_enabled === '0' ? '否' : '是'}</Descriptions.Item>
                                    <Descriptions.Item label="RDB是否成功">{cacheInfo?.info?.rdb_last_bgsave_status}</Descriptions.Item>
                                    <Descriptions.Item label="Key数量">{cacheInfo?.dbSize}</Descriptions.Item>
                                    <Descriptions.Item label="网络入口/出口">{cacheInfo?.info?.instantaneous_input_kbps}kps / {cacheInfo?.info?.instantaneous_output_kbps}kps</Descriptions.Item>
                                </Descriptions>
                            </Col>
                            <Col span={12} style={{ height: 300 }}>
                                <div style={{ height: '100%', width: '100%' }}>
                                    <Title level={5} style={{ textAlign: 'center' }}>命令统计</Title>
                                    {cacheInfo?.commandStats && cacheInfo.commandStats.length > 0 && (
                                        <Pie
                                            data={cacheInfo.commandStats}
                                            angleField="value"
                                            colorField="name"
                                            radius={0.8}
                                            label={{
                                                text: 'name',
                                                position: 'outside',
                                            }}
                                            legend={false}
                                        />
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title={<span><DatabaseOutlined /> 缓存列表</span>} bodyStyle={{ padding: 0, height: 450, overflow: 'auto' }}>
                        <List
                            loading={loadingNames}
                            dataSource={cacheNames || []}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => fetchCacheKeys(item.cacheName)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '8px 16px',
                                        backgroundColor: currentCacheName === item.cacheName ? '#e6f7ff' : 'transparent'
                                    }}
                                    actions={[
                                        <Button
                                            type="link"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClearCacheName(item.cacheName);
                                            }}
                                        />
                                    ]}
                                >
                                    <List.Item.Meta title={item.cacheName} description={item.remark} />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title={<span><KeyOutlined /> 键名列表</span>} bodyStyle={{ padding: 0, height: 450, overflow: 'auto' }}>
                        <List
                            loading={loadingKeys}
                            dataSource={cacheKeys || []}
                            renderItem={(item) => (
                                <List.Item
                                    onClick={() => fetchCacheValue(item)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '8px 16px',
                                        backgroundColor: currentCacheKey === item ? '#e6f7ff' : 'transparent'
                                    }}
                                    actions={[
                                        <Button
                                            type="link"
                                            size="small"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClearCacheKey(item);
                                            }}
                                        />
                                    ]}
                                >
                                    <div style={{ wordBreak: 'break-all' }}>{item}</div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title={<span><FileTextOutlined /> 缓存内容</span>} bodyStyle={{ height: 450, overflow: 'auto' }}>
                        {cacheValue && (
                            <Descriptions column={1} bordered size="small">
                                <Descriptions.Item label="缓存名称">{cacheValue.cacheName}</Descriptions.Item>
                                <Descriptions.Item label="缓存键名">{cacheValue.cacheKey}</Descriptions.Item>
                                <Descriptions.Item label="缓存内容">
                                    <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>
                                        {cacheValue.cacheValue}
                                    </pre>
                                </Descriptions.Item>
                            </Descriptions>
                        )}
                    </Card>
                </Col>
            </Row>
        </ProPageContainer>
    );
};

const Cache: React.FC = () => (
    <App>
        <CacheContent />
    </App>
);

export default Cache;
