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
    getProductionRecords, ProductionRecord
} from '@/apis/productionRecord';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import { Permission } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, DatePicker, Space, Splitter, Tabs } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import ProductionRecordForm from './components/ProductionRecordForm';

const { RangePicker } = DatePicker;

/**
 * 产品产量记录管理页面
 */
const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<ProductionRecord[]>([]);
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month'),
    ]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [dataType, setDataType] = useState<string>('1');

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
    } = useCrud<ProductionRecord>({
        pathname: '/production/record',
        entityName: '产量记录',
        baseUrl: '/api/ems/production-records',
    });

    const state = getState('/production/record');

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
    }, [state?.shouldRefresh, setShouldRefresh, actionRef]);

    useEffect(() => {
        actionRef.current?.reload();
    }, [selectedUnitId, dataType, actionRef]);

    const handleAdd = () => {
        toCreate({
            energyUnitId: selectedUnitId,
            dataType: dataType,
            granularity: 'DAY'
        });
    };

    const columns: ProColumns<ProductionRecord>[] = [
        {
            title: '记录日期',
            dataIndex: 'recordDate',
            key: 'recordDate',
            width: 160,
            hideInSearch: true,
            render: (_, record) => {
                if (record.granularity === 'HOUR') {
                    return dayjs(record.recordDate).format('YYYY-MM-DD HH:mm');
                }
                return record.recordDate ? dayjs(record.recordDate).format('YYYY-MM-DD') : '-';
            },
        },
        {
            title: () => {
                switch (dataType) {
                    case '2': return '仪表名称';
                    case '3': return '指标名称';
                    default: return '产品名称';
                }
            },
            dataIndex: 'productName',
            key: 'productName',
            width: 150,
        },
        {
            title: () => {
                switch (dataType) {
                    case '2': return '读数';
                    case '3': return '指标值';
                    default: return '产量';
                }
            },
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            hideInSearch: true,
            render: (_, record) => `${record.quantity} ${record.unit || ''}`,
        },
        {
            title: '时间粒度',
            dataIndex: 'granularity',
            key: 'granularity',
            width: 100,
            hideInSearch: true,
            valueEnum: {
                HOUR: { text: '小时' },
                DAY: { text: '日' },
                MONTH: { text: '月' },
                YEAR: { text: '年' },
                CUSTOM: { text: '自定义' },
            },
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            width: 200,
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            width: 120,
            hideInSearch: true,
            render: (_, record) => (
                <Space>
                    <Permission code={PERMISSIONS.EMS.PRODUCTION_RECORD.EDIT}>
                        <EditButton onClick={() => toEdit(record)} />
                    </Permission>
                    <Permission code={PERMISSIONS.EMS.PRODUCTION_RECORD.REMOVE}>
                        <DeleteButton onConfirm={() => record.id && toDelete(record.id, true)} />
                    </Permission>
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProPageContainer title={false} className={'pt-1'}>
                <Splitter>
                    <Splitter.Panel defaultSize="20%" min="15%" max="30%" style={{ overflow: 'hidden' }}>
                        <EnergyUnitTree
                            selectedUnitId={selectedUnitId}
                            onSelect={(id) => setSelectedUnitId(id)}
                        />
                    </Splitter.Panel>

                    <Splitter.Panel style={{ overflow: 'hidden', paddingLeft: '16px' }}>
                        <ProTable<ProductionRecord>
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
                            form={{ span: 12 }}
                            cardProps={{ variant: 'borderless' } as any}
                            search={{
                                collapseRender: false,
                                defaultCollapsed: false,
                                span: 12,
                            }}
                            toolbar={{
                                title: (
                                    <Space>
                                        <Permission code={PERMISSIONS.EMS.PRODUCTION_RECORD.EDIT}>
                                            <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={handleAdd}>新建</Button>
                                        </Permission>
                                        <Permission code={PERMISSIONS.EMS.PRODUCTION_RECORD.EDIT} mode={'disable'}>
                                            <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>修改</Button>
                                        </Permission>
                                        <Permission code={PERMISSIONS.EMS.PRODUCTION_RECORD.REMOVE} mode={'disable'}>
                                            <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={handleBatchDelete}>删除</Button>
                                        </Permission>
                                    </Space>
                                ),
                                actions: [
                                    <Tabs
                                        key="dataType"
                                        activeKey={dataType}
                                        onChange={setDataType}
                                        size="small"
                                        items={[
                                            { label: '产品产量', key: '1' },
                                            { label: '仪表数据', key: '2' },
                                            { label: '能耗指标', key: '3' },
                                        ]}
                                    />,
                                    <RangePicker
                                        key="dateRange"
                                        value={dateRange}
                                        onChange={(dates) => {
                                            if (dates) {
                                                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                                                actionRef.current?.reload();
                                            }
                                        }}
                                    />,
                                ],
                            }}
                            request={async (params) => {
                                const { current, pageSize, energyUnitId: paramsUnitId, ...rest } = params;
                                const finalUnitId = selectedUnitId || paramsUnitId;
                                const res = await getProductionRecords({
                                    ...rest,
                                    energyUnitId: finalUnitId,
                                    dataType,
                                    startDate: dateRange[0].format('YYYY-MM-DD'),
                                    endDate: dateRange[1].format('YYYY-MM-DD'),
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
                    </Splitter.Panel>
                </Splitter>
            </ProPageContainer>

            <ProductionRecordForm
                open={state?.dialogVisible || false}
                onOpenChange={setDialogVisible}
                onSuccess={handleFormSuccess}
            />
        </>
    );
};

export default Index;
