import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Tree, DatePicker, Select, Space, Empty, Spin, Table, Typography, Input, Splitter } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { generateList, getParentKey } from '@/utils/tree';
import { getEnabledEnergyTypes, EnergyType } from '@/apis/energyType';
import {
    getProcessEnergyAnalysis,
    ProcessEnergyAnalysis,
    TimeSlotEnergy
} from '@/apis/statistics';
import StatisticsCard from '../components/StatisticsCard';
import ProcessEnergyPieChart from './components/ProcessEnergyPieChart';
import ProcessEnergyTrendChart from './components/ProcessEnergyTrendChart';
import dayjs from 'dayjs';
import { ApartmentOutlined, PartitionOutlined, PieChartOutlined, LineChartOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const ProcessEnergyPage: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [energyTypes, setEnergyTypes] = useState<EnergyType[]>([]);

    // 筛选状态
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('DAY');
    const [dataTime, setDataTime] = useState(dayjs());
    const [selectedEnergyType, setSelectedEnergyType] = useState<number | undefined>(undefined);

    // 数据状态
    const [loading, setLoading] = useState<boolean>(false);
    const [analysisData, setAnalysisData] = useState<ProcessEnergyAnalysis[]>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    // 初始化数据
    useEffect(() => {
        getEnabledEnergyUnitTree().then((res) => {
            if (res.success) {
                const convertData = (data: any[]): any[] => {
                    return data.map((item) => ({
                        title: item.name,
                        key: item.id,
                        children: item.children ? convertData(item.children) : [],
                    }));
                };
                const tree = convertData(res.data);
                setTreeData(tree);
                // 默认展开所有节点
                const allKeys = generateList(tree).map((item) => item.key);
                setExpandedKeys(allKeys);
                if (tree.length > 0) {
                    setSelectedUnitId(tree[0].id);
                    setSelectedUnitName(tree[0].name);
                }
            }
        });

        getEnabledEnergyTypes().then((res) => {
            if (res.success) {
                setEnergyTypes(res.data);
            }
        });
    }, []);

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

    // 加载分析数据
    const loadData = async () => {
        if (!selectedUnitId) return;

        setLoading(true);
        try {
            const res = await getProcessEnergyAnalysis({
                parentUnitId: selectedUnitId,
                timeType,
                dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
                energyTypeId: selectedEnergyType,
            });

            if (res.success) {
                setAnalysisData(res.data);
                // 默认选择第一行以展示趋势
                if (res.data.length > 0) {
                    setSelectedRowKeys([res.data[0].energyUnitId]);
                } else {
                    setSelectedRowKeys([]);
                }
            }
        } catch (error) {
            console.error('Failed to load process energy analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [selectedUnitId, timeType, dataTime, selectedEnergyType]);

    // 计算汇总数据
    const totalConsumption = analysisData.reduce((sum, item) => sum + item.totalConsumption, 0);
    const unit = analysisData.length > 0 ? analysisData[0].unit : (selectedEnergyType ? 't' : 'tce');

    // 格式化饼图数据
    const pieData = analysisData.map(item => ({
        name: item.energyUnitName,
        value: item.totalConsumption,
    }));

    // 格式化趋势图数据
    const trendData = analysisData
        .filter(item => selectedRowKeys.includes(item.energyUnitId))
        .flatMap(item => item.timeSlotData.map(slot => ({
            label: slot.label,
            value: slot.value,
            name: item.energyUnitName
        })));

    // 表格列定义
    const columns = [
        {
            title: '用能单元',
            dataIndex: 'energyUnitName',
            key: 'energyUnitName',
        },
        {
            title: `消耗量 (${unit})`,
            dataIndex: 'totalConsumption',
            key: 'totalConsumption',
            align: 'right' as const,
            render: (val: number) => <Text strong>{val.toFixed(2)}</Text>,
            sorter: (a: any, b: any) => a.totalConsumption - b.totalConsumption,
        },
        {
            title: '占比 (%)',
            dataIndex: 'percentage',
            key: 'percentage',
            align: 'right' as const,
            render: (val: number) => <Text type="secondary">{val.toFixed(2)}%</Text>,
            sorter: (a: any, b: any) => a.percentage - b.percentage,
        },
    ];

    return (
        <PageContainer ghost title={false}>
            <Splitter>
                {/* 左侧树形选择 - 固定宽度且自适应高度 */}
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
                                    blockNode
                                    showLine={{ showLeafIcon: false }}
                                    expandedKeys={expandedKeys}
                                    onExpand={(keys) => {
                                        setExpandedKeys(keys);
                                        setAutoExpandParent(false);
                                    }}
                                    autoExpandParent={autoExpandParent}
                                    selectedKeys={selectedUnitId ? [selectedUnitId] : []}
                                    onSelect={(keys, info: any) => {
                                        if (keys.length > 0) {
                                            setSelectedUnitId(keys[0] as number);
                                            setSelectedUnitName(info.node.rawData?.name || info.node.title);
                                        }
                                    }}
                                />
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>
                    </Card>
                </Splitter.Panel>

                {/* 右侧分析内容 - 自动填充剩余空间 */}
                <Splitter.Panel style={{ overflow: 'hidden', paddingLeft: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        {/* 头部过滤器卡片 */}
                        <Card bordered={false} bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                        {selectedUnitName} <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>工序能耗多维分析</Text>
                                    </Title>
                                </div>
                                <Space size="middle">
                                    <Select
                                        value={selectedEnergyType}
                                        placeholder="全部能源类型"
                                        allowClear
                                        style={{ width: 140 }}
                                        onChange={setSelectedEnergyType}
                                    >
                                        {energyTypes.map(type => (
                                            <Select.Option key={type.id} value={type.id}>{type.name}</Select.Option>
                                        ))}
                                    </Select>
                                    <Select value={timeType} onChange={setTimeType} style={{ width: 90 }}>
                                        <Select.Option value="DAY">按日</Select.Option>
                                        <Select.Option value="MONTH">按月</Select.Option>
                                        <Select.Option value="YEAR">按年</Select.Option>
                                    </Select>
                                    <DatePicker
                                        picker={timeType === 'DAY' ? 'date' : (timeType === 'MONTH' ? 'month' : 'year')}
                                        value={dataTime}
                                        allowClear={false}
                                        onChange={(val) => val && setDataTime(val)}
                                    />
                                </Space>
                            </div>
                        </Card>

                        {/* 统计指标 */}
                        <Row gutter={16} style={{ marginBottom: 16 }}>
                            <Col span={12}>
                                <StatisticsCard
                                    title="工序合计能耗"
                                    value={totalConsumption}
                                    unit={unit}
                                    icon={<PartitionOutlined />}
                                    color="#1890ff"
                                />
                            </Col>
                            <Col span={12}>
                                <StatisticsCard
                                    title="能耗核算单位"
                                    value={unit}
                                    isString
                                    icon={<DashboardOutlined />}
                                    color="#52c41a"
                                />
                            </Col>
                        </Row>

                        {/* 占比与列表 - 行对齐高度 */}
                        <Row gutter={16} style={{ marginBottom: 16 }} align="stretch">
                            <Col span={10} style={{ display: 'flex' }}>
                                <Card
                                    title={<span><PieChartOutlined style={{ marginRight: 8 }} />消耗占比</span>}
                                    bordered={false}
                                    style={{ width: '100%', display: 'flex', flexDirection: 'column' }}
                                    bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                                >
                                    <ProcessEnergyPieChart
                                        data={pieData}
                                        unit={unit}
                                        height={300}
                                        loading={loading}
                                    />
                                </Card>
                            </Col>
                            <Col span={14} style={{ display: 'flex' }}>
                                <Card
                                    title={<span><PartitionOutlined style={{ marginRight: 8 }} />数据详情</span>}
                                    bordered={false}
                                    style={{ width: '100%' }}
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <Table
                                        size="small"
                                        columns={columns}
                                        dataSource={analysisData}
                                        rowKey="energyUnitId"
                                        pagination={false}
                                        loading={loading}
                                        rowSelection={{
                                            type: 'checkbox',
                                            selectedRowKeys,
                                            onChange: (keys) => setSelectedRowKeys(keys),
                                        }}
                                        scroll={{ y: 300 }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* 趋势图 */}
                        <Card
                            title={<span><LineChartOutlined style={{ marginRight: 8 }} />能耗趋势对比</span>}
                            bordered={false}
                        >
                            <div style={{ padding: '0 8px' }}>
                                <ProcessEnergyTrendChart
                                    data={trendData}
                                    unit={unit}
                                    height={320}
                                    loading={loading}
                                />
                            </div>
                        </Card>
                    </div>
                </Splitter.Panel>
            </Splitter>
        </PageContainer>
    );
};

// 补全缺失的图标定义
const DashboardOutlined = (props: any) => (
    <span role="img" aria-label="dashboard" className="anticon anticon-dashboard" {...props}>
        <svg viewBox="64 64 896 896" focusable="false" data-icon="dashboard" width="1em" height="1em" fill="currentColor" aria-hidden="true">
            <path d="M924.8 385.6a446.7 446.7 0 00-96-142.4 446.7 446.7 0 00-142.4-96C631.1 123.8 572.5 112 512 112s-119.1 11.8-174.4 35.2a446.7 446.7 0 00-142.4 96 446.7 446.7 0 00-96 142.4C75.8 440.9 64 499.5 64 560c0 132.7 58.3 257.7 159.9 343.1l1.7 1.4c5.8 4.8 13.1 7.5 20.6 7.5h531.7c7.5 0 14.8-2.7 20.6-7.5l1.7-1.4C901.7 817.7 960 692.7 960 560c0-60.5-11.8-119.1-35.2-174.4zM761.4 832H262.6C181.5 753.3 136 658.3 136 560c0-99.9 40.7-194.6 114.6-262.3C318.3 231.4 412.3 192 512 192s193.7 39.4 261.4 105.7C847.3 365.4 888 460.1 888 560c0 98.3-45.5 193.3-126.6 272zM512 304c-141.4 0-256 114.6-256 256s114.6 256 256 256 256-114.6 256-256-114.6-256-256-256zm0 432c-97.2 0-176-78.8-176-176s78.8-176 176-176 176 78.8 176 176-78.8 176-176 176zm79.2-187.9l-112.5-40.9a32 32 0 00-42.5 42.5l40.9 112.5a32 32 0 0059.8-11.6l1.3-4.8 4.8-1.3a32 32 0 0048.2-96.4z"></path>
        </svg>
    </span>
);

export default ProcessEnergyPage;
