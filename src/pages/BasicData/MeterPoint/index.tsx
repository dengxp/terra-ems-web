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

import { getMeterPointPage, getMeterPointLatestValues, MeterPoint, PointLatestValue } from '@/apis/meterPoint';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import { Permission } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import StatusIcon from '@/components/icons/StatusIcon';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MeterPointForm from './components/MeterPointForm';

/**
 * 计量点管理页面
 */
const MeterPointPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<MeterPoint[]>([]);
    const [latestValues, setLatestValues] = useState<Record<string, PointLatestValue>>({});
    const timerRef = useRef<ReturnType<typeof setInterval>>();

    const fetchLatestValues = useCallback(async () => {
        try {
            const res = await getMeterPointLatestValues();
            if (res.success) setLatestValues(res.data || {});
        } catch {}
    }, []);

    useEffect(() => {
        fetchLatestValues();
        timerRef.current = setInterval(fetchLatestValues, 30000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [fetchLatestValues]);

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
    } = useCrud<MeterPoint>({
        pathname: '/basic-data/meter-point',
        entityName: '计量点',
        baseUrl: '/api/meter-points',
    });

    const state = getState('/basic-data/meter-point');

    // 监听 shouldRefresh 状态，触发表格刷新
    useEffect(() => {
        if (state?.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state?.shouldRefresh, setShouldRefresh]);

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

    const columns: ProColumns<MeterPoint>[] = [
        {
            title: '点位编码',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            ellipsis: true,
        },
        {
            title: '点位名称',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            ellipsis: true,
        },
        {
            title: '点位类型',
            dataIndex: 'pointType',
            key: 'pointType',
            width: 100,
            valueType: 'select',
            fieldProps: {
                placeholder: '请选择类型',
            },
            valueEnum: {
                COLLECT: { text: '采集类' },
                CALC: { text: '计算类' },
            },
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            valueType: 'select',
            fieldProps: {
                placeholder: '请选择分类',
            },
            valueEnum: {
                ENERGY: { text: '能源类' },
                PRODUCT: { text: '产品类' },
                EFFICIENCY: { text: '能效类' },
                OPERATION: { text: '经营类' },
                OTHER: { text: '其他' },
            },
        },
        {
            title: '计量器具',
            dataIndex: ['meter', 'name'],
            key: 'meterName',
            width: 150,
            ellipsis: true,
            hideInSearch: true,
            render: (_, record) =>
                record.meter ? `${record.meter.name}` : '-',
        },
        {
            title: '能源类型',
            dataIndex: ['energyType', 'name'],
            key: 'energyTypeName',
            width: 100,
            hideInSearch: true,
            render: (_, record) =>
                record.energyType ? record.energyType.name : '-',
        },
        {
            title: '计量单位',
            dataIndex: 'unit',
            key: 'unit',
            width: 80,
            hideInSearch: true,
        },
        {
            title: '最新值',
            dataIndex: 'latestValue',
            width: 120,
            hideInSearch: true,
            render: (_, r) => {
                const info = latestValues[r.code];
                if (!info) return <Typography.Text type="secondary">-</Typography.Text>;
                const color = info.quality === 0 ? undefined : info.quality === 1 ? 'orange' : 'red';
                return <Tag color={color}>{info.value}</Tag>;
            },
        },
        {
            title: '采集时间',
            dataIndex: 'latestTime',
            width: 170,
            hideInSearch: true,
            render: (_, r) => {
                const info = latestValues[r.code];
                if (!info?.timestamp) return <Typography.Text type="secondary">-</Typography.Text>;
                return info.timestamp.replace('T', ' ').substring(0, 19);
            },
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
            width: 80,
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            valueType: 'select',
            fieldProps: {
                placeholder: '请选择状态',
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
            width: 120,
            hideInSearch: true,
            render: (_, record) => (
                <Space>
                    <Permission code={PERMISSIONS.EMS.METER_POINT.EDIT}>
                        <EditButton onClick={() => toEdit(record)} />
                    </Permission>
                    <Permission code={PERMISSIONS.EMS.METER_POINT.REMOVE}>
                        <DeleteButton onConfirm={() => toDelete(record.id, true)} />
                    </Permission>
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable<MeterPoint>
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
                        defaultCollapsed: true,
                        span: 6,
                    }}
                    toolbar={{
                        title: (
                            <Space>
                                <Permission code={PERMISSIONS.EMS.METER_POINT.EDIT}>
                                    <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                                </Permission>
                                <Permission code={PERMISSIONS.EMS.METER_POINT.EDIT} mode={'disable'}>
                                    <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>修改</Button>
                                </Permission>
                                <Permission code={PERMISSIONS.EMS.METER_POINT.REMOVE} mode={'disable'}>
                                    <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={handleBatchDelete}>删除</Button>
                                </Permission>
                            </Space>
                        ),
                    }}
                    request={async (params) => {
                        const { current, pageSize, ...rest } = params;
                        const res = await getMeterPointPage({
                            current: current,
                            pageSize: pageSize,
                            ...rest,
                        });
                        return wrapperResult(res);
                    }}
                    scroll={{ x: 1200 }}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 20,
                    }}
                />
            </ProPageContainer>

            <MeterPointForm
                visible={state?.dialogVisible || false}
                onVisibleChange={(v) => setDialogVisible(v)}
                onSuccess={handleFormSuccess}
            />
        </>
    );
};

export default MeterPointPage;
