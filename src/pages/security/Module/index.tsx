import { batchDeleteModules, findModulePage } from "@/apis/module";
import { DeleteButton, EditButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import { useAccess } from "@@/exports";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined
} from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, Space } from "antd";
import React, { useEffect, useMemo, useState } from 'react';
import ModuleDetailDialog from "./ModuleDetailDialog";

const Index = () => {
    const [params] = useState<Record<string, any>>({});
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [tip] = useState('正在处理中，请稍等...');

    const {
        getState,
        formRef,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        fetchPage,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<SysModule>({
        entityName: '模块',
        pathname: '/security/module',
        baseUrl: '/api/system/module'
    });

    const { hasPermission } = useAccess();
    const state = getState('/security/module');

    const columns: ProColumns<SysModule>[] = [
        {
            title: '模块ID',
            dataIndex: 'id',
            key: 'id',
            hideInSearch: true,
            hideInTable: true,
            width: 80,
        },
        {
            title: '模块名称',
            dataIndex: 'name',
            key: 'name',
            fieldProps: {
                placeholder: '请输入模块名称'
            }
        },
        {
            title: '模块代码',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '显示顺序',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
            hideInSearch: true,
            width: 100,
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            valueType: 'dateTime',
            hideInSearch: true,
            width: 160,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            hideInSearch: true,
            width: 120,
            render: (_: any, record: SysModule) => {
                return (
                    <Space>
                        {hasPermission('system:module:edit') &&
                            <EditButton onClick={() => toEdit(record)} />
                        }
                        {hasPermission('system:module:remove') &&
                            <DeleteButton onConfirm={async () => {
                                await toDelete(record.id!, true);
                            }} />
                        }
                    </Space>
                );
            }
        }
    ];

    const toDeleteBatch = () => {
        if (deleteDisabled) return;
        if (!selectedRowKeys || selectedRowKeys.length === 0) return;
        // batchDeleteModules expects number[]
        void toBatchDelete(selectedRowKeys as number[], true);
    }

    const editDisabled = useMemo(() => {
        return (!selectedRowKeys || selectedRowKeys.length !== 1);
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return (!selectedRowKeys || selectedRowKeys.length === 0);
    }, [selectedRowKeys]);

    useEffect(() => {
        if (state.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state.shouldRefresh]);

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable<SysModule> columns={columns}
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
                    loading={{ spinning: state.loading, tip }}
                    toolbar={{
                        title:
                            <Space>
                                {
                                    hasPermission('system:module:add') &&
                                    <Button color={'primary'}
                                        icon={<PlusOutlined />}
                                        variant={'outlined'}
                                        size={'small'}
                                        onClick={toCreate}
                                    >新建</Button>
                                }
                                {
                                    hasPermission('system:module:edit') &&
                                    <Button color={"green"}
                                        icon={<EditOutlined />}
                                        disabled={editDisabled}
                                        size={'small'}
                                        variant={'outlined'}
                                        onClick={() => {
                                            if (selectedRows && selectedRows.length === 1) {
                                                toEdit(selectedRows[0]);
                                            }
                                        }}
                                    >修改</Button>
                                }
                                {
                                    hasPermission('system:module:remove') &&
                                    <Button color={"danger"}
                                        icon={<DeleteOutlined />}
                                        disabled={deleteDisabled}
                                        size={'small'}
                                        variant={'outlined'}
                                        onClick={toDeleteBatch}
                                    >删除</Button>
                                }
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
            <ModuleDetailDialog
                open={state?.dialogVisible}
                onOpenChange={setDialogVisible}
            />
        </>
    )
}

export default Index;
