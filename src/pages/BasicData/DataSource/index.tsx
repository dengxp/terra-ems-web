import { getAllDataSources, DataSource } from '@/apis/dataSource';
import { DeleteButton, EditButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import StatusIcon from '@/components/icons/StatusIcon';
import useCrud from '@/hooks/common/useCrud';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Space, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import DataSourceForm from './components/DataSourceForm';

const PROTOCOL_LABELS: Record<string, { label: string; color: string }> = {
    'modbus-tcp': { label: 'Modbus TCP', color: 'blue' },
    'modbus-rtu': { label: 'Modbus RTU', color: 'cyan' },
    'mqtt': { label: 'MQTT', color: 'green' },
    'opc-ua': { label: 'OPC UA', color: 'purple' },
    'dlt645': { label: 'DL/T645', color: 'orange' },
    'http': { label: 'HTTP', color: 'geekblue' },
    'bacnet-ip': { label: 'BACnet/IP', color: 'magenta' },
};

/** 格式化 connection JSON 为可读文本 */
const formatConnection = (conn?: string): string => {
    if (!conn) return '-';
    try {
        const obj = typeof conn === 'string' ? JSON.parse(conn) : conn;
        return Object.entries(obj).map(([k, v]) => `${k}: ${v}`).join(', ');
    } catch {
        return conn;
    }
};

const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [dataList, setDataList] = useState<DataSource[]>([]);
    const [loading, setLoading] = useState(false);

    const {
        getState, toCreate, toEdit, toDelete, toBatchDelete, setDialogVisible, setShouldRefresh,
    } = useCrud<DataSource>({ pathname: '/basic-data/data-source', entityName: '数据源', baseUrl: '/api/data-sources' });

    const state = getState('/basic-data/data-source');

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getAllDataSources();
            if (res.success) setDataList(res.data || []);
        } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);
    useEffect(() => {
        if (state?.shouldRefresh) { loadData(); setShouldRefresh(false); }
    }, [state?.shouldRefresh]);

    const columns: ProColumns<DataSource>[] = [
        { title: '数据源名称', dataIndex: 'name', width: 180 },
        {
            title: '所属网关', dataIndex: ['gateway', 'name'], width: 150,
            render: (_, r) => r.gateway ? `${r.gateway.name} (${r.gateway.code})` : '-',
        },
        {
            title: '协议', dataIndex: 'protocol', width: 120,
            render: (_, r) => {
                const p = PROTOCOL_LABELS[r.protocol] || { label: r.protocol, color: 'default' };
                return <Tag color={p.color}>{p.label}</Tag>;
            },
        },
        { title: '采集周期(秒)', dataIndex: 'pollIntervalSecs', width: 110 },
        {
            title: '连接参数', dataIndex: 'connection', width: 250, ellipsis: true,
            render: (_, r) => {
                const text = formatConnection(r.connection);
                return <Tooltip title={text}><span>{text}</span></Tooltip>;
            },
        },
        { title: '状态', dataIndex: 'status', width: 80, render: (_, r) => <StatusIcon value={r.status} /> },
        {
            title: '操作', width: 100,
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onConfirm={async () => { await toDelete(record.id, true); loadData(); }} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable<DataSource>
                    columns={columns} rowKey="id" loading={loading} dataSource={dataList}
                    tableAlertRender={false} tableAlertOptionRender={false} search={false}
                    rowSelection={{ selectedRowKeys, onChange: (keys) => setSelectedRowKeys(keys) }}
                    cardProps={{ variant: 'borderless' } as any}
                    toolbar={{
                        title: (
                            <Space>
                                <Button color={'primary'} icon={<PlusOutlined />} variant={'outlined'} size={'small'} onClick={toCreate}>新建</Button>
                                <Button color={'danger'} icon={<DeleteOutlined />} disabled={selectedRowKeys.length === 0} size={'small'} variant={'outlined'}
                                    onClick={async () => { await toBatchDelete(selectedRowKeys as number[], true); setSelectedRowKeys([]); loadData(); }}>删除</Button>
                            </Space>
                        ),
                    }}
                    pagination={{ showSizeChanger: true, defaultPageSize: 20 }}
                />
            </ProPageContainer>
            <DataSourceForm visible={state?.dialogVisible || false} onCancel={() => setDialogVisible(false)}
                onSuccess={() => { setDialogVisible(false); loadData(); }} />
        </>
    );
};

export default Index;
