import React, { useRef } from 'react';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Space, Tag, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { dictDataApi } from '@/apis/system/dict';
import { EditButton, DeleteButton } from '@/components/button';

interface Props {
    typeCode: string;
}

const DictDataList: React.FC<Props> = ({ typeCode }) => {
    const actionRef = useRef<ActionType>();

    const handleDelete = (record: any) => {
        Modal.confirm({
            title: '删除确认',
            content: `确定要删除字典项 [${record.label}] 吗？`,
            onOk: async () => {
                await dictDataApi.remove(record.id);
                message.success('删除成功');
                actionRef.current?.reload();
            }
        });
    };

    const columns: ProColumns[] = [
        {
            title: '字典标签',
            dataIndex: 'label',
            render: (text, record) => (
                <Tag color={record.tagColor || undefined}>
                    {text}
                </Tag>
            ),
        },
        {
            title: '字典键值',
            dataIndex: 'value',
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueEnum: {
                '0': { text: '正常', status: 'Success' },
                '1': { text: '停用', status: 'Error' },
            },
        },
        {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => { }} />
                    <DeleteButton onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    return (
        <ProTable
            headerTitle={false}
            actionRef={actionRef}
            rowKey="id"
            search={{ labelWidth: 'auto' }}
            scroll={{ x: 'max-content' }}
            toolbar={{
                title: (
                    <Space>
                        <Button
                            color="primary"
                            icon={<PlusOutlined />}
                            variant="outlined"
                            size="small"
                            onClick={() => { }}
                        >新增项</Button>
                    </Space>
                )
            }}
            params={{ typeCode }} // 锁定当前字典类型
            request={async (params) => {
                const res = await dictDataApi.findByPage(params);
                return {
                    data: res.data.content,
                    success: true,
                    total: res.data.totalElements,
                };
            }}
            pagination={{ pageSize: 5 }}
            columns={columns}
        />
    );
};

export default DictDataList;
