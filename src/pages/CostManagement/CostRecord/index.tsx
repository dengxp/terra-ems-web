import {
    deleteEnergyCostRecord, EnergyCostRecord,
    getEnergyCostRecordPage
} from '@/apis/energyCostRecord';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import { Permission } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProFormInstance, ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import CostRecordForm from './components/CostRecordForm';

const CostRecordPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<EnergyCostRecord[]>([]);
    const formRef = useRef<ProFormInstance>();

    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<EnergyCostRecord>({
        pathname: '/cost-management/cost-record',
        entityName: '成本记录',
        baseUrl: '/api/ems/energy-cost-records',
    });

    const state = getState('/cost-management/cost-record');

    // 监听 shouldRefresh 状态，触发表格刷新
    useEffect(() => {
        if (state?.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state?.shouldRefresh, setShouldRefresh, actionRef]);

    const toEditSelected = () => {
        if (editDisabled) return;
        toEdit(selectedRows[0]);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteEnergyCostRecord(id);
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


    const columns: ProColumns<EnergyCostRecord>[] = [

        {
            title: '记录日期',
            dataIndex: 'recordDateRange',
            hideInTable: true,
            valueType: 'dateRange',
            fieldProps: {
                style: { width: '260px' },
            },
        },
        {
            title: '记录日期',
            dataIndex: 'recordDate',
            width: 110,
            hideInSearch: true,
            render: (_, record) => dayjs(record.recordDate).format('YYYY-MM-DD'),
        },
        {
            title: '用能单元',
            dataIndex: ['energyUnit', 'name'],
            width: 140,
            hideInSearch: true,
        },
        {
            title: '能源类型',
            dataIndex: ['energyType', 'name'],
            width: 100,
            hideInSearch: true,
        },
        {
            title: '用量',
            dataIndex: 'consumption',
            width: 100,
            hideInSearch: true,
            render: (val) => (val ? Number(val).toLocaleString() : '-'),
        },
        {
            title: '成本(元)',
            dataIndex: 'cost',
            width: 110,
            hideInSearch: true,
            render: (val) => (val ? `¥${Number(val).toLocaleString()}` : '-'),
        },
        {
            title: '功率因数',
            dataIndex: 'powerFactor',
            width: 90,
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Permission code={PERMISSIONS.EMS.ENERGY_COST_RECORD.EDIT}>
                        <EditButton onClick={() => toEdit(record)} />
                    </Permission>
                    <Permission code={PERMISSIONS.EMS.ENERGY_COST_RECORD.REMOVE}>
                        <DeleteButton onConfirm={() => handleDelete(record.id)} />
                    </Permission>
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer className={'pt-1'}>
            <ProTable<EnergyCostRecord>
                formRef={formRef}
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
                            <Permission code={PERMISSIONS.EMS.ENERGY_COST_RECORD.EDIT}>
                                <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                            </Permission>
                            <Permission code={PERMISSIONS.EMS.ENERGY_COST_RECORD.EDIT} mode={'disable'}>
                                <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>修改</Button>
                            </Permission>
                            <Permission code={PERMISSIONS.EMS.ENERGY_COST_RECORD.REMOVE} mode={'disable'}>
                                <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={handleBatchDelete}>删除</Button>
                            </Permission>
                        </Space>
                    ),
                }}
                request={async (params) => {
                    // 使用日期范围选择器的值
                    let startDate: string | undefined;
                    let endDate: string | undefined;

                    if (params.recordDateRange && Array.isArray(params.recordDateRange)) {
                        const [start, end] = params.recordDateRange;
                        if (start && end) {
                            startDate = dayjs(start).format('YYYY-MM-DD');
                            endDate = dayjs(end).format('YYYY-MM-DD');
                        }
                    }

                    console.log('查询参数:', {
                        recordDateRange: params.recordDateRange,
                        startDate,
                        endDate,
                    });

                    const res = await getEnergyCostRecordPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        startDate,
                        endDate,
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
            <CostRecordForm
                open={state?.dialogVisible || false}
                onOpenChange={setDialogVisible}
            />
        </ProPageContainer>
    );
};

export default CostRecordPage;
