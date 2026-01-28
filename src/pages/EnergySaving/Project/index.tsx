import React, { useState, useMemo } from 'react';
import { ProPageContainer } from '@/components/container';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, Space, Tag, Progress } from 'antd';
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
import useCrud from '@/hooks/common/useCrud';
import dayjs from 'dayjs';

const EnergySavingProjectPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<EnergySavingProject[]>([]);

    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toBatchDelete,
        setDialogVisible,
    } = useCrud<EnergySavingProject>({
        pathname: '/energy-saving/project',
        entityName: '节能项目',
        baseUrl: '/api/energy-saving-projects',
    });

    const state = getState('/energy-saving/project');

    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        toEdit(selectedRows[0]);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteProject(id);
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
                    <EditButton onClick={() => toEdit(record)} />
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
                    const res = await getProjectPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        name: params.name,
                        status: params.status,
                    });
                    return {
                        data: res.data?.content || [],
                        success: res.success,
                        total: res.data?.totalElement || 0,
                    };
                }}
                columns={columns}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    defaultPageSize: 20,
                }}
            />
            <ProjectForm
                visible={state?.dialogVisible || false}
                onVisibleChange={(v) => setDialogVisible(v)}
                isEdit={!!state?.editData}
                currentRecord={state?.operation === 'edit' ? (state?.editData as EnergySavingProject | undefined) : undefined}
                onSuccess={() => {
                    setDialogVisible(false);
                    actionRef.current?.reload();
                }}
            />
        </ProPageContainer>
    );
};

export default EnergySavingProjectPage;
