import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tree, List, Empty, Button, Space, message, Tag, Tooltip, Input, Splitter } from 'antd';
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
import { generateList, getParentKey } from '@/utils/tree';
import { EditButton, DeleteButton } from '@/components/button';
import ModalConfirm from '@/components/ModalConfirm';

const AlarmConfigPage: React.FC = () => {
    const actionRef = React.useRef<ActionType>();
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [points, setPoints] = useState<MeterPoint[]>([]);
    const [selectedPoint, setSelectedPoint] = useState<MeterPoint | null>(null);
    const [formVisible, setFormVisible] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<AlarmConfig>();
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

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
            const tree = mapTree(res.data || []);
            setTreeData(tree);
            // 默认展开所有节点
            const allKeys = generateList(tree).map((item) => item.key);
            setExpandedKeys(allKeys);
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

    // 扁平化后的数据列表，用于搜索
    const dataList = useMemo(() => generateList(treeData), [treeData]);

    // 搜索输入变化处理
    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchValue(value);
        const newExpandedKeys = dataList
            .map((item) => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, treeData);
                }
                return null;
            })
            .filter((item): item is React.Key => item !== null && item !== undefined);

        const uniqueKeys = Array.from(new Set(newExpandedKeys));

        if (uniqueKeys.length > 0) {
            setExpandedKeys(uniqueKeys);
            setAutoExpandParent(true);
        }
    };

    // 渲染带高亮和过滤的树节点
    const displayTreeData = useMemo(() => {
        const loop = (data: any[]): any[] =>
            data
                .map((item) => {
                    const strTitle = item.title as string;
                    const index = strTitle.indexOf(searchValue);

                    const beforeStr = strTitle.substring(0, index);
                    const afterStr = strTitle.slice(index + searchValue.length);

                    const title =
                        index > -1 ? (
                            <span key={item.key}>
                                {beforeStr}
                                <span style={{ color: '#f50' }}>{searchValue}</span>
                                {afterStr}
                            </span>
                        ) : (
                            <span key={item.key}>{strTitle}</span>
                        );

                    let children = item.children ? loop(item.children) : [];

                    if (index > -1 || children.length > 0) {
                        return {
                            ...item,
                            title,
                            children,
                        };
                    }

                    return null;
                })
                .filter(item => item !== null) as any[];

        return searchValue ? loop(treeData) : treeData;
    }, [searchValue, treeData]);

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

    const handleDelete = (id: number) => {
        ModalConfirm({
            title: '删除报警配置',
            content: '报警配置删除后将无法恢复，确定删除吗？',
            async onOk() {
                const res = await deleteAlarmConfig(id);
                if (res.success) {
                    message.success('删除成功');
                    actionRef.current?.reload();
                }
            }
        });
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
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => handleDelete(record.id)} />
                </Space>
            )
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
            <Splitter style={{ height: 'calc(100vh - 280px)' }}>
                {/* 用能单元树 */}
                <Splitter.Panel defaultSize="20%" min="15%" max="30%" style={{ overflow: 'hidden' }}>
                    <Card
                        title={<Space><ApartmentOutlined style={{ color: '#1890ff' }} />用能单元</Space>}
                        bordered={false}
                        size="small"
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        bodyStyle={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        className="custom-tree-card"
                    >
                        <Input.Search
                            placeholder="搜索用能单元"
                            onChange={onSearchChange}
                            allowClear
                            style={{ marginBottom: 8 }}
                        />
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {treeData.length > 0 ? (
                                <Tree
                                    treeData={displayTreeData}
                                    onSelect={(keys) => setSelectedUnitId(keys[0] as number)}
                                    blockNode
                                    showLine={{ showLeafIcon: false }}
                                    expandedKeys={expandedKeys}
                                    onExpand={(keys) => {
                                        setExpandedKeys(keys);
                                        setAutoExpandParent(false);
                                    }}
                                    autoExpandParent={autoExpandParent}
                                    selectedKeys={selectedUnitId ? [selectedUnitId] : []}
                                />
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>
                    </Card>
                </Splitter.Panel>

                {/* 中间采集点列表 */}
                <Splitter.Panel defaultSize="400px" min="300px" max="600px" style={{ overflow: 'hidden', paddingLeft: '16px' }}>
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
                </Splitter.Panel>

                {/* 预报警配置 */}
                <Splitter.Panel style={{ overflow: 'hidden', paddingLeft: '16px' }}>
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
                </Splitter.Panel>
            </Splitter>

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
