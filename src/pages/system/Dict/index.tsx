import React, { useRef, useState } from 'react';
import { ProTable, ProColumns, ActionType, ModalForm, ProFormText, ProFormTextArea, ProFormRadio } from '@ant-design/pro-components';
import { Button, Space, message, Modal, Tag, Drawer } from 'antd';
import { PlusOutlined, SettingFilled } from '@ant-design/icons';
import { dictTypeApi } from '@/apis/system/dict';
import { ProPageContainer } from '@/components/container';
import { EditButton, DeleteButton, IconButton } from '@/components/button';
import DictDataList from './DataList';

const DictTypeManager: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [currentRow, setCurrentRow] = useState<any>();
    const [dataListVisible, setDataListVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);

    const handleDelete = (record: any) => {
        Modal.confirm({
            title: '删除确认',
            content: `确定要删除字典类型 [${record.name}] 吗？`,
            onOk: async () => {
                await dictTypeApi.remove(record.id);
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
        await dictTypeApi.save({ ...values, id: currentRow?.id });
        message.success(currentRow?.id ? '修改成功' : '新增成功');
        actionRef.current?.reload();
        return true;
    };

    const columns: ProColumns[] = [
        {
            title: '字典名称',
            dataIndex: 'name',
        },
        {
            title: '字典类型',
            dataIndex: 'type',
            render: (dom, record) => (
                <Tag
                    color="processing"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setCurrentRow(record);
                        setDataListVisible(true);
                    }}
                >
                    <SettingFilled style={{ marginRight: 4 }} />{dom}
                </Tag>
            ),
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
            title: '创建时间',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => handleEdit(record)} />
                    <IconButton
                        tooltip="字典项"
                        icon={<SettingFilled />}
                        onClick={() => {
                            setCurrentRow(record);
                            setDataListVisible(true);
                        }}
                    />
                    <DeleteButton onClick={() => handleDelete(record)} />
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer>
            <ProTable
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
                            >新建</Button>
                        </Space>
                    )
                }}
                request={async (params) => {
                    const res = await dictTypeApi.findByPage(params);
                    return {
                        data: res.data.content,
                        success: true,
                        total: res.data.totalElements,
                    };
                }}
                columns={columns}
            />

            {/* 字典数据项管理弹窗 */}
            <Modal
                title={`字典项配置 - ${currentRow?.name || ''}`}
                open={dataListVisible}
                onCancel={() => setDataListVisible(false)}
                width={1000}
                footer={null}
                destroyOnClose
            >
                <DictDataList typeCode={currentRow?.type} />
            </Modal>

            {/* 新增/编辑字典类型弹窗 */}
            <ModalForm
                title={currentRow?.id ? '编辑字典类型' : '新增字典类型'}
                open={editModalVisible}
                onOpenChange={setEditModalVisible}
                initialValues={currentRow}
                modalProps={{ destroyOnClose: true, width: 520 }}
                onFinish={handleSubmit}
                layout="horizontal"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
            >
                <ProFormText
                    name="name"
                    label="字典名称"
                    placeholder="请输入字典名称"
                    rules={[{ required: true, message: '请输入字典名称' }]}
                />
                <ProFormText
                    name="type"
                    label="字典类型"
                    placeholder="请输入字典类型"
                    rules={[{ required: true, message: '请输入字典类型' }]}
                    disabled={!!currentRow?.id}
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
        </ProPageContainer>
    );
};

export default DictTypeManager;

