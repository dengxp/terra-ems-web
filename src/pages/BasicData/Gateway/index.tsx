import { getGateways, getGatewayOnlineStatus, Gateway, GatewayOnlineInfo } from '@/apis/gateway';
import { getDataSourcesByGatewayId, DataSource } from '@/apis/dataSource';
import { DeleteButton, EditButton, IconButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import StatusIcon from '@/components/icons/StatusIcon';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DatabaseOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Badge, Button, Card, Drawer, Empty, Flex, Space, Spin, Tag, Typography } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import GatewayForm from './components/GatewayForm';

const PROTOCOL_LABELS: Record<string, { label: string; color: string }> = {
    'modbus-tcp': { label: 'Modbus TCP', color: 'blue' },
    'modbus-rtu': { label: 'Modbus RTU', color: 'cyan' },
    'mqtt': { label: 'MQTT', color: 'green' },
    'opc-ua': { label: 'OPC UA', color: 'purple' },
    'dlt645': { label: 'DL/T645', color: 'orange' },
    'http': { label: 'HTTP', color: 'geekblue' },
    'bacnet-ip': { label: 'BACnet/IP', color: 'magenta' },
};

const CONN_PARAM_LABELS: Record<string, string> = {
    port: '端口号',
    baudRate: '波特率',
    dataBits: '数据位',
    stopBits: '停止位',
    parity: '校验方式',
    host: '主机地址',
    topic: '主题',
    qos: 'QoS',
    url: '地址',
};

const parseConnection = (conn?: string): Record<string, any> => {
    if (!conn) return {};
    try {
        return typeof conn === 'string' ? JSON.parse(conn) : conn;
    } catch { return {}; }
};

const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<Gateway[]>([]);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [drawerGateway, setDrawerGateway] = useState<Gateway | null>(null);
    const [dataSources, setDataSources] = useState<DataSource[]>([]);
    const [dsLoading, setDsLoading] = useState(false);
    const [onlineStatus, setOnlineStatus] = useState<Record<string, GatewayOnlineInfo>>({});
    const timerRef = useRef<ReturnType<typeof setInterval>>();

    const fetchOnlineStatus = useCallback(async () => {
        try {
            const res = await getGatewayOnlineStatus();
            if (res.success) setOnlineStatus(res.data || {});
        } catch {}
    }, []);

    useEffect(() => {
        fetchOnlineStatus();
        timerRef.current = setInterval(fetchOnlineStatus, 30000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [fetchOnlineStatus]);

    const {
        getState, formRef, actionRef, toCreate, toEdit, toDelete, toBatchDelete, setDialogVisible, setShouldRefresh,
    } = useCrud<Gateway>({ pathname: '/basic-data/gateway', entityName: '网关', baseUrl: '/api/gateways' });

    const state = getState('/basic-data/gateway');

    useEffect(() => {
        if (state?.shouldRefresh) { actionRef.current?.reload(); setShouldRefresh(false); }
    }, [state?.shouldRefresh]);

    const handleViewDataSources = async (gateway: Gateway) => {
        setDrawerGateway(gateway);
        setDrawerVisible(true);
        setDsLoading(true);
        try {
            const res = await getDataSourcesByGatewayId(gateway.id);
            if (res.success) setDataSources(res.data || []);
        } finally { setDsLoading(false); }
    };

    const columns: ProColumns<Gateway>[] = [
        {
            title: '网关名称', dataIndex: 'name', width: 170,
            filters: [
                { text: '在线', value: 'online' },
                { text: '离线', value: 'offline' },
            ],
            onFilter: (value, r) => {
                const isOnline = onlineStatus[r.code]?.online === true;
                return value === 'online' ? isOnline : !isOnline;
            },
            render: (_, r) => {
                const isOnline = onlineStatus[r.code]?.online === true;
                return <Badge color={isOnline ? 'green' : 'grey'} status={isOnline ? 'processing' : 'default'} text={r.name} />;
            },
        },
        { title: '网关编码', dataIndex: 'code', width: 120 },
        { title: '规格型号', dataIndex: 'model', width: 120, hideInSearch: true },
        { title: 'IP 地址', dataIndex: 'ipAddress', width: 130, hideInSearch: true },
        { title: '安装位置', dataIndex: 'installLocation', width: 150, hideInSearch: true, ellipsis: true },
        {
            title: '所属用能单元', dataIndex: ['energyUnit', 'name'], width: 130, hideInSearch: true,
            render: (_, r) => r.energyUnit?.name || '-',
        },
        { title: '状态', dataIndex: 'status', width: 80, hideInSearch: true, render: (_, r) => <StatusIcon value={r.status} /> },
        {
            title: '操作', width: 130, hideInSearch: true,
            render: (_, record) => (
                <Space>
                    <IconButton
                        icon={<DatabaseOutlined />}
                        tooltip="数据源"
                        onClick={() => handleViewDataSources(record)}
                    />
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

            {/* 数据源抽屉 */}
            <Drawer
                title={`数据源 — ${drawerGateway?.name || ''}`}
                open={drawerVisible}
                onClose={() => setDrawerVisible(false)}
                width={460}
            >
                {dsLoading ? (
                    <Flex justify="center" align="center" style={{ height: 200 }}><Spin /></Flex>
                ) : dataSources.length === 0 ? (
                    <Empty description="该网关下暂无数据源" />
                ) : (
                    <Flex vertical gap={12}>
                        {dataSources.map((item) => {
                            const connParams = parseConnection(item.connection);
                            const proto = PROTOCOL_LABELS[item.protocol] || { label: item.protocol, color: 'default' };
                            return (
                                <Card
                                    key={item.id}
                                    size="small"
                                    title={
                                        <Flex justify="space-between" align="center">
                                            <span>{item.name}</span>
                                            <Tag color={proto.color} style={{ marginRight: 0 }}>{proto.label}</Tag>
                                        </Flex>
                                    }
                                    styles={{ body: { padding: '8px 16px' } }}
                                >
                                    <Flex vertical gap={4}>
                                        <Flex justify="space-between">
                                            <Typography.Text type="secondary">采集周期</Typography.Text>
                                            <span>{item.pollIntervalSecs || '-'} 秒</span>
                                        </Flex>
                                        {Object.entries(connParams).map(([key, val]) => (
                                            <Flex key={key} justify="space-between">
                                                <Typography.Text type="secondary">{CONN_PARAM_LABELS[key] || key}</Typography.Text>
                                                <span>{String(val)}</span>
                                            </Flex>
                                        ))}
                                    </Flex>
                                </Card>
                            );
                        })}
                    </Flex>
                )}
            </Drawer>
        </>
    );
};

export default Index;
