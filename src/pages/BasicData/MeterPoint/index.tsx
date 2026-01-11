import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ActionType, ProColumns, ProFormInstance } from '@ant-design/pro-components';
import { Button, message, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { MeterPoint, getMeterPointPage, deleteMeterPoint } from '@/apis/meterPoint';
import MeterPointForm from './components/MeterPointForm';
import StatusIcon from '@/components/icons/StatusIcon';
import { EditButton, DeleteButton } from '@/components/button';
import ModalConfirm from '@/components/ModalConfirm';
import useCrud from '@/hooks/common/useCrud';

/**
 * 采集点位管理页面
 */
const MeterPointPage: React.FC = () => {
    const formRef = useRef<ProFormInstance>();
    const actionRef = useRef<ActionType>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<MeterPoint[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<MeterPoint | undefined>(undefined);

    const { toDelete } = useCrud<MeterPoint>({
        pathname: '/basic-data/meter-point',
        entityName: '采集点位',
        baseUrl: '/api/meter-points',
    });

    const handleAdd = () => {
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: MeterPoint) => {
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
            title: '删除采集点位',
            content: '采集点位删除后将无法恢复，请确认是否删除？',
            onOk: async () => {
                try {
                    // 逐个删除
                    for (const id of selectedRowKeys) {
                        await deleteMeterPoint(id as number);
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
                    <EditButton onClick={() => handleEdit(record)} />
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
                        const res = await getMeterPointPage({
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

            <MeterPointForm
                visible={formVisible}
                onVisibleChange={setFormVisible}
                onSuccess={handleFormSuccess}
                currentRecord={currentRecord}
            />
        </>
    );
};

export default MeterPointPage;
