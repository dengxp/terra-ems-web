import React, { useRef, useState, useMemo } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    Benchmark,
    BenchmarkType,
    BenchmarkTypeOptions,
    getBenchmarkPage,
    deleteBenchmark,
} from '@/apis/benchmark';
import BenchmarkForm from './components/BenchmarkForm';
import { EditButton, DeleteButton } from '@/components/button';
import ModalConfirm from '@/components/ModalConfirm';

const BenchmarkPage: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Benchmark[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Benchmark>();

    const handleAdd = () => {
        setIsEdit(false);
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: Benchmark) => {
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
            await deleteBenchmark(id);
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
            title: '删除对标值',
            content: '对标值删除后将无法恢复，请确认是否删除？',
            onOk: async () => {
                try {
                    for (const id of selectedRowKeys) {
                        await deleteBenchmark(id as number);
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

    const getTypeTag = (type: BenchmarkType) => {
        const option = BenchmarkTypeOptions.find((o) => o.value === type);
        return <Tag color={option?.color}>{option?.label || type}</Tag>;
    };

    const columns: ProColumns<Benchmark>[] = [
        {
            title: '标杆编码',
            dataIndex: 'code',
            width: 140,
        },
        {
            title: '标杆名称',
            dataIndex: 'name',
            ellipsis: true,
            width: 200,
        },
        {
            title: '标杆类型',
            dataIndex: 'type',
            width: 100,
            valueType: 'select',
            fieldProps: {
                options: BenchmarkTypeOptions,
            },
            render: (_, record) => getTypeTag(record.type),
        },
        {
            title: '标杆等级',
            dataIndex: 'grade',
            width: 90,
            hideInSearch: true,
        },
        {
            title: '标杆值',
            dataIndex: 'value',
            width: 100,
            hideInSearch: true,
            render: (val, record) => val ? `${val} ${record.unit || ''}` : '-',
        },
        {
            title: '国标编号',
            dataIndex: 'nationalNum',
            width: 130,
            hideInSearch: true,
            ellipsis: true,
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
            <ProTable<Benchmark>
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
                    const res = await getBenchmarkPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        type: params.type,
                    });
                    return {
                        data: res.data?.content || [],
                        success: res.success,
                        total: res.data?.totalElements || 0,
                    };
                }}
                columns={columns}
            />
            <BenchmarkForm
                visible={formVisible}
                onVisibleChange={setFormVisible}
                isEdit={isEdit}
                currentRecord={currentRecord}
                onSuccess={() => actionRef.current?.reload()}
            />
        </ProPageContainer>
    );
};

export default BenchmarkPage;
