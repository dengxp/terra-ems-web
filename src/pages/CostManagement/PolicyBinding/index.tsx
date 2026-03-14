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
    CostPolicyBinding,
    getCostPolicyBindingPage
} from '@/apis/costPolicyBinding';
import { EnergyUnit, getEnabledEnergyUnitTree } from '@/apis/energyUnit';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import { Permission } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import StatusIcon from '@/components/icons/StatusIcon';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, TreeSelect } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import BindingForm from './components/BindingForm';

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
        baseUrl: '/api/ems/cost-policy-bindings',
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
            const unitRes = await getEnabledEnergyUnitTree();
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
            key: 'energyUnitId',
            width: 150,
            renderFormItem: () => (
                <TreeSelect
                    allowClear
                    showSearch
                    placeholder="请选择用能单元"
                    treeData={energyUnits}
                    fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                    treeDefaultExpandAll
                    filterTreeNode={(input, node) =>
                        (node?.name as string)?.toLowerCase().includes(input.toLowerCase())
                    }
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
            render: (val) => {
                if (!val || val === '' || val === null || val === undefined) {
                    return '长期有效';
                }
                const date = dayjs(val as string);
                return date.isValid() ? date.format('YYYY-MM-DD') : '长期有效';
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            hideInSearch: true,
            render: (_, record) => <StatusIcon value={record.status} />,
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
                    <Permission code={PERMISSIONS.EMS.COST_POLICY_BINDING.REMOVE}>
                        <EditButton onClick={() => toEdit(record)} />
                    </Permission>
                    <Permission code={PERMISSIONS.EMS.COST_POLICY_BINDING.REMOVE}>
                        <DeleteButton onConfirm={() => toDelete(record.id, true)} />
                    </Permission>
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
                            <Permission code={PERMISSIONS.EMS.COST_POLICY_BINDING.REMOVE}>
                                <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                            </Permission>
                            <Permission code={PERMISSIONS.EMS.COST_POLICY_BINDING.REMOVE} mode={'disable'}>
                                <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>修改</Button>
                            </Permission>
                            <Permission code={PERMISSIONS.EMS.COST_POLICY_BINDING.REMOVE} mode={'disable'}>
                                <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={handleBatchDelete}>删除</Button>
                            </Permission>
                        </Space>
                    ),
                }}
                request={async (params) => {
                    console.log('搜索参数:', params);
                    const res = await getCostPolicyBindingPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        energyUnitId: params.energyUnitId,
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
