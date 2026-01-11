import React, { useRef, useState, useMemo } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    EnergyCostRecord,
    RecordPeriodTypeOptions,
    getEnergyCostRecordPage,
    deleteEnergyCostRecord,
} from '@/apis/energyCostRecord';
import CostRecordForm from './components/CostRecordForm';
import { EditButton, DeleteButton } from '@/components/button';
import ModalConfirm from '@/components/ModalConfirm';
import dayjs from 'dayjs';

const CostRecordPage: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<EnergyCostRecord[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<EnergyCostRecord>();

    const handleAdd = () => {
        setIsEdit(false);
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: EnergyCostRecord) => {
        setIsEdit(true);
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const toEditSelected = () => {
        if (editDisabled) return;
        handleEdit(selectedRows[0]);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteEnergyCostRecord(id);
            message.success('删除成功');
            actionRef.current?.reload();
        } catch (error) {
            console.error(error);
        }
    };

    const toDeleteBatch = () => {
        if (deleteDisabled) return;

        ModalConfirm({
            title: '删除成本记录',
            content: '确认删除选中的成本记录？',
            onOk: async () => {
                try {
                    for (const id of selectedRowKeys) {
                        await deleteEnergyCostRecord(id as number);
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

    const editDisabled = useMemo(() => !selectedRowKeys || selectedRowKeys.length !== 1, [selectedRowKeys]);
    const deleteDisabled = useMemo(() => !selectedRowKeys || selectedRowKeys.length === 0, [selectedRowKeys]);

    const getPeriodTypeTag = (type: string) => {
        const option = RecordPeriodTypeOptions.find((o) => o.value === type);
        return <Tag>{option?.label || type}</Tag>;
    };

    const columns: ProColumns<EnergyCostRecord>[] = [
        {
            title: '记录日期',
            dataIndex: 'recordDate',
            width: 110,
            valueType: 'date',
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
            title: '周期类型',
            dataIndex: 'periodType',
            width: 80,
            valueType: 'select',
            fieldProps: { options: RecordPeriodTypeOptions },
            render: (_, record) => getPeriodTypeTag(record.periodType),
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
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => handleDelete(record.id)} />
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer className={'pt-1'}>
            <ProTable<EnergyCostRecord>
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
                            <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={handleAdd}>
                                新建
                            </Button>
                            <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>
                                修改
                            </Button>
                            <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={toDeleteBatch}>
                                删除
                            </Button>
                        </Space>
                    ),
                }}
                request={async (params) => {
                    const res = await getEnergyCostRecordPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        periodType: params.periodType,
                        startDate: params.recordDate,
                    });
                    return {
                        data: res.data?.content || [],
                        success: res.success,
                        total: res.data?.totalElements || 0,
                    };
                }}
                columns={columns}
            />
            <CostRecordForm
                visible={formVisible}
                onVisibleChange={setFormVisible}
                isEdit={isEdit}
                currentRecord={currentRecord}
                onSuccess={() => actionRef.current?.reload()}
            />
        </ProPageContainer>
    );
};

export default CostRecordPage;
