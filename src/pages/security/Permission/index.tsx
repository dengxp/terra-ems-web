/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import { findPermissionPage, syncPermissions } from "@/apis/permission";
import { findModuleOptions } from "@/apis/module";
import { DeleteButton, EditButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import { useAccess } from "@@/exports";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    SyncOutlined
} from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, message, Space, Tag } from "antd";
import React, { useEffect, useMemo, useState } from 'react';
import PermissionDetailDialog from "./PermissionDetailDialog";

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
    } = useCrud<SysPermission>({
        entityName: '权限',
        pathname: '/security/permission',
        baseUrl: '/api/system/permission'
    });

    const { hasPermission } = useAccess();
    const state = getState('/security/permission');

    const handleSync = async () => {
        try {
            const hide = message.loading('正在同步权限...', 0);
            await syncPermissions();
            hide();
            message.success('权限同步成功');
            actionRef.current?.reload();
        } catch (error) {
            // Error handled globally
        }
    };

    const columns: ProColumns<SysPermission>[] = [
        {
            title: '权限ID',
            dataIndex: 'id',
            key: 'id',
            hideInSearch: true,
            hideInTable: true,
            width: 80,
        },
        {
            title: '所属模块',
            dataIndex: 'moduleId',
            key: 'moduleId',
            width: 200,
            valueType: 'select',
            request: async () => {
                const res = await findModuleOptions();
                return res.data || [];
            },
            render: (_, record) => record.module?.name || '-'
        },
        {
            title: '权限名称',
            dataIndex: 'name',
            key: 'name',
            width: 100,
            fieldProps: {
                placeholder: '请输入权限名称'
            }
        },
        {
            title: '权限代码',
            dataIndex: 'code',
            key: 'code',
            copyable: true,
            width: 160,
        },
        {
            title: '超级权限',
            dataIndex: 'superPermission',
            key: 'superPermission',
            width: 100,
            hideInSearch: true,
            render: (dom, record) => {
                return record.superPermission ? <Tag color="red">是</Tag> : <Tag color="default">否</Tag>;
            }
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            hideInSearch: true,
            width: 120,
            ellipsis: true,
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            valueType: 'dateTime',
            hideInSearch: true,
            width: 180,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            hideInSearch: true,
            width: 120,
            render: (_: any, record: SysPermission) => {
                return (
                    <Space>
                        {hasPermission('system:permission:edit') &&
                            <EditButton onClick={() => toEdit(record)} />
                        }
                        {hasPermission('system:permission:remove') &&
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
                <ProTable<SysPermission> columns={columns}
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
                                    hasPermission('system:permission:add') &&
                                    <Button color={'primary'}
                                        icon={<PlusOutlined />}
                                        variant={'outlined'}
                                        size={'small'}
                                        onClick={toCreate}
                                    >新建</Button>
                                }
                                {
                                    hasPermission('system:permission:sync') &&
                                    <Button color={"default"}
                                        icon={<SyncOutlined />}
                                        size={'small'}
                                        variant={'outlined'}
                                        onClick={handleSync}
                                    >同步权限</Button>
                                }
                                {
                                    hasPermission('system:permission:edit') &&
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
                                    hasPermission('system:permission:remove') &&
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
            <PermissionDetailDialog
                open={state?.dialogVisible}
                onOpenChange={setDialogVisible}
            />
        </>
    )
}

export default Index;
