import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Tree, DatePicker, Select, Space, Tabs, Empty, Typography, Input, Splitter } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { generateList, getParentKey } from '@/utils/tree';
import {
    getStatisticsSummary,
    getYoYAnalysis,
    getMoMAnalysis,
    EnergyStatisticsSummary,
    ComparisonAnalysis,
} from '@/apis/statistics';
import StatisticsCard from './components/StatisticsCard';
import TrendChart from './components/TrendChart';
import ComparisonTable from './components/ComparisonTable';
import dayjs from 'dayjs';
import { ApartmentOutlined, BarChartOutlined, LineChartOutlined, SwapOutlined, RetweetOutlined } from '@ant-design/icons';

const StatisticsPage: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const { Title, Text } = Typography;

    const [summary, setSummary] = useState<EnergyStatisticsSummary | null>(null);
    const [yoyData, setYoyData] = useState<ComparisonAnalysis[]>([]);
    const [momData, setMomData] = useState<ComparisonAnalysis[]>([]);

    // 加载用能单元树
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
            if (res.data && res.data.length > 0 && !selectedUnitId) {
                setSelectedUnitId(res.data[0].id);
                setSelectedUnitName(res.data[0].name);
            }
        }
    };

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

    useEffect(() => {
        fetchTree();
    }, []);

    // 加载统计数据
    const fetchStatistics = async () => {
        if (!selectedUnitId) return;

        setLoading(true);
        const params = {
            energyUnitId: selectedUnitId,
            parentUnitId: selectedUnitId,
            timeType,
            dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
        };

        try {
            const [summaryRes, yoyRes, momRes] = await Promise.all([
                getStatisticsSummary(params),
                getYoYAnalysis(params),
                getMoMAnalysis(params),
            ]);

            if (summaryRes.success) {
                setSummary(summaryRes.data || null);
            }
            if (yoyRes.success) {
                setYoyData(yoyRes.data || []);
            }
            if (momRes.success) {
                setMomData(momRes.data || []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [selectedUnitId, timeType, dataTime]);

    const handleTreeSelect = (selectedKeys: React.Key[], info: any) => {
        if (selectedKeys.length > 0) {
            setSelectedUnitId(selectedKeys[0] as number);
            setSelectedUnitName(info.node.title || '');
        }
    };

    const getPickerType = () => {
        switch (timeType) {
            case 'DAY':
                return 'date';
            case 'MONTH':
                return 'month';
            case 'YEAR':
                return 'year';
            default:
                return 'month';
        }
    };

    // Tab items for Ant Design 5.x
    const tabItems = [
        {
            key: 'yoy',
            label: (
                <span>
                    <SwapOutlined /> 同比分析
                </span>
            ),
            children: (
                <ComparisonTable
                    data={yoyData}
                    type="yoy"
                    loading={loading}
                />
            ),
        },
        {
            key: 'mom',
            label: (
                <span>
                    <RetweetOutlined /> 环比分析
                </span>
            ),
            children: (
                <ComparisonTable
                    data={momData}
                    type="mom"
                    loading={loading}
                />
            ),
        },
    ];

    return (
        <PageContainer ghost title={false}>
            <Splitter>
                {/* 左侧树 */}
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
                                    onSelect={handleTreeSelect}
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

                {/* 右侧内容 */}
                <Splitter.Panel style={{ overflow: 'hidden', paddingLeft: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        {/* 头部过滤器卡片 */}
                        <Card bordered={false} bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                        {selectedUnitName || '能耗统计分析'} <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>多维对标分析</Text>
                                    </Title>
                                </div>
                                <Space size="middle">
                                    <Select
                                        value={timeType}
                                        onChange={setTimeType}
                                        style={{ width: 100 }}
                                        options={[
                                            { label: '按日', value: 'DAY' },
                                            { label: '按月', value: 'MONTH' },
                                            { label: '按年', value: 'YEAR' },
                                        ]}
                                    />
                                    <DatePicker
                                        value={dataTime}
                                        onChange={(date) => date && setDataTime(date)}
                                        picker={getPickerType()}
                                        allowClear={false}
                                    />
                                </Space>
                            </div>
                        </Card>

                        {!selectedUnitId ? (
                            <Card bordered={false}>
                                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                                    <Empty description="请从左侧选择一个用能单元开始分析" />
                                </div>
                            </Card>
                        ) : (
                            <div style={{ minHeight: 'calc(100vh - 300px)' }}>
                                {/* 统计卡片 - 固定高度确保对齐 */}
                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={8}>
                                        <StatisticsCard
                                            title="当期能耗"
                                            value={summary?.currentTotal || 0}
                                            unit="kWh"
                                            loading={loading}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <StatisticsCard
                                            title="同比分析"
                                            value={summary?.currentTotal || 0}
                                            compareValue={summary?.lastYearTotal}
                                            compareLabel="去年同期"
                                            changeRate={summary?.yoyRate}
                                            unit="kWh"
                                            loading={loading}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <StatisticsCard
                                            title="环比分析"
                                            value={summary?.currentTotal || 0}
                                            compareValue={summary?.lastPeriodTotal}
                                            compareLabel="上期"
                                            changeRate={summary?.momRate}
                                            unit="kWh"
                                            loading={loading}
                                        />
                                    </Col>
                                </Row>

                                {/* 趋势图表 */}
                                <Card size="small" style={{ marginBottom: 16 }}>
                                    <TrendChart
                                        data={summary?.trendData || []}
                                        title={`${selectedUnitName} - 能耗趋势`}
                                        loading={loading}
                                        height={280}
                                    />
                                </Card>

                                {/* 对比分析表格 */}
                                <Card size="small" bordered={false}>
                                    <Tabs defaultActiveKey="yoy" items={tabItems} />
                                </Card>
                            </div>
                        )}
                    </div>
                </Splitter.Panel>
            </Splitter>
        </PageContainer>
    );
};

export default StatisticsPage;
