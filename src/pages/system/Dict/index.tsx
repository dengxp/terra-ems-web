import React, { useState } from 'react';
import { ProTable, ProColumns, ModalForm, ProFormText, ProFormTextArea, ProFormRadio } from '@ant-design/pro-components';
import { Space, Modal, Tag } from 'antd';
import { SettingFilled } from '@ant-design/icons';
import { ProPageContainer } from '@/components/container';
import { EditButton, DeleteButton, IconButton, AddButton } from '@/components/button';
import useCrud from '@/hooks/common/useCrud';
import { SysDictType } from '@/apis/system/dict';
import DictDataList from './DataList';

const DictTypeManager: React.FC = () => {
    const [dataListVisible, setDataListVisible] = useState(false);
    const [currentRow, setCurrentRow] = useState<SysDictType>();

    const {
        fetchPage,
        handleSaveOrUpdate,
        toCreate,
        toEdit,
        toDelete,
        actionRef,
        getState,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<SysDictType>({
        entityName: '字典类型',
        pathname: '/system/dict',
        baseUrl: '/api/system/dict/type',
    });

    const { dialogVisible, dialogTitle, editData, shouldRefresh } = getState('/system/dict');

    React.useEffect(() => {
        if (shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [shouldRefresh, actionRef, setShouldRefresh]);

    const columns: ProColumns<SysDictType>[] = [
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
                    <EditButton onClick={() => toEdit(record)} />
                    <IconButton
                        tooltip="字典项"
                        icon={<SettingFilled />}
                        onClick={() => {
                            setCurrentRow(record);
                            setDataListVisible(true);
                        }}
                    />
                    <DeleteButton onClick={() => toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer>
            <ProTable<SysDictType>
                actionRef={actionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                scroll={{ x: 'max-content' }}
                toolbar={{
                    title: (
                        <Space>
                            <AddButton onClick={toCreate}>新建</AddButton>
                        </Space>
                    )
                }}
                request={fetchPage}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
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
                <DictDataList typeCode={currentRow?.type || ''} />
            </Modal>

            {/* 新增/编辑字典类型弹窗 */}
            <ModalForm
                title={dialogTitle}
                open={dialogVisible}
                onOpenChange={setDialogVisible}
                initialValues={editData || undefined}
                modalProps={{ destroyOnClose: true, width: 520 }}
                onFinish={handleSaveOrUpdate}
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
                <ProFormText name="id" hidden />
                <ProFormText
                    name="type"
                    label="字典类型"
                    placeholder="请输入字典类型"
                    rules={[{ required: true, message: '请输入字典类型' }]}
                    disabled={!!editData?.id}
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

