import React, { useState, useRef, useEffect } from 'react';
import { ProTable, ActionType } from "@ant-design/pro-components";
import { ArrowLeftOutlined, DeleteFilled, PlusOutlined } from '@ant-design/icons';
import { Button, message, Space, Typography, Divider, Pagination } from "antd";
import { AddButton, DeleteButton, IconButton } from "@/components/button";
import { useParams, history } from "@umijs/max";
import { ProPageContainer } from "@/components/container";
import GenderIcon from "@/components/icons/GenderIcon";
import ModalConfirm from "@/components/ModalConfirm";
import { wrapperResult } from "@/utils";
import { findUserPage } from "@/apis/user";
import { findRoleById, removeRoleMembers } from "@/apis/role";
import AddMemberDialog from "./AddMemberDialog";

const { Title } = Typography;

const RoleMembers = () => {
    const { roleId: roleIdStr } = useParams<{ roleId: string }>();
    const roleId = parseInt(roleIdStr || '');

    const [params, setParams] = useState<Record<string, any>>({ roleId });
    const [visible, setVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [roleName, setRoleName] = useState('正在加载...');
    const [removing, setRemoving] = useState(false);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [total, setTotal] = useState(0);

    const actionRef = useRef<ActionType>();

    const fetchRoleInfo = async () => {
        try {
            const res = await findRoleById(roleId);
            if (res.success && res.data) {
                setRoleName(res.data.name || '');
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (roleId) {
            fetchRoleInfo();
        }
    }, [roleId]);

    if (!roleId || isNaN(roleId)) {
        history.replace('/404');
        return null;
    }

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '用户姓名',
            dataIndex: 'realName',
            key: 'realName',
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            render: (value: any) => <GenderIcon value={value} />
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            render: (_: any, row: any) => (
                <Space>
                    <IconButton
                        icon={<DeleteFilled />}
                        tooltip={'从角色中移除'}
                        danger
                        onClick={() => {
                            ModalConfirm({
                                title: '移除成员',
                                content: `确定要从角色中移除用户 [${row.realName || row.username}] 吗？`,
                                onOk: () => performRemove([row.id])
                            });
                        }}
                    />
                </Space>
            )
        }
    ];

    const performRemove = async (ids: number[]) => {
        setRemoving(true);
        try {
            const res = await removeRoleMembers(roleId, ids);
            if (res.success) {
                void message.success('移除成员成功');
                setSelectedRowKeys([]);
                actionRef.current?.reload();
            }
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setRemoving(false);
        }
    };

    const handleBatchRemove = () => {
        if (selectedRowKeys.length === 0) {
            void message.error('请选择要移除的成员');
            return;
        }

        ModalConfirm({
            title: '批量移除成员',
            content: `确定要从角色中移除选中的 ${selectedRowKeys.length} 名成员吗？`,
            onOk: () => performRemove(selectedRowKeys as number[])
        });
    }

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <div className={'bg-white mx-4 mt-1 mb-4 min-h-screen relative'}>
                    <div className={'flex justify-between items-center border-b mb-2 pt-4 px-6'}>
                        <Title level={5} style={{ margin: 0, paddingBottom: 8 }}>
                            {`角色成员管理 (Plus) - ${roleName || '加载中...'}`}
                        </Title>
                    </div>
                    <ProTable
                        columns={columns}
                        rowKey={'id'}
                        actionRef={actionRef}
                        params={{ ...params, current, pageSize }}
                        search={false}
                        cardProps={{ variant: 'borderless' } as any}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (keys) => setSelectedRowKeys(keys)
                        }}
                        pagination={false}
                        tableAlertRender={false}
                        tableAlertOptionRender={false}
                        toolbar={{
                            search: {
                                allowClear: true,
                                placeholder: '请输入用户名或姓名搜索...',
                                style: { width: 320 },
                                onSearch: (value) => setParams({ ...params, keyword: value })
                            }
                        }}
                        request={async (p) => {
                            const result = await findUserPage(p);
                            if (result.success && result.data) {
                                setTotal(result.data.totalElements || 0);
                            }
                            return wrapperResult(result);
                        }}
                    />

                    <div className="flex justify-between items-center px-6 pb-4 mt-0">
                        <Space size={8}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => setVisible(true)}
                            >
                                添加成员
                            </Button>
                            <Button
                                danger
                                variant="outlined"
                                disabled={selectedRowKeys.length === 0}
                                loading={removing}
                                icon={<DeleteFilled />}
                                onClick={handleBatchRemove}
                            >
                                批量移除
                            </Button>
                            <Button
                                onClick={() => history.back()}
                            >
                                取消
                            </Button>
                            <Button
                                type="primary"
                                variant="outlined"
                                color="primary"
                                className={'ml-2'}
                                onClick={() => history.push(`/security/role-plus/permissions/${roleId}`)}
                            >
                                权限列表
                            </Button>
                        </Space>
                        <Pagination
                            current={current}
                            pageSize={pageSize}
                            total={total}
                            showTotal={(t) => `共 ${t} 条数据`}
                            onChange={(page, size) => {
                                setCurrent(page);
                                setPageSize(size);
                            }}
                            showSizeChanger
                        />
                    </div>


                </div>
            </ProPageContainer>
            <AddMemberDialog
                roleId={roleId}
                open={visible}
                onOpenChange={setVisible}
                onSuccess={() => actionRef.current?.reload()}
            />
        </>
    );
};

export default RoleMembers;
