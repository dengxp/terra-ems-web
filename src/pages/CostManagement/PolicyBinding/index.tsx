import React, { useState, useMemo, useEffect } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    CostPolicyBinding,
    getCostPolicyBindingPage,
    deleteCostPolicyBinding,
} from '@/apis/costPolicyBinding';
import { getEnabledEnergyUnits, EnergyUnit } from '@/apis/energyUnit';
import { getEnabledPricePolicies, PricePolicy } from '@/apis/pricePolicy';
import BindingForm from './components/BindingForm';
import { EditButton, DeleteButton } from '@/components/button';
import useCrud from '@/hooks/common/useCrud';
import dayjs from 'dayjs';

const PolicyBindingPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<CostPolicyBinding[]>([]);
    const [energyUnits, setEnergyUnits] = useState<EnergyUnit[]>([]);
    const [pricePolicies, setPricePolicies] = useState<PricePolicy[]>([]);

    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toBatchDelete,
        setDialogVisible,
    } = useCrud<CostPolicyBinding>({
        pathname: '/cost-management/policy-binding',
        entityName: '策略绑定',
        baseUrl: '/api/cost-policy-bindings',
    });

    const state = getState('/cost-management/policy-binding');

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            const [unitRes, policyRes] = await Promise.all([
                getEnabledEnergyUnits(),
                getEnabledPricePolicies(),
            ]);
            setEnergyUnits(unitRes.data || []);
            setPricePolicies(policyRes.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    const toEditSelected = () => {
        if (editDisabled) return;
        toEdit(selectedRows[0]);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteCostPolicyBinding(id);
            actionRef.current?.reload();
        } catch (error) {
            console.error(error);
        }
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
                    <DeleteButton onClick={() => handleDelete(record.id)} />
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
                    return {
                        data: res.data?.content || [],
                        success: res.success,
                        total: res.data?.totalElements || 0,
                    };
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
                isEdit={!!state?.editData}
                currentRecord={state?.operation === 'edit' ? (state?.editData as CostPolicyBinding | undefined) : undefined}
                energyUnits={energyUnits}
                pricePolicies={pricePolicies}
                onSuccess={() => {
                    setDialogVisible(false);
                    actionRef.current?.reload();
                }}
            />
        </ProPageContainer>
    );
};

export default PolicyBindingPage;
