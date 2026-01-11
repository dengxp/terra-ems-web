import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Tree, DatePicker, Select, Space, Empty } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import {
    getComprehensiveSummary,
    EnergyStatisticsSummary,
} from '@/apis/statistics';
import StatisticsCard from '../components/StatisticsCard';
import TrendChart from '../components/TrendChart';
import ProportionChart from '../components/ProportionChart';
import dayjs from 'dayjs';
import { DatabaseOutlined, LineChartOutlined, DashboardOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const ComprehensivePage: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState<EnergyStatisticsSummary | null>(null);

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
            if (res.data && res.data.length > 0 && !selectedUnitId) {
                setSelectedUnitId(res.data[0].id);
                setSelectedUnitName(res.data[0].name);
            }
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    const fetchStatistics = async () => {
        if (!selectedUnitId) return;
        setLoading(true);
        try {
            const res = await getComprehensiveSummary({
                energyUnitId: selectedUnitId,
                timeType,
                dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
            });
            if (res.success) {
                setSummary(res.data || null);
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

    return (
        <PageContainer ghost title={false}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
                {/* 左侧树 */}
                <div style={{ width: '280px', flexShrink: 0 }}>
                    <Card
                        title={<Title level={5} style={{ margin: 0 }}><DatabaseOutlined style={{ marginRight: 8 }} />用能单元</Title>}
                        bordered={false}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        bodyStyle={{ padding: '12px', flex: 1, overflow: 'auto' }}
                        className="custom-tree-card"
                    >
                        {treeData.length > 0 ? (
                            <Tree
                                treeData={treeData}
                                onSelect={handleTreeSelect}
                                blockNode
                                defaultExpandAll
                                selectedKeys={selectedUnitId ? [selectedUnitId] : []}
                            />
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </div>

                {/* 右侧内容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* 头部过滤器卡片 */}
                    <Card bordered={false} bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                                <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                    {selectedUnitName || '综合能耗分析'} <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>能源消费总量分析 (tce)</Text>
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
                                    picker={timeType === 'DAY' ? 'date' : timeType === 'MONTH' ? 'month' : 'year'}
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
                            <Row gutter={16} style={{ marginBottom: 16 }}>
                                <Col span={8}>
                                    <StatisticsCard
                                        title="总折标煤耗"
                                        value={summary?.currentTotal || 0}
                                        unit="tce"
                                        loading={loading}
                                    />
                                </Col>
                                <Col span={8}>
                                    <StatisticsCard
                                        title="折标煤耗同比"
                                        value={summary?.currentTotal || 0}
                                        compareValue={summary?.lastYearTotal}
                                        changeRate={summary?.yoyRate}
                                        unit="tce"
                                        loading={loading}
                                    />
                                </Col>
                                <Col span={8}>
                                    <StatisticsCard
                                        title="折标煤耗环比"
                                        value={summary?.currentTotal || 0}
                                        compareValue={summary?.lastPeriodTotal}
                                        changeRate={summary?.momRate}
                                        unit="tce"
                                        loading={loading}
                                    />
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col span={14}>
                                    <Card size="small" title="能耗趋势 (tce)">
                                        <TrendChart
                                            data={summary?.trendData || []}
                                            unit="tce"
                                            height={320}
                                            loading={loading}
                                        />
                                    </Card>
                                </Col>
                                <Col span={10}>
                                    <Card size="small" title="能源结构分布">
                                        <ProportionChart
                                            data={summary?.energyTypeDistribution || []}
                                            height={320}
                                            loading={loading}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default ComprehensivePage;
