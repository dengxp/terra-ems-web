import React, { useState, useMemo } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    Benchmark,
    BenchmarkType,
    BenchmarkTypeOptions,
    getBenchmarkPage,
} from '@/apis/benchmark';
import BenchmarkForm from './components/BenchmarkForm';
import { EditButton, DeleteButton } from '@/components/button';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';

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
    } = useCrud<Benchmark>({
        pathname: '/energy-saving/benchmark',
        entityName: '对标值',
        baseUrl: '/api/benchmarks',
    });

    const state = getState('/energy-saving/benchmark');

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
        const option = BenchmarkTypeOptions.find((o) => o.value === type);
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
        },
        {
            title: '标杆类型',
            dataIndex: 'type',
            width: 100,
            valueType: 'select',
            fieldProps: {
                options: BenchmarkTypeOptions,
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
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onClick={() => toDelete(record.id as number, true)} />
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
                            <Button
                                color={'primary'}
                                icon={<PlusOutlined />}
                                variant={'outlined'}
                                size={'small'}
                                onClick={toCreate}
                            >
                                新建
                            </Button>
                            <Button
                                color={'green'}
                                icon={<EditOutlined />}
                                disabled={editDisabled}
                                size={'small'}
                                variant={'outlined'}
                                onClick={toEditSelected}
                            >
                                修改
                            </Button>
                            <Button
                                color={'danger'}
                                icon={<DeleteOutlined />}
                                disabled={deleteDisabled}
                                size={'small'}
                                variant={'outlined'}
                                onClick={handleBatchDelete}
                            >
                                删除
                            </Button>
                        </Space>
                    ),
                }}
                request={async (params) => {
                    const res = await getBenchmarkPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        code: params.code,
                        name: params.name,
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
