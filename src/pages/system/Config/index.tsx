import React, { useEffect, useMemo, useState } from 'react';
import { ProPageContainer } from "@/components/container";
import { Button, Space, Tag } from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import useCrud from "@/hooks/common/useCrud";
import { DeleteButton, EditButton } from "@/components/button";
import { useAccess } from "@@/exports";

import ConfigDetailDialog from "@/pages/system/Config/ConfigDetailDialog";
import { Permission } from "@/components";
import { PERMISSIONS } from "@/config/permissions";
import { SysConfig } from "@/apis/system/config";

const Index = () => {
    const [params, setParams] = useState<Record<string, any>>({});
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<SysConfig[]>([]);

    const {
        getState,
        formRef,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
        fetchPage
    } = useCrud<SysConfig>({
        entityName: '参数配置',
        pathname: '/system/config',
        baseUrl: '/api/system/config'
    });

    const state = getState('/system/config');

    const toDeleteBatch = () => {
        if (deleteDisabled) return;
        if (!selectedRowKeys || selectedRowKeys.length === 0) return;
        void toBatchDelete(selectedRowKeys as (string | number)[], true);
    }

    const columns: ProColumns<SysConfig>[] = [
        {
            title: '参数ID',
            dataIndex: 'id',
            key: 'id',
            hideInSearch: true,
            hideInTable: true
        },
        {
            title: '参数名称',
            dataIndex: 'configName',
            key: 'configName',
            fieldProps: {
                placeholder: '请输入参数名称'
            }
        },
        {
            title: '参数键名',
            dataIndex: 'configKey',
            key: 'configKey',
            fieldProps: {
                placeholder: '请输入参数键名'
            }
        },
        {
            title: '参数键值',
            dataIndex: 'configValue',
            key: 'configValue',
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '系统内置',
            dataIndex: 'configType',
            key: 'configType',
            valueType: 'select',
            valueEnum: {
                'Y': { text: '是', status: 'Processing' },
                'N': { text: '否', status: 'Default' },
            },
            fieldProps: {
                placeholder: '系统内置'
            },
            render: (_, record) => {
                const isSystem = record.configType === 'Y';
                return <Tag color={isSystem ? 'blue' : 'default'}>{isSystem ? '是' : '否'}</Tag>
            }
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            hideInSearch: true,
            ellipsis: true,
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
            render: (_: any, row: SysConfig) => {
                return (
                    <Space>
                        <EditButton onClick={() => toEdit(row)} />
                        <DeleteButton onConfirm={async () => {
                            if (row.id) {
                                await toDelete(row.id, true);
                            }
                        }} />
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
    }, [state.shouldRefresh]);

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
                            setSelectedRows(selectedRows);
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
                                <Permission code={PERMISSIONS.SYSTEM.CONFIG.ADD}>
                                    <Button color={'primary'}
                                        icon={<PlusOutlined />}
                                        variant={'outlined'}
                                        size={'small'}
                                        onClick={toCreate}
                                    >新建</Button>
                                </Permission>

                                <Permission code={PERMISSIONS.SYSTEM.CONFIG.EDIT} mode={'disable'}>
                                    <Button color={"green"}
                                        icon={<EditOutlined />}
                                        disabled={editDisabled}
                                        size={'small'}
                                        variant={'outlined'}
                                        onClick={toEditSelected}
                                    >修改</Button>
                                </Permission>

                                <Permission code={PERMISSIONS.SYSTEM.CONFIG.REMOVE} mode={'disable'}>
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
            <ConfigDetailDialog title={state?.dialogTitle} open={state?.dialogVisible} onOpenChange={setDialogVisible} />
        </>
    )
}

export default Index;
