import React, { useRef, useState } from 'react';
import { EditableProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Tag, message, Modal } from 'antd';
import { dictDataApi } from '@/apis/system/dict';

interface Props {
    typeCode: string;
}

type DictDataItem = {
    id?: number;
    label?: string;
    value?: string;
    sortOrder?: number;
    tagColor?: string;
    status?: string;
    remark?: string;
    typeCode?: string;
};

const DictDataList: React.FC<Props> = ({ typeCode }) => {
    const actionRef = useRef<ActionType>();
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

    const columns: ProColumns<DictDataItem>[] = [
        {
            title: '字典标签',
            dataIndex: 'label',
            formItemProps: {
                rules: [{ required: true, message: '请输入字典标签' }],
            },
            render: (text, record) => (
                <Tag color={record.tagColor || undefined}>
                    {text}
                </Tag>
            ),
        },
        {
            title: '字典键值',
            dataIndex: 'value',
            formItemProps: {
                rules: [{ required: true, message: '请输入字典键值' }],
            },
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            valueType: 'digit',
            width: 80,
        },
        {
            title: '标签颜色',
            dataIndex: 'tagColor',
            width: 100,
            valueType: 'select',
            valueEnum: {
                '': { text: '默认' },
                'blue': { text: '蓝色' },
                'green': { text: '绿色' },
                'red': { text: '红色' },
                'orange': { text: '橙色' },
                'purple': { text: '紫色' },
                'cyan': { text: '青色' },
                'gold': { text: '金色' },
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 80,
            valueType: 'select',
            valueEnum: {
                '0': { text: '正常', status: 'Success' },
                '1': { text: '停用', status: 'Error' },
            },
        },
        {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 150,
            render: (_, record, __, action) => [
                <a
                    key="edit"
                    onClick={() => {
                        action?.startEditable?.(record.id!);
                    }}
                >
                    编辑
                </a>,
                <a
                    key="delete"
                    style={{ color: '#ff4d4f' }}
                    onClick={() => {
                        Modal.confirm({
                            title: '删除确认',
                            content: `确定要删除字典项 [${record.label}] 吗？`,
                            onOk: async () => {
                                await dictDataApi.remove(record.id!);
                                message.success('删除成功');
                                actionRef.current?.reload();
                            }
                        });
                    }}
                >
                    删除
                </a>,
            ],
        },
    ];

    return (
        <EditableProTable<DictDataItem>
            rowKey="id"
            actionRef={actionRef}
            headerTitle={false}
            columns={columns}
            params={{ typeCode }}
            request={async (params) => {
                const res = await dictDataApi.findByPage(params);
                return {
                    data: res.data.content || [],
                    success: true,
                    total: res.data.totalElements || 0,
                };
            }}
            pagination={{ pageSize: 10 }}
            editable={{
                type: 'single',
                editableKeys,
                onChange: setEditableRowKeys,
                onSave: async (key, row) => {
                    const data = { ...row, typeCode };
                    if (row.id && typeof row.id === 'number') {
                        await dictDataApi.update(data);
                        message.success('修改成功');
                    } else {
                        await dictDataApi.add(data);
                        message.success('新增成功');
                    }
                    actionRef.current?.reload();
                },
                onDelete: async (key) => {
                    await dictDataApi.remove(key as number);
                    message.success('删除成功');
                },
                actionRender: (row, config, defaultDom) => [
                    defaultDom.save,
                    defaultDom.cancel,
                ],
            }}
            recordCreatorProps={{
                position: 'top',
                record: () => ({
                    id: Date.now(),
                    status: '0',
                    sortOrder: 0,
                }),
                creatorButtonText: '新增字典项',
            }}
        />
    );
};

export default DictDataList;


