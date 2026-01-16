import React, { useRef, useState } from 'react';
import { ProTable, ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, Space, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { dictTypeApi } from '@/apis/system/dict';
import { ProPageContainer } from '@/components/container';
import DictDataList from './DataList'; // 稍后创建

const DictTypeManager: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [currentRow, setCurrentRow] = useState<any>();
    const [dataListVisible, setDataListVisible] = useState(false);

    const columns: ProColumns[] = [
        {
            title: '字典名称',
            dataIndex: 'name',
        },
        {
            title: '字典类型',
            dataIndex: 'type',
            render: (dom, record) => (
                <a onClick={() => {
                    setCurrentRow(record);
                    setDataListVisible(true);
                }}>{dom}</a>
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
            dataIndex: 'createTime',
            valueType: 'dateTime',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => { /* TODO: 编辑逻辑 */ }}
                    >修改</Button>
                    <Button
                        type="link"
                        size="small"
                        icon={<SettingOutlined />}
                        onClick={() => {
                            setCurrentRow(record);
                            setDataListVisible(true);
                        }}
                    >列表</Button>
                    <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => {
                            Modal.confirm({
                                title: '删除确认',
                                content: `确定要删除字典类型 [${record.name}] 吗？`,
                                onOk: async () => {
                                    await dictTypeApi.remove(record.id);
                                    message.success('删除成功');
                                    actionRef.current?.reload();
                                }
                            });
                        }}
                    >删除</Button>
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer>
            <ProTable
                headerTitle="字典类型管理"
                actionRef={actionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                toolBarRender={() => [
                    <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { }}>
                        新建
                    </Button>,
                ]}
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

            {/* 字典数据项管理弹窗/侧边栏 */}
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
        </ProPageContainer>
    );
};

export default DictTypeManager;
