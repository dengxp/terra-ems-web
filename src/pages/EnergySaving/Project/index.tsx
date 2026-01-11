import React, { useRef, useState, useMemo } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { Button, message, Space, Tag, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import {
    EnergySavingProject,
    ProjectStatus,
    ProjectStatusOptions,
    getProjectPage,
    deleteProject,
} from '@/apis/energySavingProject';
import ProjectForm from './components/ProjectForm';
import { EditButton, DeleteButton } from '@/components/button';
import ModalConfirm from '@/components/ModalConfirm';
import dayjs from 'dayjs';

const EnergySavingProjectPage: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<EnergySavingProject[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<EnergySavingProject>();

    const handleAdd = () => {
        setIsEdit(false);
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: EnergySavingProject) => {
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
            await deleteProject(id);
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
            title: '删除节能项目',
            content: '节能项目删除后将无法恢复，请确认是否删除？',
            onOk: async () => {
                try {
                    for (const id of selectedRowKeys) {
                        await deleteProject(id as number);
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

    const getStatusTag = (status: ProjectStatus) => {
        const option = ProjectStatusOptions.find((o) => o.value === status);
        return <Tag color={option?.color}>{option?.label || status}</Tag>;
    };

    const columns: ProColumns<EnergySavingProject>[] = [
        {
            title: '项目名称',
            dataIndex: 'name',
            ellipsis: true,
            width: 180,
        },
        {
            title: '项目负责人',
            dataIndex: 'liablePerson',
            width: 100,
            hideInSearch: true,
        },
        {
            title: '项目状态',
            dataIndex: 'status',
            width: 100,
            valueType: 'select',
            fieldProps: {
                options: ProjectStatusOptions,
            },
            render: (_, record) => getStatusTag(record.status),
        },
        {
            title: '节约量',
            dataIndex: 'savingAmount',
            width: 120,
            hideInSearch: true,
            render: (val) => (val ? `${Number(val).toLocaleString()} 元` : '-'),
        },
        {
            title: '计划完成时间',
            dataIndex: 'completionTime',
            width: 120,
            hideInSearch: true,
            render: (val) => (val ? dayjs(val as string).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '当前工作',
            dataIndex: 'currentWork',
            ellipsis: true,
            hideInSearch: true,
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
            <ProTable<EnergySavingProject>
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
                    const res = await getProjectPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        status: params.status,
                    });
                    return {
                        data: res.data?.content || [],
                        success: res.success,
                        total: res.data?.totalElements || 0,
                    };
                }}
                columns={columns}
            />
            <ProjectForm
                visible={formVisible}
                onVisibleChange={setFormVisible}
                isEdit={isEdit}
                currentRecord={currentRecord}
                onSuccess={() => actionRef.current?.reload()}
            />
        </ProPageContainer>
    );
};

export default EnergySavingProjectPage;
