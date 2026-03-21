import { getEquipments, Equipment } from '@/apis/equipment';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import StatusIcon from '@/components/icons/StatusIcon';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space } from 'antd';
import React, { useEffect, useState } from 'react';
import EquipmentForm from './components/EquipmentForm';

const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const {
        getState, formRef, actionRef, toCreate, toEdit, toDelete, toBatchDelete, setDialogVisible, setShouldRefresh,
    } = useCrud<Equipment>({ pathname: '/basic-data/equipment', entityName: '用能设备', baseUrl: '/api/equipments' });

    const state = getState('/basic-data/equipment');

    useEffect(() => {
        if (state?.shouldRefresh) { actionRef.current?.reload(); setShouldRefresh(false); }
    }, [state?.shouldRefresh]);

    const columns: ProColumns<Equipment>[] = [
        { title: '设备名称', dataIndex: 'name', width: 150 },
        { title: '设备编码', dataIndex: 'code', width: 120 },
        { title: '设备类型', dataIndex: 'type', width: 120 },
        { title: '规格型号', dataIndex: 'modelNumber', width: 120, hideInSearch: true },
        { title: '额定功率(kW)', dataIndex: 'ratedPower', width: 120, hideInSearch: true },
        { title: '安装位置', dataIndex: 'location', width: 150, hideInSearch: true, ellipsis: true },
        {
            title: '所属用能单元', dataIndex: ['energyUnit', 'name'], width: 130, hideInSearch: true,
            render: (_, r) => r.energyUnit?.name || '-',
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
                <ProTable<Equipment>
                    columns={columns} rowKey="id" formRef={formRef} actionRef={actionRef}
                    tableAlertRender={false} tableAlertOptionRender={false}
                    rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
                    cardProps={{ variant: 'borderless' } as any}
                    search={{ collapseRender: false, defaultCollapsed: false, span: 6 }}
                    toolbar={{
                        title: (
                            <Space>
                                <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                                <Button color={'danger'} icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} size={'small'} variant={'outlined'}
                                    onClick={async () => { await toBatchDelete(selectedRowKeys as number[], true); setSelectedRowKeys([]); }}>删除</Button>
                            </Space>
                        ),
                    }}
                    request={async (params) => {
                        const { current, pageSize, ...rest } = params;
                        return wrapperResult(await getEquipments({ ...rest, pageNumber: (current || 1) - 1, pageSize }));
                    }}
                    pagination={{ showSizeChanger: true, defaultPageSize: 20 }}
                />
            </ProPageContainer>
            <EquipmentForm visible={state?.dialogVisible || false} onCancel={() => setDialogVisible(false)}
                onSuccess={() => { setDialogVisible(false); actionRef.current?.reload(); }} />
        </>
    );
};

export default Index;
