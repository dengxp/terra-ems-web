import { getGateways, Gateway } from '@/apis/gateway';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import StatusIcon from '@/components/icons/StatusIcon';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import GatewayForm from './components/GatewayForm';

const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Gateway[]>([]);

    const {
        getState, formRef, actionRef, toCreate, toEdit, toDelete, toBatchDelete, setDialogVisible, setShouldRefresh,
    } = useCrud<Gateway>({ pathname: '/basic-data/gateway', entityName: '网关', baseUrl: '/api/gateways' });

    const state = getState('/basic-data/gateway');

    useEffect(() => {
        if (state?.shouldRefresh) { actionRef.current?.reload(); setShouldRefresh(false); }
    }, [state?.shouldRefresh]);

    const columns: ProColumns<Gateway>[] = [
        { title: '网关名称', dataIndex: 'name', width: 150 },
        { title: '网关编码', dataIndex: 'code', width: 120 },
        { title: '规格型号', dataIndex: 'model', width: 120, hideInSearch: true },
        { title: 'IP 地址', dataIndex: 'ipAddress', width: 130, hideInSearch: true },
        { title: '安装位置', dataIndex: 'installLocation', width: 150, hideInSearch: true, ellipsis: true },
        {
            title: '所属用能单元', dataIndex: ['energyUnit', 'name'], width: 130, hideInSearch: true,
            render: (_, r) => r.energyUnit?.name || '-',
        },
        {
            title: '运行状态', dataIndex: 'runStatus', width: 100, hideInSearch: true,
            render: (_, r) => {
                const color = r.runStatus === 'ONLINE' ? 'green' : r.runStatus === 'OFFLINE' ? 'red' : 'default';
                const text = r.runStatus === 'ONLINE' ? '在线' : r.runStatus === 'OFFLINE' ? '离线' : '未知';
                return <Tag color={color}>{text}</Tag>;
            },
        },
        { title: '状态', dataIndex: 'status', width: 80, hideInSearch: true, render: (_, r) => <StatusIcon value={r.status} /> },
        {
            title: '操作', width: 100, hideInSearch: true,
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onConfirm={() => toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable<Gateway>
                    columns={columns} rowKey="id" formRef={formRef} actionRef={actionRef}
                    tableAlertRender={false} tableAlertOptionRender={false}
                    rowSelection={{ selectedRowKeys, onChange: (keys, rows) => { setSelectedRowKeys(keys); setSelectedRows(rows); } }}
                    cardProps={{ variant: 'borderless' } as any}
                    search={{ collapseRender: false, defaultCollapsed: false, span: 6 }}
                    toolbar={{
                        title: (
                            <Space>
                                <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                                <Button color={'danger'} icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} size={'small'} variant={'outlined'}
                                    onClick={async () => { await toBatchDelete(selectedRowKeys as number[], true); setSelectedRowKeys([]); setSelectedRows([]); }}>删除</Button>
                            </Space>
                        ),
                    }}
                    request={async (params) => {
                        const { current, pageSize, ...rest } = params;
                        return wrapperResult(await getGateways({ ...rest, pageNumber: (current || 1) - 1, pageSize }));
                    }}
                    pagination={{ showSizeChanger: true, defaultPageSize: 20 }}
                />
            </ProPageContainer>
            <GatewayForm visible={state?.dialogVisible || false} onCancel={() => setDialogVisible(false)}
                onSuccess={() => { setDialogVisible(false); actionRef.current?.reload(); }} />
        </>
    );
};

export default Index;
