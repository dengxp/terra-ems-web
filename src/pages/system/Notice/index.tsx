import { DeleteButton, EditButton, IconButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import {
    DeleteOutlined,
    EditOutlined, EyeFilled, PlusOutlined
} from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, Space, Tag } from "antd";
import React, { useEffect, useMemo, useState } from 'react';

import { SysNotice } from "@/apis/system/notice";
import { Permission } from "@/components";
import { PERMISSIONS } from "@/config/permissions";
import { DataItemStatus, OperationEnum } from "@/enums";
import NoticeDetailDialog from "@/pages/system/Notice/NoticeDetailDialog";

const Index = () => {
    const [params] = useState<Record<string, any>>({});
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<SysNotice[]>([]);

    const {
        getState,
        updateState,
        formRef,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
        fetchPage
    } = useCrud<SysNotice>({
        entityName: '通知公告',
        pathname: '/system/notice',
        baseUrl: '/api/system/notice'
    });

    const state = getState('/system/notice');

    const toDeleteBatch = () => {
        if (deleteDisabled) return;
        if (!selectedRowKeys || selectedRowKeys.length === 0) return;
        void toBatchDelete(selectedRowKeys as (string | number)[], true);
    }

    const toView = (row: SysNotice) => {
        updateState('/system/notice', {
            operation: OperationEnum.DETAIL,
            dialogVisible: true,
            editData: { ...row }
        });
    }

    const columns: ProColumns<SysNotice>[] = [
        {
            title: '公告ID',
            dataIndex: 'id',
            key: 'id',
            hideInSearch: true,
            hideInTable: true
        },
        {
            title: '公告标题',
            dataIndex: 'noticeTitle',
            key: 'noticeTitle',
            fieldProps: {
                placeholder: '请输入公告标题'
            }
        },
        {
            title: '公告类型',
            dataIndex: 'noticeType',
            key: 'noticeType',
            valueType: 'select',
            valueEnum: {
                '1': { text: '通知', status: 'Processing' },
                '2': { text: '公告', status: 'Warning' },
            },
            fieldProps: {
                placeholder: '请选择公告类型'
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            valueType: 'select',
            valueEnum: {
                [DataItemStatus.ENABLE]: { text: '正常', status: 'Success' },
                [DataItemStatus.DISABLE]: { text: '停用', status: 'Error' },
            },
            fieldProps: {
                placeholder: '请选择状态'
            },
            render: (_, record) => {
                const status = record.status === DataItemStatus.ENABLE;
                return <Tag color={status ? 'success' : 'error'}>{status ? '正常' : '停用'}</Tag>
            }
        },
        {
            title: '创建者',
            dataIndex: 'createBy',
            key: 'createBy',
            hideInSearch: true
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            valueType: 'dateTime',
            hideInSearch: true
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            hideInSearch: true,
            render: (_: any, row: SysNotice) => {
                return (
                    <Space>
                        <IconButton
                            key="view"
                            title="查看"
                            icon={<EyeFilled />}
                            onClick={() => toView(row)}
                        />
                        <Permission code={PERMISSIONS.SYSTEM.NOTICE.EDIT}>
                            <EditButton onClick={() => toEdit(row)} />
                        </Permission>
                        <Permission code={PERMISSIONS.SYSTEM.NOTICE.REMOVE}>
                            <DeleteButton onConfirm={async () => {
                                if (row.id) {
                                    await toDelete(row.id, true);
                                }
                            }} />
                        </Permission>
                    </Space>
                )
            }
        }
    ];

    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        toEdit(selectedRows[0]);
    }

    const editDisabled = useMemo(() => {
        return (!selectedRowKeys || selectedRowKeys.length !== 1);
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return (!selectedRowKeys || selectedRowKeys.length === 0);
    }, [selectedRowKeys]);

    useEffect(() => {
        if (state.shouldRefresh) {
            setSelectedRowKeys([]);
            setSelectedRows([]);
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state.shouldRefresh, actionRef, setShouldRefresh]);

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable columns={columns}
                    rowKey={'id'}
                    formRef={formRef}
                    actionRef={actionRef}
                    params={params}
                    tableAlertRender={false}
                    tableAlertOptionRender={false}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (selectedRowKeys, selectedRows) => {
                            setSelectedRowKeys(selectedRowKeys);
                            setSelectedRows(selectedRows as SysNotice[]);
                        }
                    }}
                    form={{ span: 6 }}
                    cardProps={{ variant: 'borderless' } as any}
                    search={{
                        collapseRender: false,
                        defaultCollapsed: false
                    }}
                    loading={{ spinning: state.loading }}
                    toolbar={{
                        title:
                            <Space>
                                <Permission code={PERMISSIONS.SYSTEM.NOTICE.ADD}>
                                    <Button color={'primary'}
                                        icon={<PlusOutlined />}
                                        variant={'outlined'}
                                        size={'small'}
                                        onClick={() => toCreate()}
                                    >新建</Button>
                                </Permission>

                                <Permission code={PERMISSIONS.SYSTEM.NOTICE.EDIT} mode={'disable'}>
                                    <Button color={"green"}
                                        icon={<EditOutlined />}
                                        disabled={editDisabled}
                                        size={'small'}
                                        variant={'outlined'}
                                        onClick={toEditSelected}
                                    >修改</Button>
                                </Permission>

                                <Permission code={PERMISSIONS.SYSTEM.NOTICE.REMOVE} mode={'disable'}>
                                    <Button color={"danger"}
                                        icon={<DeleteOutlined />}
                                        disabled={deleteDisabled}
                                        size={'small'}
                                        variant={'outlined'}
                                        onClick={toDeleteBatch}
                                    >删除</Button>
                                </Permission>
                            </Space>
                    }}
                    request={fetchPage}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 20,
                    }}
                />
            </ProPageContainer>
            <NoticeDetailDialog open={state?.dialogVisible} onOpenChange={setDialogVisible} />
        </>
    )
}

export default Index;
