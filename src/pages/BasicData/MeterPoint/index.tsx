import React, { useEffect, useMemo, useState } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { MeterPoint, getMeterPointPage } from '@/apis/meterPoint';
import MeterPointForm from './components/MeterPointForm';
import StatusIcon from '@/components/icons/StatusIcon';
import { EditButton, DeleteButton } from '@/components/button';
import useCrud from '@/hooks/common/useCrud';

/**
 * 采集点位管理页面
 */
const MeterPointPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<MeterPoint[]>([]);

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
        entityName: '采集点位',
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
                COLLECT: { text: '采集类', status: 'Processing' },
                CALC: { text: '计算类', status: 'Warning' },
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
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onClick={() => toDelete(record.id, true)} />
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
                        const { current, pageSize, ...rest } = params;
                        const res = await getMeterPointPage({
                            current: current,
                            pageSize: pageSize,
                            ...rest,
                        });
                        return {
                            data: res.data?.content || [],
                            total: res.data?.totalElement || 0,
                            success: res.success,
                        };
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
