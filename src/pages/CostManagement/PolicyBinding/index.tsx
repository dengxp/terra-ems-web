import React, { useState, useMemo, useEffect } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    CostPolicyBinding,
    getCostPolicyBindingPage,
} from '@/apis/costPolicyBinding';
import { getEnabledEnergyUnits, EnergyUnit } from '@/apis/energyUnit';
import BindingForm from './components/BindingForm';
import { EditButton, DeleteButton } from '@/components/button';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import dayjs from 'dayjs';

const PolicyBindingPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<CostPolicyBinding[]>([]);
    const [energyUnits, setEnergyUnits] = useState<EnergyUnit[]>([]);

    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<CostPolicyBinding>({
        pathname: '/cost-management/policy-binding',
        entityName: '策略绑定',
        baseUrl: '/api/cost-policy-bindings',
    });

    const state = getState('/cost-management/policy-binding');

    // 监听 shouldRefresh 状态，触发表格刷新
    useEffect(() => {
        if (state?.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state?.shouldRefresh, setShouldRefresh, actionRef]);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            const unitRes = await getEnabledEnergyUnits();
            setEnergyUnits(unitRes.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const toEditSelected = () => {
        if (editDisabled) return;
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

    const editDisabled = useMemo(() => !selectedRowKeys || selectedRowKeys.length !== 1, [selectedRowKeys]);
    const deleteDisabled = useMemo(() => !selectedRowKeys || selectedRowKeys.length === 0, [selectedRowKeys]);

    const columns: ProColumns<CostPolicyBinding>[] = [
        {
            title: '用能单元',
            dataIndex: ['energyUnit', 'name'],
            width: 150,
            renderFormItem: () => (
                <Select
                    allowClear
                    placeholder="请选择"
                    options={energyUnits.map((u) => ({ label: u.name, value: u.id }))}
                />
            ),
        },
        {
            title: '电价策略',
            dataIndex: ['pricePolicy', 'name'],
            width: 150,
            hideInSearch: true,
        },
        {
            title: '生效开始日期',
            dataIndex: 'effectiveStartDate',
            width: 120,
            hideInSearch: true,
            render: (val) => (val ? dayjs(val as string).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '生效结束日期',
            dataIndex: 'effectiveEndDate',
            width: 120,
            hideInSearch: true,
            render: (val) => (val ? dayjs(val as string).format('YYYY-MM-DD') : '长期有效'),
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
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onClick={() => toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer className={'pt-1'}>
            <ProTable<CostPolicyBinding>
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
                            <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>
                                新建
                            </Button>
                            <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>
                                修改
                            </Button>
                            <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={handleBatchDelete}>
                                删除
                            </Button>
                        </Space>
                    ),
                }}
                request={async (params) => {
                    const res = await getCostPolicyBindingPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        energyUnitId: params.energyUnit?.id,
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
            <BindingForm
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

export default PolicyBindingPage;
