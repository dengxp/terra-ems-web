import React, { useEffect, useMemo, useState } from 'react';
import { ProPageContainer } from '@/components/container';
import { Button, Space, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import useCrud from '@/hooks/common/useCrud';
import { DeleteButton, EditButton } from '@/components/button';
import {
    Meter,
    getMeters,
} from '@/apis/meter';
import MeterForm from './components/MeterForm';
import StatusIcon from '@/components/icons/StatusIcon';

/**
 * 计量器具管理页面
 */
const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Meter[]>([]);

    const {
        getState,
        formRef,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<Meter>({
        pathname: '/basic-data/meter',
        entityName: '计量器具',
        baseUrl: '/api/meters',
    });

    const state = getState('/basic-data/meter');

    // 编辑选中项
    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        toEdit(selectedRows[0]);
    };

    // 批量删除
    const handleBatchDelete = async () => {
        if (deleteDisabled) return;
        try {
            await toBatchDelete(selectedRowKeys as number[], true);
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            // 错误由全局处理
        }
    };

    // 表单提交成功
    const handleFormSuccess = () => {
        setDialogVisible(false);
        actionRef.current?.reload();
    };

    const editDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length !== 1;
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length === 0;
    }, [selectedRowKeys]);

    useEffect(() => {
        if (state?.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state?.shouldRefresh]);

    // 表格列定义
    const columns: ProColumns<Meter>[] = [
        {
            title: '器具名称',
            dataIndex: 'name',
            key: 'name',
            width: 150,
        },
        {
            title: '器具编码',
            dataIndex: 'code',
            key: 'code',
            width: 120,
        },
        {
            title: '能源类型',
            dataIndex: ['energyType', 'name'],
            key: 'energyTypeName',
            width: 100,
            hideInSearch: true,
            render: (_, record) => (
                record.energyType ? (
                    <Tag color={record.energyType.color || 'blue'}>
                        {record.energyType.name}
                    </Tag>
                ) : '-'
            ),
        },
        {
            title: '规格型号',
            dataIndex: 'modelNumber',
            key: 'modelNumber',
            width: 120,
            hideInSearch: true,
        },
        {
            title: '安装位置',
            dataIndex: 'location',
            key: 'location',
            width: 200,
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            valueType: 'select',
            fieldProps: {
                options: [
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ],
            },
            render: (_, record) => <StatusIcon value={record.status} />,
        },
        {
            title: '负责人',
            dataIndex: 'personCharge',
            key: 'personCharge',
            width: 100,
            hideInSearch: true,
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            width: 150,
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            width: 120,
            hideInSearch: true,
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
            <ProPageContainer className={'pt-1'}>
                <ProTable<Meter>
                    columns={columns}
                    rowKey="id"
                    formRef={formRef}
                    actionRef={actionRef}
                    tableAlertRender={false}
                    tableAlertOptionRender={false}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys, rows) => {
                            setSelectedRowKeys(keys);
                            setSelectedRows(rows);
                        },
                    }}
                    form={{ span: 6 }}
                    cardProps={{ bordered: false }}
                    search={{
                        collapseRender: false,
                        defaultCollapsed: false,
                        span: 6,
                    }}
                    toolbar={{
                        title: (
                            <Space>
                                <Button
                                    color={'primary'}
                                    icon={<PlusOutlined />}
                                    variant={'outlined'}
                                    size={'small'}
                                    onClick={toCreate}
                                >
                                    新建
                                </Button>
                                <Button
                                    color={'green'}
                                    icon={<EditOutlined />}
                                    disabled={editDisabled}
                                    size={'small'}
                                    variant={'outlined'}
                                    onClick={toEditSelected}
                                >
                                    修改
                                </Button>
                                <Button
                                    color={'danger'}
                                    icon={<DeleteOutlined />}
                                    disabled={deleteDisabled}
                                    size={'small'}
                                    variant={'outlined'}
                                    onClick={handleBatchDelete}
                                >
                                    删除
                                </Button>
                            </Space>
                        ),
                    }}
                    request={async (params) => {
                        const { current, pageSize, ...rest } = params;
                        const res = await getMeters({
                            ...rest,
                            pageNumber: (current || 1) - 1,
                            pageSize: pageSize,
                        });
                        return {
                            data: res.data?.content || [],
                            total: res.data?.totalElement || 0,
                            success: res.success,
                        };
                    }}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 20,
                    }}
                />
            </ProPageContainer>

            <MeterForm
                visible={state?.dialogVisible || false}
                onCancel={() => setDialogVisible(false)}
                onSuccess={handleFormSuccess}
            />
        </>
    );
};

export default Index;
