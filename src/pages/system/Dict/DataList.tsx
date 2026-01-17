import React, { useRef, useState } from 'react';
import { ProTable, ProColumns, ActionType, ModalForm, ProFormText, ProFormTextArea, ProFormRadio, ProFormDigit } from '@ant-design/pro-components';
import { Button, Space, Tag, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { dictDataApi } from '@/apis/system/dict';
import { EditButton, DeleteButton } from '@/components/button';

interface Props {
    typeCode: string;
}

const DictDataList: React.FC<Props> = ({ typeCode }) => {
    const actionRef = useRef<ActionType>();
    const [currentRow, setCurrentRow] = useState<any>();
    const [editModalVisible, setEditModalVisible] = useState(false);

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

    const handleEdit = (record: any) => {
        setCurrentRow(record);
        setEditModalVisible(true);
    };

    const handleAdd = () => {
        setCurrentRow(undefined);
        setEditModalVisible(true);
    };

    const handleSubmit = async (values: any) => {
        const data = { ...values, typeCode };
        if (currentRow?.id) {
            await dictDataApi.update({ ...data, id: currentRow.id });
            message.success('修改成功');
        } else {
            await dictDataApi.add(data);
            message.success('新增成功');
        }
        actionRef.current?.reload();
        return true;
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
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    return (
        <>
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
                                onClick={handleAdd}
                            >新增项</Button>
                        </Space>
                    )
                }}
                params={{ typeCode }}
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

            {/* 新增/编辑字典项弹窗 */}
            <ModalForm
                title={currentRow?.id ? '编辑字典项' : '新增字典项'}
                open={editModalVisible}
                onOpenChange={setEditModalVisible}
                initialValues={currentRow}
                modalProps={{ destroyOnClose: true, width: 520 }}
                onFinish={handleSubmit}
                layout="horizontal"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
            >
                <ProFormText
                    name="label"
                    label="字典标签"
                    placeholder="请输入字典标签"
                    rules={[{ required: true, message: '请输入字典标签' }]}
                />
                <ProFormText
                    name="value"
                    label="字典键值"
                    placeholder="请输入字典键值"
                    rules={[{ required: true, message: '请输入字典键值' }]}
                />
                <ProFormDigit
                    name="sortOrder"
                    label="排序"
                    placeholder="请输入排序"
                    initialValue={0}
                    fieldProps={{ precision: 0 }}
                />
                <ProFormText
                    name="tagColor"
                    label="标签颜色"
                    placeholder="如: blue, green, red"
                />
                <ProFormRadio.Group
                    name="status"
                    label="状态"
                    initialValue="0"
                    options={[
                        { label: '正常', value: '0' },
                        { label: '停用', value: '1' },
                    ]}
                />
                <ProFormTextArea
                    name="remark"
                    label="备注"
                    placeholder="请输入备注"
                />
            </ModalForm>
        </>
    );
};

export default DictDataList;



