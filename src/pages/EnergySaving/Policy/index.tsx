import {
  getPolicyPage, Policy,
  PolicyType,
  policyTypeOptions
} from '@/apis/policy';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import PolicyForm from './components/PolicyForm';

const PolicyPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Policy[]>([]);

    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<Policy>({
        pathname: '/energy-saving/policy',
        entityName: '政策法规',
        baseUrl: '/api/ems/policies',
    });

    const state = getState('/energy-saving/policy');

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

    const getTypeTag = (type: PolicyType) => {
        const option = policyTypeOptions.find((o) => o.value === type);
        return <Tag color={option?.color}>{option?.label || type}</Tag>;
    };

    const columns: ProColumns<Policy>[] = [
        {
            title: '政策标题',
            dataIndex: 'title',
            ellipsis: true,
            width: 200,
            hideInSearch: true,
        },
        {
            title: '关键词',
            dataIndex: 'keyword',
            hideInTable: true,
            fieldProps: {
                placeholder: '搜索标题/摘要/备注',
            },
        },
        {
            title: '政策类型',
            dataIndex: 'type',
            width: 100,
            valueType: 'select',
            fieldProps: {
                options: policyTypeOptions,
            },
            render: (_, record) => getTypeTag(record.type),
        },
        {
            title: '印发部门',
            dataIndex: 'department',
            width: 120,
            hideInSearch: true,
        },
        {
            title: '印发时间',
            dataIndex: 'issuingDate',
            width: 120,
            hideInSearch: true,
            render: (val) => (val ? dayjs(val as string).format('YYYY-MM-DD') : '-'),
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
                    <DeleteButton onConfirm={() => toDelete(record.id as number, true)} />
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer className={'pt-1'}>
            <ProTable<Policy>
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
                    const res = await getPolicyPage({
                        current: params.current,
                        pageSize: params.pageSize,
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
            <PolicyForm
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

export default PolicyPage;
