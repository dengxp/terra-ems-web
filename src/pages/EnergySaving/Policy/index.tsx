import React, { useRef, useState, useMemo } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag, Typography } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import {
    Policy,
    PolicyType,
    PolicyTypeOptions,
    getPolicyPage,
    deletePolicy,
} from '@/apis/policy';
import PolicyForm from './components/PolicyForm';
import { EditButton, DeleteButton } from '@/components/button';
import ModalConfirm from '@/components/ModalConfirm';
import dayjs from 'dayjs';

const { Link } = Typography;

const PolicyPage: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Policy[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<Policy>();

    const handleAdd = () => {
        setIsEdit(false);
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: Policy) => {
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
            await deletePolicy(id);
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
            title: '删除政策法规',
            content: '政策法规删除后将无法恢复，请确认是否删除？',
            onOk: async () => {
                try {
                    for (const id of selectedRowKeys) {
                        await deletePolicy(id as number);
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

    const getTypeTag = (type: PolicyType) => {
        const option = PolicyTypeOptions.find((o) => o.value === type);
        return <Tag color={option?.color}>{option?.label || type}</Tag>;
    };

    const columns: ProColumns<Policy>[] = [
        {
            title: '政策标题',
            dataIndex: 'title',
            ellipsis: true,
            width: 280,
        },
        {
            title: '政策类型',
            dataIndex: 'type',
            width: 100,
            valueType: 'select',
            fieldProps: {
                options: PolicyTypeOptions,
            },
            render: (_, record) => getTypeTag(record.type),
        },
        {
            title: '印发部门',
            dataIndex: 'department',
            width: 160,
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '印发时间',
            dataIndex: 'issuingDate',
            width: 110,
            hideInSearch: true,
            render: (val) => (val ? dayjs(val as string).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '文件链接',
            dataIndex: 'fileUrl',
            width: 80,
            hideInSearch: true,
            render: (val) =>
                val ? (
                    <Link href={val as string} target="_blank">
                        <LinkOutlined /> 查看
                    </Link>
                ) : (
                    '-'
                ),
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
            <ProTable<Policy>
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
                    const res = await getPolicyPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        title: params.title,
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
            <PolicyForm
                visible={formVisible}
                onVisibleChange={setFormVisible}
                isEdit={isEdit}
                currentRecord={currentRecord}
                onSuccess={() => actionRef.current?.reload()}
            />
        </ProPageContainer>
    );
};

export default PolicyPage;
