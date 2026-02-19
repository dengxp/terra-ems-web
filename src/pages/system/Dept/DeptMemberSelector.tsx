import { addMembers, findUserPage } from "@/apis";
import GenderIcon from "@/components/icons/GenderIcon";
import StatusIcon from "@/components/icons/StatusIcon";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { message, Modal, ModalProps } from "antd";
import React, { useEffect, useRef, useState } from 'react';

type Props = Omit<ModalProps, 'onCancel'> & {
    departmentId?: number;
    onAddSuccess?: () => void;
    onOpenChange?: (visible: boolean) => void;
}

function DeptMemberSelector(props: Props) {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const actionRef = useRef<ActionType>();

    const { departmentId, ...rest } = props;

    useEffect(() => {
        if (props.open) {
            actionRef.current?.reload();
        }
    }, [props.open]);

    const toGenderValue = (gender?: string | number) => {
        if (typeof gender === 'number') return gender;
        if (gender === 'MAN' || gender === 'MALE') return 0;
        if (gender === 'WOMAN' || gender === 'FEMALE') return 1;
        return 2;
    }

    const columns: ProColumns<SysUser>[] = [
        {
            title: '关键字',
            dataIndex: 'keyword',
            hideInTable: true,
            fieldProps: {
                placeholder: '输入用户名/姓名/手机号搜索',
                style: { width: 400 } // Width increased
            }
        },
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            search: false,
        },
        {
            title: '用户姓名',
            dataIndex: 'realName',
            key: 'realName',
            search: false,
        },
        {
            title: '性别',
            dataIndex: 'gender',
            key: 'gender',
            width: 80,
            search: false,
            render: (_: any, record: SysUser) => <GenderIcon value={toGenderValue(record.gender)} />
        },
        {
            title: '手机号',
            dataIndex: 'phone',
            key: 'phone',
            search: false,
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            search: false,
            render: (_: any, record: SysUser) => <StatusIcon value={record.status} />
        }
    ];

    const onFinish = async () => {
        if (!selectedRowKeys || selectedRowKeys.length === 0) {
            message.error('您未选择任何用户');
            return;
        }
        if (!departmentId) {
            message.error('未指定部门');
            return;
        }

        setLoading(true);
        try {
            const res = await addMembers(departmentId, selectedRowKeys as number[]);
            message.success(res.message || '添加成功');
            props.onAddSuccess?.();
            setSelectedRowKeys([]);
            props.onOpenChange?.(false);
            actionRef.current?.clearSelected?.();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal {...rest} title={'添加成员'} centered width={800}
            onCancel={() => {
                setSelectedRowKeys([]);
                props?.onOpenChange?.(false);
            }}
            onOk={onFinish}
            confirmLoading={loading}
            bodyStyle={{ padding: 0 }}
        >
            <ProTable<SysUser>
                columns={columns}
                actionRef={actionRef}
                rowKey="id"
                tableAlertRender={false}
                tableAlertOptionRender={false}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                }}
                request={async (params) => {
                    if (!props.open) return { data: [], success: true };

                    const queryParams = {
                        pageNumber: (params.current || 1) - 1,
                        pageSize: params.pageSize,
                        keyword: params.keyword,
                        excludeDeptId: departmentId,
                        status: 0
                    };

                    const res = await findUserPage(queryParams);
                    return {
                        data: res.data?.content || [],
                        total: res.data?.totalElements || 0,
                        success: res.success,
                    };
                }}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                }}
                search={{
                    labelWidth: 'auto',
                    filterType: 'query', // 使用内嵌式查询，更适合 Dialog
                }}
                options={false}
                dateFormatter="string"
                scroll={{ y: 550 }}
                cardProps={{ bodyStyle: { padding: 0 }, bordered: false }}
            />
        </Modal>
    );
}

export default DeptMemberSelector;
