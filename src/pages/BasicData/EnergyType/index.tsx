import React, { useEffect, useMemo, useState } from 'react';
import { ProPageContainer } from '@/components/container';
import { Button, Space } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import useCrud from '@/hooks/common/useCrud';
import { DeleteButton, EditButton } from '@/components/button';
import {
    EnergyType,
    EnergyCategory,
    EnergyCategoryLabel,
    getEnergyTypes,
    deleteEnergyType,
} from '@/apis/energyType';
import EnergyTypeForm from './components/EnergyTypeForm';
import StatusIcon from '@/components/icons/StatusIcon';

/**
 * 能源类型管理页面
 */
const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<EnergyType[]>([]);

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
    } = useCrud<EnergyType>({
        pathname: '/basic-data/energy-type',
        entityName: '能源类型',
        baseUrl: '/api/energy-types',
    });

    const state = getState('/basic-data/energy-type');

    // 编辑选中项
    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        toEdit(selectedRows[0]);
    };

    // 批量删除 - 使用 useCrud 的 toBatchDelete
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
    const columns: ProColumns<EnergyType>[] = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name',
            width: 120,
            fieldProps: {
                placeholder: '请输入名称',
            },
        },
        {
            title: '编码',
            dataIndex: 'code',
            key: 'code',
            width: 150,
            fieldProps: {
                placeholder: '请输入编码',
            },
            render: (_, record) => (
                <Space>
                    {record.color && (
                        <span
                            style={{
                                display: 'inline-block',
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: record.color,
                            }}
                        />
                    )}
                    <span>{record.code}</span>
                </Space>
            ),
        },
        {
            title: '计量单位',
            dataIndex: 'unit',
            key: 'unit',
            width: 100,
            hideInSearch: true,
        },
        {
            title: '类别',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            valueType: 'select',
            fieldProps: {
                placeholder: '请选择类别',
                options: Object.values(EnergyCategory).map((value) => ({
                    label: EnergyCategoryLabel[value],
                    value,
                })),
            },
            render: (_, record) => EnergyCategoryLabel[record.category as EnergyCategory] || record.category,
        },
        {
            title: '折标系数',
            dataIndex: 'coefficient',
            key: 'coefficient',
            width: 100,
            hideInSearch: true,
            render: (val) => val ?? '-',
        },
        {
            title: '碳排放因子',
            dataIndex: 'emissionFactor',
            key: 'emissionFactor',
            width: 110,
            hideInSearch: true,
            render: (val) => val ?? '-',
        },
        {
            title: '默认单价',
            dataIndex: 'defaultPrice',
            key: 'defaultPrice',
            width: 100,
            hideInSearch: true,
            render: (val) => (val ? `¥${val}` : '-'),
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            key: 'sortOrder',
            width: 80,
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            valueType: 'select',
            fieldProps: {
                placeholder: '请选择状态',
                options: [
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ],
            },
            render: (_, record) => <StatusIcon value={record.status} />,
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            width: 200,
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
                <ProTable<EnergyType>
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
                    form={{ span: 8 }}
                    cardProps={{ bordered: false }}
                    search={{
                        collapseRender: false,
                        defaultCollapsed: false,
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
                        const res = await getEnergyTypes({
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

            <EnergyTypeForm
                visible={state?.dialogVisible || false}
                onCancel={() => setDialogVisible(false)}
                onSuccess={handleFormSuccess}
            />
        </>
    );
};

export default Index;
