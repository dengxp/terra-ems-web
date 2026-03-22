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
    getMeters, Meter
} from '@/apis/meter';
import { getMeterPointsByMeterId, MeterPoint } from '@/apis/meterPoint';
import { DeleteButton, EditButton, IconButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import { Permission } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import StatusIcon from '@/components/icons/StatusIcon';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, UnorderedListOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Card, Drawer, Empty, Flex, Space, Spin, Tag, Typography } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import MeterForm from './components/MeterForm';

/**
 * 计量器具管理页面
 */
const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Meter[]>([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerMeter, setDrawerMeter] = useState<Meter | null>(null);
    const [meterPoints, setMeterPoints] = useState<MeterPoint[]>([]);
    const [mpLoading, setMpLoading] = useState(false);

    const {
        getState,
        formRef,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<Meter>({
        pathname: '/basic-data/meter',
        entityName: '计量器具',
        baseUrl: '/api/meters',
    });

    const state = getState('/basic-data/meter');

    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        toEdit(selectedRows[0]);
    };

    const handleBatchDelete = async () => {
        if (deleteDisabled) return;
        try {
            await toBatchDelete(selectedRowKeys as number[], true);
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            // 错误由全局处理
        }
    };

    const handleFormSuccess = () => {
        setDialogVisible(false);
        actionRef.current?.reload();
    };

    const editDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length !== 1;
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length === 0;
    }, [selectedRowKeys]);

    useEffect(() => {
        if (state?.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state?.shouldRefresh]);

    const handleViewMeterPoints = async (meter: Meter) => {
        setDrawerMeter(meter);
        setDrawerVisible(true);
        setMpLoading(true);
        try {
            const res = await getMeterPointsByMeterId(meter.id);
            if (res.success) setMeterPoints(res.data || []);
        } finally { setMpLoading(false); }
    };

    const columns: ProColumns<Meter>[] = [
        {
            title: '器具名称',
            dataIndex: 'name',
            key: 'name',
            width: 150,
        },
        {
            title: '器具编码',
            dataIndex: 'code',
            key: 'code',
            width: 120,
        },
        {
            title: '能源类型',
            dataIndex: ['energyType', 'name'],
            key: 'energyTypeName',
            width: 100,
            hideInSearch: true,
            render: (_, record) => (
                record.energyType ? (
                    <Tag color={record.energyType.color || 'blue'}>
                        {record.energyType.name}
                    </Tag>
                ) : '-'
            ),
        },
        {
            title: '规格型号',
            dataIndex: 'modelNumber',
            key: 'modelNumber',
            width: 120,
            hideInSearch: true,
        },
        {
            title: '安装位置',
            dataIndex: 'location',
            key: 'location',
            width: 200,
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            valueType: 'select',
            fieldProps: {
                options: [
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ],
            },
            render: (_, record) => <StatusIcon value={record.status} />,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            width: 140,
            hideInSearch: true,
            render: (_, record) => (
                <Space>
                    <IconButton
                        icon={<UnorderedListOutlined />}
                        tooltip="计量点"
                        onClick={() => handleViewMeterPoints(record)}
                    />
                    <Permission code={PERMISSIONS.EMS.METER.EDIT}>
                        <EditButton onClick={() => toEdit(record)} />
                    </Permission>
                    <Permission code={PERMISSIONS.EMS.METER.REMOVE}>
                        <DeleteButton onConfirm={() => toDelete(record.id, true)} />
                    </Permission>
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable<Meter>
                    columns={columns}
                    rowKey="id"
                    formRef={formRef}
                    actionRef={actionRef}
                    tableAlertRender={false}
                    tableAlertOptionRender={false}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys, rows) => {
                            setSelectedRowKeys(keys);
                            setSelectedRows(rows);
                        },
                    }}
                    form={{ span: 6 }}
                    cardProps={{ variant: 'borderless' } as any}
                    search={{
                        collapseRender: false,
                        defaultCollapsed: false,
                        span: 6,
                    }}
                    toolbar={{
                        title: (
                            <Space>
                                <Permission code={PERMISSIONS.EMS.METER.EDIT}>
                                    <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                                </Permission>
                                <Permission code={PERMISSIONS.EMS.METER.EDIT} mode={'disable'}>
                                    <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>修改</Button>
                                </Permission>
                                <Permission code={PERMISSIONS.EMS.METER.REMOVE} mode={'disable'}>
                                    <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={handleBatchDelete}>删除</Button>
                                </Permission>
                            </Space>
                        ),
                    }}
                    request={async (params) => {
                        const { current, pageSize, ...rest } = params;
                        const res = await getMeters({
                            ...rest,
                            pageNumber: (current || 1) - 1,
                            pageSize: pageSize,
                        });
                        return wrapperResult(res);
                    }}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 20,
                    }}
                />
            </ProPageContainer>

            <MeterForm
                visible={state?.dialogVisible || false}
                onCancel={() => setDialogVisible(false)}
                onSuccess={handleFormSuccess}
            />

            {/* 计量点抽屉 */}
            <Drawer
                title={`计量点 — ${drawerMeter?.name || ''}`}
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                width={460}
            >
                {mpLoading ? (
                    <Flex justify="center" align="center" style={{ height: 200 }}><Spin /></Flex>
                ) : meterPoints.length === 0 ? (
                    <Empty description="该计量器具下暂无计量点" />
                ) : (
                    <Flex vertical gap={10}>
                        {meterPoints.map((point) => (
                            <Card key={point.id} size="small"
                                title={
                                    <Flex justify="space-between" align="center">
                                        <span>{point.name}</span>
                                        <Tag color="blue" style={{ marginRight: 0 }}>{point.code}</Tag>
                                    </Flex>
                                }
                                styles={{ body: { padding: '8px 16px' } }}
                            >
                                <Flex vertical gap={4}>
                                    <Flex justify="space-between">
                                        <Typography.Text type="secondary">点位类型</Typography.Text>
                                        <span>{point.pointType === 'COLLECT' ? '采集类' : point.pointType === 'CALC' ? '计算类' : point.pointType || '-'}</span>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Typography.Text type="secondary">计量单位</Typography.Text>
                                        <span>{point.unit || '-'}</span>
                                    </Flex>
                                    {point.energyType && (
                                        <Flex justify="space-between">
                                            <Typography.Text type="secondary">能源类型</Typography.Text>
                                            <Tag color="green" style={{ marginRight: 0 }}>{point.energyType.name}</Tag>
                                        </Flex>
                                    )}
                                    <Flex justify="space-between">
                                        <Typography.Text type="secondary">状态</Typography.Text>
                                        <StatusIcon value={point.status} />
                                    </Flex>
                                </Flex>
                            </Card>
                        ))}
                    </Flex>
                )}
            </Drawer>
        </>
    );
};

export default Index;
