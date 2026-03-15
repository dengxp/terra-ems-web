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

import { AlarmConfig, getAlarmConfigsByMeterPoint } from '@/apis/alarm';
import { getMeterPointsByEnergyUnitId, MeterPoint } from '@/apis/meterPoint';
import { DeleteButton, EditButton } from '@/components/button';
import { Permission } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import ModalConfirm from '@/components/ModalConfirm';
import useCrud from '@/hooks/common/useCrud';
import {
    PlusOutlined, SettingOutlined,
    ThunderboltOutlined, UnorderedListOutlined
} from '@ant-design/icons';
import { PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Card, Empty, List, message, Space, Splitter, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import AlarmConfigForm from './components/AlarmConfigForm';

const AlarmConfigPage: React.FC = () => {
    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        setDialogVisible,
    } = useCrud<AlarmConfig>({
        pathname: '/basic-data/alarm-config',
        entityName: '报警配置',
        baseUrl: '/api/alarm-configs',
    });

    const state = getState('/basic-data/alarm-config');

    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [points, setPoints] = useState<MeterPoint[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<MeterPoint | null>(null);

    // When unit is selected, fetch points
    useEffect(() => {
        if (selectedUnitId) {
            getMeterPointsByEnergyUnitId(selectedUnitId).then((res) => {
                if (res.success) setPoints(res.data || []);
            });
            setSelectedPoint(null);
        }
    }, [selectedUnitId]);


    const handleAdd = () => {
        if (!selectedPoint) {
            message.warning('请先选择采集点位');
            return;
        }
        toCreate();
    };

    const handleEdit = (record: AlarmConfig) => {
        toEdit(record);
    };

    const handleFormSuccess = () => {
        setDialogVisible(false);
        actionRef.current?.reload();
    };

    const handleDelete = (id: number) => {
        ModalConfirm({
            title: '删除报警配置',
            content: '报警配置删除后将无法恢复，确定删除吗？',
            async onOk() {
                try {
                    await toDelete(id, true);
                    actionRef.current?.reload();
                } catch (error) {
                    // 错误由全局处理
                }
            }
        });
    };

    const columns: ProColumns<AlarmConfig>[] = [
        {
            title: '限值类型',
            dataIndex: ['alarmLimitType', 'limitName'],
            render: (_, record) => (
                <Space>
                    <div
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: record.alarmLimitType?.colorNumber || '#ccc',
                            boxShadow: `0 0 4px ${record.alarmLimitType?.colorNumber || '#ccc'}`
                        }}
                    />
                    <span>{record.alarmLimitType?.limitName}</span>
                </Space>
            )
        },
        {
            title: '比较逻辑',
            render: (_, record) => (
                <Tag color="blue">
                    {record.alarmLimitType?.comparatorOperator} {record.limitValue}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'isEnabled',
            width: 80,
            render: (val) => (
                <Tag color={val ? 'success' : 'default'}>
                    {val ? '已启用' : '已禁用'}
                </Tag>
            )
        },
        {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Permission code={PERMISSIONS.EMS.ALARM_CONFIG.REMOVE}>
                        <EditButton onClick={() => handleEdit(record)} />
                    </Permission>
                    <Permission code={PERMISSIONS.EMS.ALARM_CONFIG.REMOVE}>
                        <DeleteButton onConfirm={() => handleDelete(record.id)} />
                    </Permission>
                </Space>
            )
        }
    ];

    // 卡片标题渲染
    const CardTitle = ({ icon, title }: { icon: React.ReactNode; title: React.ReactNode }) => (
        <Space size={8}>
            <span style={{ color: '#1890ff' }}>{icon}</span>
            <span>{title}</span>
        </Space>
    );

    return (
        <PageContainer title={false} style={{ paddingBottom: 0 }}>
            <Splitter style={{ height: 'calc(100vh - 280px)' }}>
                <Splitter.Panel defaultSize="20%" min="15%" max="30%" style={{ overflow: 'hidden' }}>
                    <EnergyUnitTree
                        selectedUnitId={selectedUnitId}
                        onSelect={(id) => setSelectedUnitId(id)}
                    />
                </Splitter.Panel>

                {/* 中间采集点列表 */}
                <Splitter.Panel defaultSize="40%" min="20%" style={{ overflow: 'hidden', paddingLeft: '16px' }}>
                    <Card
                        title={<CardTitle icon={<UnorderedListOutlined />} title="采集点位列表" />}
                        size="small"
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        styles={{ body: { flex: 1, overflow: 'auto', padding: 0 } }}
                    >
                        {points.length > 0 ? (
                            <List
                                dataSource={points}
                                size="small"
                                renderItem={(item: MeterPoint) => {
                                    const isSelected = selectedPoint?.id === item.id;
                                    return (
                                        <List.Item
                                            onClick={() => setSelectedPoint(item)}
                                            style={{
                                                cursor: 'pointer',
                                                padding: '10px 12px',
                                                backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                                                borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent',
                                                borderBottom: '1px solid #f0f0f0',
                                                transition: 'all 0.2s ease',
                                            }}
                                            className="point-list-item"
                                        >
                                            <List.Item.Meta
                                                title={
                                                    <span style={{
                                                        fontSize: 13,
                                                        fontWeight: isSelected ? 500 : 400,
                                                        color: isSelected ? '#1890ff' : 'rgba(0,0,0,0.85)'
                                                    }}>
                                                        {item.name}
                                                    </span>
                                                }
                                                description={
                                                    <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                                                        {item.code}
                                                    </span>
                                                }
                                            />
                                        </List.Item>
                                    );
                                }}
                            />
                        ) : (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                                            {selectedUnitId ? "该单元下暂无采集点位" : "请先选择用能单元"}
                                        </span>
                                    }
                                />
                            </div>
                        )}
                    </Card>
                </Splitter.Panel>

                {/* 预报警配置 */}
                <Splitter.Panel style={{ overflow: 'hidden', paddingLeft: '16px' }}>
                    <Card
                        title={
                            <CardTitle
                                icon={<SettingOutlined />}
                                title={
                                    selectedPoint
                                        ? <Tooltip title={selectedPoint.name}>
                                            <span>预报警配置: {selectedPoint.name.length > 10 ? selectedPoint.name.slice(0, 10) + '...' : selectedPoint.name}</span>
                                        </Tooltip>
                                        : '预报警配置'
                                }
                            />
                        }
                        size="small"
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        styles={{ body: { flex: 1, overflow: 'auto', padding: 0 } }}
                        extra={
                            <Permission code={PERMISSIONS.EMS.ALARM_CONFIG.REMOVE}>
                                <Button
                                    type="text"
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={handleAdd}
                                    disabled={!selectedPoint}
                                    style={{ color: selectedPoint ? '#1890ff' : undefined }}
                                >
                                    新增配置
                                </Button>
                            </Permission>
                        }
                    >
                        {selectedPoint ? (
                            <ProTable<AlarmConfig>
                                actionRef={actionRef}
                                columns={columns}
                                rowKey="id"
                                search={false}
                                options={false}
                                pagination={false}
                                request={async () => {
                                    const res = await getAlarmConfigsByMeterPoint(selectedPoint.id as number);
                                    return {
                                        data: res.data || [],
                                        success: res.success,
                                    };
                                }}
                                params={{ pointId: selectedPoint.id }}
                            />
                        ) : (
                            <div style={{ padding: '60px 0', textAlign: 'center' }}>
                                <ThunderboltOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                                <div style={{ color: 'rgba(0,0,0,0.45)' }}>请从左侧选择一个采集点位开始配置</div>
                            </div>
                        )}
                    </Card>
                </Splitter.Panel>
            </Splitter>

            <AlarmConfigForm
                visible={state?.dialogVisible || false}
                onVisibleChange={setDialogVisible}
                onSuccess={handleFormSuccess}
                point={selectedPoint}
            />

            <style>{`
                .point-list-item:hover {
                    background-color: #fafafa !important;
                }
            `}</style>
        </PageContainer>
    );
};

export default AlarmConfigPage;
