import React, { useEffect, useMemo, useState } from 'react';
import { ProPageContainer } from '@/components/container';
import { Button, Space } from 'antd';
import { DeleteFilled, EditFilled, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import useCrud from '@/hooks/common/useCrud';
import { DeleteButton, EditButton } from '@/components/button';
import { Product } from '@/apis/product';
import ProductForm from './components/ProductForm';
import StatusIcon from '@/components/icons/StatusIcon';

/**
 * 产品管理页面
 */
const ProductPage: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Product[]>([]);

    const {
        getState,
        actionRef,
        formRef,
        fetchPage,
        toCreate,
        toEdit,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<Product>({
        pathname: '/basic-data/product',
        baseUrl: '/api/products',
        entityName: '产品',
    });

    const state = getState('/basic-data/product');

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

    const columns: ProColumns<Product>[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            hideInSearch: true,
            hideInTable: true,
            width: 60,
        },
        {
            title: '产品编码',
            dataIndex: 'code',
            copyable: true,
            width: 160,
        },
        {
            title: '产品名称',
            dataIndex: 'name',
            width: 150,
        },
        {
            title: '计量单位',
            dataIndex: 'unit',
            hideInSearch: true,
            width: 100,
        },
        {
            title: '产品类型',
            dataIndex: 'type',
            width: 120,
            valueType: 'select',
            valueEnum: {
                '1': { text: '成品' },
                '2': { text: '半成品' },
                '3': { text: '原材料' },
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
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
            title: '排序',
            dataIndex: 'sortOrder',
            hideInSearch: true,
            width: 80,
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            hideInSearch: true,
            width: 160,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onConfirm={() => toBatchDelete([record.id])} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable<Product>
                    headerTitle="产品列表"
                    actionRef={actionRef}
                    formRef={formRef}
                    rowKey="id"
                    search={{
                        labelWidth: 100,
                        collapseRender: false,
                        defaultCollapsed: false,
                        span: 6,
                    }}

                    toolbar={{
                        title: (
                            <Space>
                                <Button
                                    icon={<PlusOutlined />}
                                    type="primary"
                                    size={'small'}
                                    onClick={toCreate}
                                >
                                    新建
                                </Button>
                                <Button
                                    icon={<EditFilled />}
                                    disabled={editDisabled}
                                    size={'small'}
                                    onClick={toEditSelected}
                                >
                                    修改
                                </Button>
                                <Button
                                    icon={<DeleteFilled />}
                                    disabled={deleteDisabled}
                                    size={'small'}
                                    onClick={handleBatchDelete}
                                >
                                    删除
                                </Button>
                            </Space>
                        ),
                    }}
                    request={async (params) => {
                        console.log('[ProductPage] fetchPage params:', params);
                        return fetchPage(params);
                    }}
                    columns={columns}
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
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 20,
                    }}
                />
            </ProPageContainer>

            <ProductForm
                visible={state?.dialogVisible || false}
                onOpenChange={setDialogVisible}
                onSuccess={handleFormSuccess}
            />
        </>
    );
};

export default ProductPage;
