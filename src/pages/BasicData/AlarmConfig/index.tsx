import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Tree, List, Empty, Button, Space, message, Tag, Popconfirm, Tooltip } from 'antd';
import { PageContainer, ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { getMeterPointsByEnergyUnitId, MeterPoint } from '@/apis/meterPoint';
import { getAlarmConfigsByMeterPoint, deleteAlarmConfig, AlarmConfig } from '@/apis/alarm';
import {
    PlusOutlined,
    ApartmentOutlined,
    UnorderedListOutlined,
    SettingOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import AlarmConfigForm from './components/AlarmConfigForm';

const AlarmConfigPage: React.FC = () => {
    const actionRef = React.useRef<ActionType>();
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [points, setPoints] = useState<MeterPoint[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<MeterPoint | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<AlarmConfig>();

    // Fetch tree data
    const fetchTree = async () => {
        const res = await getEnabledEnergyUnitTree();
        if (res.success) {
            const mapTree = (data: EnergyUnit[]): any[] =>
                data.map((item) => ({
                    title: item.name,
                    key: item.id,
                    children: item.children && item.children.length > 0 ? mapTree(item.children) : undefined,
                }));
            setTreeData(mapTree(res.data || []));
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    // When unit is selected, fetch points
    useEffect(() => {
        if (selectedUnitId) {
            getMeterPointsByEnergyUnitId(selectedUnitId).then((res) => {
                if (res.success) setPoints(res.data || []);
            });
            setSelectedPoint(null);
        }
    }, [selectedUnitId]);

    const handleAdd = () => {
        if (!selectedPoint) {
            message.warning('请先选择采集点位');
            return;
        }
        setIsEdit(false);
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: AlarmConfig) => {
        setIsEdit(true);
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const handleDelete = async (id: number) => {
        const res = await deleteAlarmConfig(id);
        if (res.success) {
            message.success('删除成功');
            actionRef.current?.reload();
        }
    };

    const columns: ProColumns<AlarmConfig>[] = [
        {
            title: '限值类型',
            dataIndex: ['alarmLimitType', 'limitName'],
            render: (_, record) => (
                <Space>
                    <div
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: record.alarmLimitType?.colorNumber || '#ccc',
                            boxShadow: `0 0 4px ${record.alarmLimitType?.colorNumber || '#ccc'}`
                        }}
                    />
                    <span>{record.alarmLimitType?.limitName}</span>
                </Space>
            )
        },
        {
            title: '比较逻辑',
            render: (_, record) => (
                <Tag color="blue">
                    {record.alarmLimitType?.comparatorOperator} {record.limitValue}
                </Tag>
            )
        },
        {
            title: '状态',
            dataIndex: 'isEnabled',
            width: 80,
            render: (val) => (
                <Tag color={val ? 'success' : 'default'}>
                    {val ? '已启用' : '已禁用'}
                </Tag>
            )
        },
        {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 100,
            render: (_, record) => [
                <a key="edit" onClick={() => handleEdit(record)}>编辑</a>,
                <Popconfirm key="delete" title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
                    <a style={{ color: '#ff4d4f' }}>删除</a>
                </Popconfirm>
            ]
        }
    ];

    // 卡片标题渲染
    const CardTitle = ({ icon, title }: { icon: React.ReactNode; title: React.ReactNode }) => (
        <Space size={8}>
            <span style={{ color: '#1890ff' }}>{icon}</span>
            <span>{title}</span>
        </Space>
    );

    return (
        <PageContainer title={false} style={{ paddingBottom: 0 }}>
            <Row gutter={12} style={{ height: 'calc(100vh - 280px)' }}>
                {/* 用能单元树 */}
                <Col span={6} style={{ height: '100%' }}>
                    <Card
                        title={<CardTitle icon={<ApartmentOutlined />} title="用能单元树" />}
                        size="small"
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        styles={{ body: { flex: 1, overflow: 'auto', padding: '8px' } }}
                    >
                        {treeData.length > 0 ? (
                            <Tree
                                treeData={treeData}
                                onSelect={(keys) => setSelectedUnitId(keys[0] as number)}
                                blockNode
                                showLine={{ showLeafIcon: false }}
                                defaultExpandAll
                            />
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用能单元" />
                        )}
                    </Card>
                </Col>

                {/* 采集点位列表 */}
                <Col span={6} style={{ height: '100%' }}>
                    <Card
                        title={<CardTitle icon={<UnorderedListOutlined />} title="采集点位列表" />}
                        size="small"
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        styles={{ body: { flex: 1, overflow: 'auto', padding: 0 } }}
                    >
                        {points.length > 0 ? (
                            <List
                                dataSource={points}
                                size="small"
                                renderItem={(item) => {
                                    const isSelected = selectedPoint?.id === item.id;
                                    return (
                                        <List.Item
                                            onClick={() => setSelectedPoint(item)}
                                            style={{
                                                cursor: 'pointer',
                                                padding: '10px 12px',
                                                backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                                                borderLeft: isSelected ? '3px solid #1890ff' : '3px solid transparent',
                                                borderBottom: '1px solid #f0f0f0',
                                                transition: 'all 0.2s ease',
                                            }}
                                            className="point-list-item"
                                        >
                                            <List.Item.Meta
                                                title={
                                                    <span style={{
                                                        fontSize: 13,
                                                        fontWeight: isSelected ? 500 : 400,
                                                        color: isSelected ? '#1890ff' : 'rgba(0,0,0,0.85)'
                                                    }}>
                                                        {item.name}
                                                    </span>
                                                }
                                                description={
                                                    <span style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                                                        {item.code}
                                                    </span>
                                                }
                                            />
                                        </List.Item>
                                    );
                                }}
                            />
                        ) : (
                            <div style={{ padding: '40px 0', textAlign: 'center' }}>
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <span style={{ color: 'rgba(0,0,0,0.45)' }}>
                                            {selectedUnitId ? "该单元下暂无采集点位" : "请先选择用能单元"}
                                        </span>
                                    }
                                />
                            </div>
                        )}
                    </Card>
                </Col>

                {/* 预报警配置 */}
                <Col span={12} style={{ height: '100%' }}>
                    <Card
                        title={
                            <CardTitle
                                icon={<SettingOutlined />}
                                title={
                                    selectedPoint
                                        ? <Tooltip title={selectedPoint.name}>
                                            <span>预报警配置: {selectedPoint.name.length > 10 ? selectedPoint.name.slice(0, 10) + '...' : selectedPoint.name}</span>
                                        </Tooltip>
                                        : '预报警配置'
                                }
                            />
                        }
                        size="small"
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        styles={{ body: { flex: 1, overflow: 'auto', padding: 0 } }}
                        extra={
                            <Button
                                type="text"
                                size="small"
                                icon={<PlusOutlined />}
                                onClick={handleAdd}
                                disabled={!selectedPoint}
                                style={{ color: selectedPoint ? '#1890ff' : undefined }}
                            >
                                新增配置
                            </Button>
                        }
                    >
                        {selectedPoint ? (
                            <ProTable<AlarmConfig>
                                actionRef={actionRef}
                                columns={columns}
                                rowKey="id"
                                search={false}
                                options={false}
                                pagination={false}
                                request={async () => {
                                    const res = await getAlarmConfigsByMeterPoint(selectedPoint.id);
                                    return {
                                        data: res.data || [],
                                        success: res.success,
                                    };
                                }}
                                params={{ pointId: selectedPoint.id }}
                            />
                        ) : (
                            <div style={{ padding: '60px 0', textAlign: 'center' }}>
                                <ThunderboltOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
                                <div style={{ color: 'rgba(0,0,0,0.45)' }}>请从左侧选择一个采集点位开始配置</div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>

            <AlarmConfigForm
                visible={formVisible}
                onVisibleChange={setFormVisible}
                isEdit={isEdit}
                currentRecord={currentRecord}
                point={selectedPoint}
                onSuccess={() => actionRef.current?.reload()}
            />

            <style>{`
                .point-list-item:hover {
                    background-color: #fafafa !important;
                }
            `}</style>
        </PageContainer>
    );
};

export default AlarmConfigPage;
