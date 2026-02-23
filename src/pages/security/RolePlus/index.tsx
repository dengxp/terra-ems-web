import { AddButton, DeleteButton, EditButton, IconButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import RoleDetailDrawer from "./RoleDetailDrawer";
import { MoreOutlined, TeamOutlined, KeyOutlined } from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, Dropdown, Space, Typography, Tooltip } from "antd";
import React, { useEffect, useState } from 'react';
import { history, useAccess } from "@umijs/max";

const { Title } = Typography;

const Index = () => {
    const [params, setParams] = useState<Record<string, any>>({});

    const {
        getState,
        actionRef,
        fetchPage,
        toCreate,
        toEdit,
        toDelete,
        setDialogVisible,
        setShouldRefresh
    } = useCrud<SysRole>({
        pathname: '/security/role-plus',
        entityName: '角色',
        baseUrl: '/api/system/role'
    });

    const state = getState('/security/role-plus');
    const { hasSuperAdmin } = useAccess();

    const columns: ProColumns[] = [
        {
            title: '角色名称',
            dataIndex: 'name',
            key: 'name',
            copyable: true,
        },
        {
            title: '角色代码',
            dataIndex: 'code',
            key: 'code',
            copyable: true,
        },
        {
            title: '成员管理',
            key: 'members',
            hideInSearch: true,
            render: (_, row) => (
                <Button
                    type="link"
                    icon={<TeamOutlined />}
                    onClick={() => history.push(`/security/role-plus/members/${row.id}`)}
                >
                    成员管理
                </Button>
            )
        },
        {
            title: '权限配置',
            key: 'permissions',
            hideInSearch: true,
            render: (_, row) => (
                <Button
                    type="link"
                    icon={<KeyOutlined />}
                    onClick={() => history.push(`/security/role-plus/permissions/${row.id}`)}
                >
                    配置权限
                </Button>
            )
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            ellipsis: true,
        },
        {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 120,
            render: (_: any, row: any) => (
                <Space>
                    {hasSuperAdmin && <EditButton onClick={() => toEdit(row)} />}
                    {hasSuperAdmin && <DeleteButton onConfirm={() => toDelete(row.id, true)} />}
                </Space>
            )
        }
    ];

    useEffect(() => {
        if (state.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state.shouldRefresh]);

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable columns={columns}
                    rowKey={'id'}
                    actionRef={actionRef}
                    params={params}
                    search={false}
                    cardProps={{ variant: 'borderless' } as any}
                    toolbar={{
                        title: hasSuperAdmin ? (
                            <AddButton
                                onClick={toCreate}
                            >新建角色</AddButton>
                        ) : undefined,
                        search: {
                            allowClear: true,
                            placeholder: '输入角色名称或代码搜索...',
                            style: { width: 320 },
                            onSearch: (value: string) => {
                                setParams({ ...params, keyword: value })
                            }
                        }
                    }}
                    request={async (params) => {
                        const result = await fetchPage(params);
                        return result;
                    }}
                />
            </ProPageContainer>
            <RoleDetailDrawer
                open={state.dialogVisible || false}
                onOpenChange={setDialogVisible}
            />
        </>
    );
}

export default Index;
