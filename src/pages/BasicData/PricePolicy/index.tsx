import React, { useMemo, useRef, useState } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PricePolicy, PeriodTypeOptions, getPricePolicyPage, deletePricePolicy } from '@/apis/pricePolicy';
import PricePolicyForm from './components/PricePolicyForm';
import StatusIcon from '@/components/icons/StatusIcon';
import { EditButton, DeleteButton } from '@/components/button';
import ModalConfirm from '@/components/ModalConfirm';
import useCrud from '@/hooks/common/useCrud';

/**
 * 电价策略管理页面
 */
const PricePolicyPage: React.FC = () => {
    const formRef = useRef<ProFormInstance>();
    const actionRef = useRef<ActionType>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<PricePolicy[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<PricePolicy | undefined>(undefined);

    const { toDelete } = useCrud<PricePolicy>({
        pathname: '/basic-data/price-policy',
        entityName: '电价策略',
        baseUrl: '/api/price-policies',
    });

    const handleAdd = () => {
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: PricePolicy) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        handleEdit(selectedRows[0]);
    };

    const toDeleteBatch = () => {
        if (deleteDisabled) return;
        if (!selectedRowKeys || selectedRowKeys.length === 0) return;

        ModalConfirm({
            title: '删除电价策略',
            content: '电价策略删除后将无法恢复，请确认是否删除？',
            onOk: async () => {
                try {
                    for (const id of selectedRowKeys) {
                        await deletePricePolicy(id as number);
                    }
                    message.success('删除成功');
                    setSelectedRowKeys([]);
                    setSelectedRows([]);
                    actionRef.current?.reload();
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    const handleFormSuccess = () => {
        setFormVisible(false);
        actionRef.current?.reload();
    };

    const editDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length !== 1;
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length === 0;
    }, [selectedRowKeys]);

    // 渲染时段价格标签
    const renderPeriodTags = (items: any[]) => {
        if (!items || items.length === 0) return '-';
        return (
            <Space size={4} wrap>
                {items.map((item, index) => {
                    const opt = PeriodTypeOptions.find(o => o.value === item.periodType);
                    const timeRange = item.startTime && item.endTime
                        ? `${item.startTime}-${item.endTime}`
                        : '';
                    return (
                        <Tag key={index} color={opt?.color}>
                            {opt?.label}{timeRange ? `(${timeRange})` : ''}: ¥{item.price}
                        </Tag>
                    );
                })}
            </Space>
        );
    };

    const columns: ProColumns<PricePolicy>[] = [
        {
            title: '策略编码',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            ellipsis: true,
        },
        {
            title: '策略名称',
            dataIndex: 'name',
            key: 'name',
            width: 150,
            ellipsis: true,
        },
        {
            title: '生效日期',
            dataIndex: 'effectiveDateRange',
            key: 'effectiveDateRange',
            width: 120,
            hideInSearch: true,
            render: (_, record: any) => {
                const start = record.effectiveStartDate || record.effectiveDateRange?.[0];
                const end = record.effectiveEndDate || record.effectiveDateRange?.[1];
                if (!start && !end) return '-';
                return (
                    <div style={{ fontSize: 12 }}>
                        <div>{start || '-'}</div>
                        <div>{end || '-'}</div>
                    </div>
                );
            },
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
            title: '时段配置',
            dataIndex: 'items',
            key: 'items',
            width: 400,
            hideInSearch: true,
            render: (_, record) => renderPeriodTags(record.items),
        },
        {
            title: '分时电价',
            dataIndex: 'isMultiRate',
            key: 'isMultiRate',
            width: 80,
            hideInSearch: true,
            render: (_, record) => (record.isMultiRate ? '是' : '否'),
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
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable<PricePolicy>
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
                    cardProps={{ bordered: false }}
                    search={{
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
                                    onClick={handleAdd}
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
                                    onClick={toDeleteBatch}
                                >
                                    删除
                                </Button>
                            </Space>
                        ),
                    }}
                    request={async (params) => {
                        const { current, pageSize, ...rest } = params;
                        const res = await getPricePolicyPage({
                            current: current,
                            pageSize: pageSize,
                        });
                        return {
                            data: res.data?.content || [],
                            total: res.data?.totalElements || 0,
                            success: res.success,
                        };
                    }}
                    scroll={{ x: 1200 }}
                />
            </ProPageContainer>

            <PricePolicyForm
                visible={formVisible}
                onVisibleChange={setFormVisible}
                onSuccess={handleFormSuccess}
                currentRecord={currentRecord}
            />
        </>
    );
};

export default PricePolicyPage;
