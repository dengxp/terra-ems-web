import {
    EnergySavingProject, getProjectPage, ProjectStatus,
    projectStatusOptions
} from '@/apis/energySavingProject';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import { Permission } from '@/components';
import { PERMISSIONS } from '@/config/permissions';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';
import ProjectForm from './components/ProjectForm';

const EnergySavingProjectPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<EnergySavingProject[]>([]);

    const {
        getState,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<EnergySavingProject>({
        pathname: '/energy-saving/project',
        entityName: '节能项目',
        baseUrl: '/api/ems/saving-projects',
    });

    const state = getState('/energy-saving/project');

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
        const option = projectStatusOptions.find((o) => o.value === status);
        return <Tag color={option?.color}>{option?.label || status}</Tag>;
    };

    const columns: ProColumns<EnergySavingProject>[] = [
        {
            title: '关键词',
            dataIndex: 'keyword',
            hideInTable: true,
            fieldProps: {
                placeholder: '名称/负责人/备注',
            },
        },
        {
            title: '项目名称',
            dataIndex: 'name',
            ellipsis: true,
            width: 180,
            hideInSearch: true,
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
                options: projectStatusOptions,
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
                    <Permission code={PERMISSIONS.EMS.ENERGY_SAVING_PROJECT.EDIT}>
                        <EditButton onClick={() => toEdit(record)} />
                    </Permission>
                    <Permission code={PERMISSIONS.EMS.ENERGY_SAVING_PROJECT.REMOVE}>
                        <DeleteButton onConfirm={() => toDelete(record.id as number, true)} />
                    </Permission>
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
                            <Permission code={PERMISSIONS.EMS.ENERGY_SAVING_PROJECT.EDIT}>
                                <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                            </Permission>
                            <Permission code={PERMISSIONS.EMS.ENERGY_SAVING_PROJECT.EDIT} mode={'disable'}>
                                <Button color={'green'} icon={<EditOutlined />} disabled={editDisabled} size={'small'} variant={'outlined'} onClick={toEditSelected}>修改</Button>
                            </Permission>
                            <Permission code={PERMISSIONS.EMS.ENERGY_SAVING_PROJECT.REMOVE} mode={'disable'}>
                                <Button color={'danger'} icon={<DeleteOutlined />} disabled={deleteDisabled} size={'small'} variant={'outlined'} onClick={handleBatchDelete}>删除</Button>
                            </Permission>
                        </Space>
                    ),
                }}
                request={async (params) => {
                    const res = await getProjectPage({
                        current: params.current,
                        pageSize: params.pageSize,
                        keyword: params.keyword,
                        status: params.status,
                    });
                    return wrapperResult(res);
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
                onSuccess={() => {
                    setDialogVisible(false);
                    actionRef.current?.reload();
                }}
            />
        </ProPageContainer>
    );
};

export default EnergySavingProjectPage;
