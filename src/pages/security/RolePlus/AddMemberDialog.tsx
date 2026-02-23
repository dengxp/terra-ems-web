import React, { useState } from 'react';
import { Modal, message } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { findUserPage } from '@/apis/user';
import { addRoleMembers } from '@/apis/role';
import { wrapperResult } from '@/utils';

type Props = {
    roleId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
};

const AddMemberDialog = ({ roleId, open, onOpenChange, onSuccess }: Props) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');

    const handleOk = async () => {
        if (selectedRowKeys.length === 0) {
            void message.warning('请选择要添加的用户');
            return;
        }

        setLoading(true);
        try {
            const res = await addRoleMembers(roleId, selectedRowKeys as number[]);
            if (res.success) {
                void message.success('添加成员成功');
                onSuccess?.();
                onOpenChange(false);
            }
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: '用户名', dataIndex: 'username' },
        { title: '用户姓名', dataIndex: 'realName' },
        { title: '部门', dataIndex: 'deptName' },
    ];

    return (
        <Modal
            title="添加角色成员"
            open={open}
            onOk={handleOk}
            onCancel={() => onOpenChange(false)}
            width={800}
            destroyOnClose
            centered
        >
            <ProTable
                columns={columns}
                rowKey="id"
                search={false}
                toolbar={{
                    search: {
                        allowClear: true,
                        placeholder: '请输入关键字搜索...',
                        style: { width: 320 },
                        onSearch: (value) => setKeyword(value)
                    }
                }}
                params={{ keyword }}
                request={async (params) => {
                    // 查询所有激活状态的用户
                    const result = await findUserPage({ ...params, status: 0 });
                    return wrapperResult(result);
                }}
                rowSelection={{
                    selectedRowKeys,
                    onChange: (keys) => setSelectedRowKeys(keys),
                }}
                tableAlertRender={false}
                tableAlertOptionRender={false}
                pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            />
        </Modal>
    );
};

export default AddMemberDialog;
