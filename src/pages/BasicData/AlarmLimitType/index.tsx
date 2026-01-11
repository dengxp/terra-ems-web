import React, { useRef, useState, useMemo } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AlarmLimitType, getAlarmLimitTypePage, deleteAlarmLimitType } from '@/apis/alarm';
import AlarmLimitTypeForm from './components/AlarmLimitTypeForm';
import { EditButton, DeleteButton } from '@/components/button';
import ModalConfirm from '@/components/ModalConfirm';

const AlarmLimitTypePage: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<AlarmLimitType[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<AlarmLimitType>();

    const handleAdd = () => {
        setIsEdit(false);
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: AlarmLimitType) => {
        setIsEdit(true);
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        handleEdit(selectedRows[0]);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteAlarmLimitType(id);
            message.success('删除成功');
            actionRef.current?.reload();
        } catch (error) {
            console.error(error);
        }
    };

    const toDeleteBatch = () => {
        if (deleteDisabled) return;
        if (!selectedRowKeys || selectedRowKeys.length === 0) return;

        ModalConfirm({
            title: '删除报警限值类型',
            content: '报警限值类型删除后将无法恢复，请确认是否删除？',
            onOk: async () => {
                try {
                    for (const id of selectedRowKeys) {
                        await deleteAlarmLimitType(id as number);
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

    const editDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length !== 1;
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length === 0;
    }, [selectedRowKeys]);

    const columns: ProColumns<AlarmLimitType>[] = [
        {
            title: '限值类型名称',
            dataIndex: 'limitName',
        },
        {
            title: '限值类型编码',
            dataIndex: 'limitCode',
        },
        {
            title: '色号',
            dataIndex: 'colorNumber',
            hideInSearch: true,
            render: (text) => (
                <Space>
                    <div style={{ width: 20, height: 20, borderRadius: 4, backgroundColor: text as string }} />
                    <span>{text}</span>
                </Space>
            ),
        },
        {
            title: '比较运算符',
            dataIndex: 'comparatorOperator',
            hideInSearch: true,
        },
        {
            title: '报警级别',
            dataIndex: 'alarmType',
            hideInSearch: true,
            render: (text) => (
                <Tag color={text === 'ALARM' ? 'error' : 'warning'}>
                    {text === 'ALARM' ? '报警' : '预警'}
                </Tag>
            ),
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => handleDelete(record.id as number)} />
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer className={'pt-1'}>
            <ProTable<AlarmLimitType>
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
                    const res = await getAlarmLimitTypePage(params);
                    return {
                        data: res.data?.content || [],
                        success: res.success,
                        total: res.data?.totalElements || 0,
                    };
                }}
                columns={columns}
            />
            <AlarmLimitTypeForm
                visible={formVisible}
                onVisibleChange={setFormVisible}
                isEdit={isEdit}
                currentRecord={currentRecord}
                onSuccess={() => actionRef.current?.reload()}
            />
        </ProPageContainer>
    );
};

export default AlarmLimitTypePage;
