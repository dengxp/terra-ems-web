/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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
    Benchmark,
    BenchmarkType,
    benchmarkTypeOptions,
    getBenchmarkPage
} from '@/apis/benchmark';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import { Permission } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import BenchmarkForm from './components/BenchmarkForm';

const BenchmarkPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Benchmark[]>([]);

    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<Benchmark>({
        pathname: '/energy-saving/benchmark',
        entityName: '对标值',
        baseUrl: '/api/ems/benchmarks',
    });

    const state = getState('/energy-saving/benchmark');

    // 监听 shouldRefresh 状态，触发表格刷新
    useEffect(() => {
        if (state?.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state?.shouldRefresh, setShouldRefresh, actionRef]);

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

    const editDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length !== 1;
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length === 0;
    }, [selectedRowKeys]);

    const getTypeTag = (type: BenchmarkType) => {
        const option = benchmarkTypeOptions.find((o) => o.value === type);
        return <Tag color={option?.color}>{option?.label || type}</Tag>;
    };

    const columns: ProColumns<Benchmark>[] = [
        {
            title: '标杆编码',
            dataIndex: 'code',
            width: 120,
        },
        {
            title: '标杆名称',
            dataIndex: 'name',
            ellipsis: true,
            width: 150,
            hideInSearch: true,
        },
        {
            title: '关键词',
            dataIndex: 'keyword',
            hideInTable: true,
            fieldProps: {
                placeholder: '搜索名称/备注',
            },
        },
        {
            title: '标杆类型',
            dataIndex: 'type',
            width: 100,
            valueType: 'select',
            fieldProps: {
                options: benchmarkTypeOptions,
            },
            render: (_, record) => getTypeTag(record.type),
        },
        {
            title: '标杆值',
            dataIndex: 'value',
            width: 120,
            hideInSearch: true,
            render: (val, record) => (val ? `${val} ${record.unit || ''}` : '-'),
        },
        {
            title: '等级',
            dataIndex: 'grade',
            width: 100,
            hideInSearch: true,
        },
        {
            title: '国标编号',
            dataIndex: 'nationalNum',
            width: 150,
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            hideInSearch: true,
            render: (val) => (
                <Tag color={val === 0 ? 'success' : 'default'}>
                    {val === 0 ? '启用' : '禁用'}
                </Tag>
            ),
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Permission code={PERMISSIONS.EMS.BENCHMARK.REMOVE}>
                        <EditButton onClick={() => toEdit(record)} />
                    </Permission>
                    <Permission code={PERMISSIONS.EMS.BENCHMARK.REMOVE}>
                        <DeleteButton onConfirm={() => toDelete(record.id as number, true)} />
                    </Permission>
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer className={'pt-1'}>
            <ProTable<Benchmark>
                actionRef={actionRef}
                rowKey="id"
                tableAlertRender={false}
                tableAlertOptionRender={false}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys, rows) => {
                        setSelectedRowKeys(keys);
                        setSelectedRows(rows);
                    },
                }}
                search={{
                    labelWidth: 'auto',
                    defaultCollapsed: true,
                    span: 6,
                }}
                toolbar={{
                    title: (
                        <Space>
                            <Permission code={PERMISSIONS.EMS.BENCHMARK.REMOVE}>
                                <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                            </Permission>
                            <Permission code={PERMISSIONS.EMS.BENCHMARK.REMOVE} mode={'disable'}>
                                <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>修改</Button>
                            </Permission>
                            <Permission code={PERMISSIONS.EMS.BENCHMARK.REMOVE} mode={'disable'}>
                                <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={handleBatchDelete}>删除</Button>
                            </Permission>
                        </Space>
                    ),
                }}
                request={async (params) => {
                    const res = await getBenchmarkPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        code: params.code,
                        keyword: params.keyword,
                        type: params.type,
                    });
                    return wrapperResult(res);
                }}
                columns={columns}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    defaultPageSize: 20,
                }}
            />
            <BenchmarkForm
                visible={state?.dialogVisible || false}
                onVisibleChange={(v) => setDialogVisible(v)}
                onSuccess={() => {
                    setDialogVisible(false);
                    actionRef.current?.reload();
                }}
            />
        </ProPageContainer>
    );
};

export default BenchmarkPage;
