import { changeRoleStatus } from "@/apis/role";
import { changeUserStatus } from "@/apis";
import { DeleteButton, EditButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import ModalConfirm from "@/components/ModalConfirm";
import useCrud from "@/hooks/common/useCrud";
import { useDict } from "@/hooks/common/useDict";
import RoleDetailDrawer from "@/pages/security/Role/RoleDetailDrawer";
import { useAccess } from "@@/exports";
import {
    DeleteOutlined,
    EditOutlined,
    ExportOutlined,
    PlusOutlined
} from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, message, Space, Switch } from "antd";
import React, { useEffect, useMemo, useState } from 'react';

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
        setDialogVisible,
        setShouldRefresh,
        fetchPage
    } = useCrud<SysRole>({
        entityName: '角色',
        pathname: '/system/role',
        baseUrl: '/api/system/role'
    });

    const { hasPermission, hasSuperAdmin } = useAccess();
    const dictMap = useDict('sys_normal_disable');
    const state = getState('/system/role');

    const onStatusChange = (record: any) => {
        const action = record.status === '0' ? '禁用' : '启用';
        ModalConfirm({
            title: '启用/禁用',
            content: `您确定要${action}角色[${record.name}]么？`,
            onOk() {
                const status = record.status === '0' ? '1' : '0';
                changeRoleStatus(record.id, status)
                    .then(res => {
                        void message.success(res.message || `${action}角色[${record.name}]成功`);
                        actionRef.current?.reload();
                    })
                    .catch(err => {
                        void message.error(err.message || `${action}角色[${record.name}]失败`);
                    });
            }
        });
    }

    const columns: ProColumns[] = [
        {
            title: '角色编号',
            dataIndex: 'id',
            key: 'id',
            hideInSearch: true
        },
        {
            title: '角色名称',
            dataIndex: 'name',
            key: 'name',
            fieldProps: {
                placeholder: '请输入角色名称'
            }
        },
        {
            title: '权限字符',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: '显示顺序',
            dataIndex: 'roleSort',
            key: 'roleSort',
            hideInSearch: true
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            valueType: 'select',
            fieldProps: {
                placeholder: '请选择状态',
                options: dictMap.sys_normal_disable
            },
            render: (_, record) => {
                const value = record.status === '0';
                return <Switch size={'small'} value={value} onChange={() => onStatusChange(record)} />
            }
        },
        {
            title: '创建时间',
            dataIndex: 'createTimeRange',
            key: 'createTimeRange',
            valueType: 'dateRange',
            hideInTable: true
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            hideInSearch: true
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            hideInSearch: true,
            render: (_: any, record: any) => {
                return (
                    <Space>
                        {hasSuperAdmin &&
                            <EditButton onClick={() => toEdit(record)} />
                        }
                        {hasSuperAdmin &&
                            <DeleteButton onConfirm={async () => {
                                await toDelete(record.id, true);
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
        void toBatchDelete(selectedRowKeys as (string | number)[], true);
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
            setShouldRefresh(false); // 重置标志位
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
                        collapseRender: false, // 完全移除折叠按钮
                        defaultCollapsed: false // 默认不折叠
                    }}
                    loading={{ spinning: state.loading, tip }}
                    toolbar={{
                        title:
                            <Space>
                                {
                                    hasSuperAdmin &&
                                    <Button color={'primary'}
                                        icon={<PlusOutlined />}
                                        variant={'outlined'}
                                        size={'small'}
                                        onClick={toCreate}
                                    >新建</Button>
                                }
                                {
                                    hasSuperAdmin &&
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
                                    hasSuperAdmin &&
                                    <Button color={"danger"}
                                        icon={<DeleteOutlined />}
                                        disabled={deleteDisabled}
                                        size={'small'}
                                        variant={'outlined'}
                                        onClick={toDeleteBatch}
                                    >删除</Button>
                                }
                                {
                                    hasPermission('system:role:export') &&
                                    <Button color={"orange"}
                                        icon={<ExportOutlined />}
                                        size={'small'}
                                        variant={'outlined'}
                                    // onClick={toExportUser}
                                    >导出</Button>
                                }

                            </Space>
                    }}
                    request={
                        async (params = {}) => {
                            const { createTimeRange, ...rest } = params;
                            if (createTimeRange) {
                                const [beginTime, endTime] = createTimeRange;
                                params = { ...rest, params: { beginTime, endTime } };
                            }
                            const result = await fetchPage(params);
                            console.log("result: ", result);
                            return result;
                        }
                    }
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 20,
                    }}
                />
            </ProPageContainer>
            <RoleDetailDrawer title={state?.dialogTitle} open={state?.dialogVisible} onOpenChange={setDialogVisible} />
        </>
    )
}

export default Index;
