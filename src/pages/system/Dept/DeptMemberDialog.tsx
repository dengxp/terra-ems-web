import { findMembers, removeMember, removeMembers } from "@/apis/dept";
import { DeleteButton, IconButton } from "@/components/button";
import { ProModalForm } from "@/components/container";
import GenderIcon from "@/components/icons/GenderIcon";
import StatusIcon from "@/components/icons/StatusIcon";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, message, Modal } from "antd";
import React, { useRef, useState } from 'react';
import DeptMemberSelector from "./DeptMemberSelector";

type Props = {
    open: boolean;
    onOpenChange: (visible: boolean) => void;
    departmentId?: number;
    departmentName?: string;
    onRefresh?: () => void;
};

const DeptMemberDialog: React.FC<Props> = (props) => {
    const actionRef = useRef<ActionType>();
    const [selectorVisible, setSelectorVisible] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const toGenderValue = (gender?: string | number) => {
        if (typeof gender === 'number') return gender;
        if (gender === 'MAN' || gender === 'MALE') return 0;
        if (gender === 'WOMAN' || gender === 'FEMALE') return 1;
        return 2;
    }

    const columns: ProColumns<any>[] = [
        {
            title: '用户名',
            dataIndex: 'username',
            width: 120,
        },
        {
            title: '姓名',
            dataIndex: 'realName',
            width: 120,
        },
        {
            title: '性别',
            dataIndex: 'gender',
            width: 80,
            hideInSearch: true,
            render: (_, record) => <GenderIcon value={toGenderValue(record.gender)} />
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            width: 120,
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            valueEnum: {
                ENABLE: { text: '正常', status: 'Success' },
                DISABLE: { text: '禁用', status: 'Error' },
            },
            render: (_: any, record: any) => <StatusIcon value={record.status} />
        },
        {
            title: '操作',
            valueType: 'option',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <DeleteButton
                    tooltip="移出部门"
                    onConfirm={async () => {
                        if (!props.departmentId) return;
                        try {
                            await removeMember(props.departmentId, record.id);
                            message.success('移除成功');
                            actionRef.current?.reload();
                            props.onRefresh?.();
                        } catch (error) {
                            console.error(error);
                        }
                    }}
                />
            ),
        },
    ];

    const handleBatchRemove = async () => {
        if (!selectedRowKeys || selectedRowKeys.length === 0) {
            message.error('请选择要移出的成员');
            return;
        }
        if (!props.departmentId) return;

        Modal.confirm({
            title: '批量移出',
            content: `确定要将选中的 ${selectedRowKeys.length} 位成员移出部门吗？`,
            onOk: async () => {
                try {
                    await removeMembers(props.departmentId!, selectedRowKeys as number[]);
                    message.success('移出成功');
                    setSelectedRowKeys([]);
                    actionRef.current?.reload();
                    props.onRefresh?.();
                } catch (error) {
                    console.error(error);
                }
            }
        });
    }

    return (
        <>
            <ProModalForm
                title={`成员管理 - ${props.departmentName || ''}`}
                open={props.open}
                onOpenChange={props.onOpenChange}
                width={900}
                submitter={false}
                layout="horizontal"
            >
                <ProTable
                    rowKey="id"
                    actionRef={actionRef}
                    search={{
                        labelWidth: 60,
                    }}
                    toolbar={{
                        title: [
                            <Button
                                key="add"
                                color="primary"
                                variant="outlined"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={() => setSelectorVisible(true)}
                            >
                                添加成员
                            </Button>,
                            <Button
                                key="batch-remove"
                                color="danger"
                                variant="outlined"
                                size="small"
                                icon={<DeleteOutlined />}
                                disabled={selectedRowKeys.length === 0}
                                onClick={handleBatchRemove}
                                style={{ marginLeft: 8 }}
                            >
                                批量移除
                            </Button>
                        ]
                    }}
                    request={async (params) => {
                        if (!props.departmentId) return { data: [], success: true };

                        // 适配 ProTable 参数到 API
                        const queryParams = {
                            pageNumber: (params.current || 1) - 1,
                            pageSize: params.pageSize,
                            ...params,
                        };

                        // 处理状态枚举转换 (String -> Integer)
                        if ((params as any).status === 'ENABLE') {
                            queryParams.status = 0;
                        } else if ((params as any).status === 'DISABLE') {
                            queryParams.status = 1;
                        }

                        delete queryParams.current;

                        const result = await findMembers(props.departmentId, queryParams);
                        return {
                            data: result.data?.content || [],
                            total: result.data?.totalElements || 0,
                            success: result.success,
                        };
                    }}
                    columns={columns}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys) => setSelectedRowKeys(keys),
                    }}
                    tableAlertRender={false}
                    tableAlertOptionRender={false}
                    cardProps={{ bodyStyle: { padding: 0 } }}
                    scroll={{ x: 'max-content', y: 400 }}
                />
            </ProModalForm>
            <DeptMemberSelector
                open={selectorVisible}
                onOpenChange={setSelectorVisible}
                departmentId={props.departmentId}
                onAddSuccess={() => {
                    // Selector closes automatically or handled by onOpenChange
                    // Refresh list
                    actionRef.current?.reload();
                    props.onRefresh?.();
                }}
            />
        </>
    );
};

export default DeptMemberDialog;
