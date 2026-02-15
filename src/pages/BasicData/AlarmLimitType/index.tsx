import { AlarmLimitType } from '@/apis/alarm';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import useCrud from '@/hooks/common/useCrud';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import AlarmLimitTypeForm from './components/AlarmLimitTypeForm';

const AlarmLimitTypePage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<AlarmLimitType[]>([]);

    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
        fetchPage
    } = useCrud<AlarmLimitType>({
        pathname: '/basic-data/alarm-limit-type',
        entityName: '报警限值类型',
        baseUrl: '/api/alarm/limit-types',
    });

    const state = getState('/basic-data/alarm-limit-type');

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

    const handleDelete = async (id: number) => {
        try {
            await toDelete(id, true);
            actionRef.current?.reload();
        } catch (error) {
            // 错误由全局处理
        }
    };

    const handleBatchDelete = async () => {
        if (deleteDisabled) return;
        try {
            await toBatchDelete(selectedRowKeys as number[], true);
            setSelectedRowKeys([]);
            setSelectedRows([]);
            actionRef.current?.reload();
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
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onConfirm={() => handleDelete(record.id as number)} />
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
                    onChange: (keys, rows: AlarmLimitType[]) => {
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
                request={fetchPage}
                columns={columns}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    defaultPageSize: 20,
                }}
            />
            <AlarmLimitTypeForm
                visible={state?.dialogVisible || false}
                onVisibleChange={(v: boolean) => setDialogVisible(v)}
                onSuccess={() => {
                    setDialogVisible(false);
                    actionRef.current?.reload();
                }}
            />
        </ProPageContainer>
    );
};

export default AlarmLimitTypePage;
