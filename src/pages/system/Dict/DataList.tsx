import React from 'react';
import { ProTable, ProColumns, ModalForm, ProFormText, ProFormTextArea, ProFormRadio, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
import { Space, Tag, Badge } from 'antd';
import { EditButton, DeleteButton, AddButton } from '@/components/button';
import useCrud from '@/hooks/common/useCrud';
import { SysDictData } from '@/apis/system/dict';

interface Props {
    typeCode: string;
}

const DictDataList: React.FC<Props> = ({ typeCode }) => {
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
    } = useCrud<SysDictData>({
        entityName: '字典项',
        pathname: `/system/dict/data/${typeCode}`,
        baseUrl: '/api/system/dict/data',
    });

    const { dialogVisible, dialogTitle, editData, shouldRefresh } = getState(`/system/dict/data/${typeCode}`);

    React.useEffect(() => {
        if (shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [shouldRefresh, actionRef, setShouldRefresh]);

    const columns: ProColumns<SysDictData>[] = [
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
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onClick={() => toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProTable<SysDictData>
                headerTitle={false}
                actionRef={actionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                scroll={{ x: 'max-content' }}
                toolbar={{
                    title: (
                        <Space>
                            <AddButton onClick={toCreate}>新增项</AddButton>
                        </Space>
                    )
                }}
                params={{ typeCode }}
                request={fetchPage}
                pagination={{
                    defaultPageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                columns={columns}
            />

            {/* 新增/编辑字典项弹窗 */}
            <ModalForm
                title={dialogTitle}
                open={dialogVisible}
                onOpenChange={setDialogVisible}
                initialValues={editData || undefined}
                modalProps={{ destroyOnHidden: true, width: 520 }}
                onFinish={(values) => handleSaveOrUpdate({ ...values, typeCode })}
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
                <ProFormText name="id" hidden />
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
                <ProFormSelect
                    name="tagColor"
                    label="标签颜色"
                    placeholder="请选择标签颜色"
                    options={[
                        { label: <Space><Badge color="blue" />蓝色</Space>, value: 'blue' },
                        { label: <Space><Badge color="green" />绿色</Space>, value: 'green' },
                        { label: <Space><Badge color="red" />红色</Space>, value: 'red' },
                        { label: <Space><Badge color="orange" />橙色</Space>, value: 'orange' },
                        { label: <Space><Badge color="purple" />紫色</Space>, value: 'purple' },
                        { label: <Space><Badge color="cyan" />青色</Space>, value: 'cyan' },
                        { label: <Space><Badge color="gold" />金色</Space>, value: 'gold' },
                        { label: <Space><Badge color="magenta" />品红</Space>, value: 'magenta' },
                        { label: <Space><Badge color="lime" />青柠</Space>, value: 'lime' },
                        { label: <Space><Badge color="volcano" />火山</Space>, value: 'volcano' },
                        { label: <Space><Badge color="geekblue" />极客蓝</Space>, value: 'geekblue' },
                        { label: '无', value: '' },
                    ]}
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



