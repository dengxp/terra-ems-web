import {
  EnergyStatisticsSummary, getComprehensiveSummary
} from '@/apis/statistics';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, DatePicker, Empty, Row, Select, Space, Splitter, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import ProportionChart from '../components/ProportionChart';
import StatisticsCard from '../components/StatisticsCard';
import TrendChart from '../components/TrendChart';

const { Title, Text } = Typography;

const ComprehensivePage: React.FC = () => {
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState<EnergyStatisticsSummary | null>(null);

    // 移除 redundant fetchTree useEffect

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


    return (
        <PageContainer ghost title={false}>
            <Splitter>
                <Splitter.Panel defaultSize="20%" min="15%" max="30%" style={{ overflow: 'hidden' }}>
                    <EnergyUnitTree
                        selectedUnitId={selectedUnitId}
                        onSelect={(id, name) => {
                            setSelectedUnitId(id);
                            setSelectedUnitName(name);
                        }}
                    />
                </Splitter.Panel>

                {/* 右侧内容 */}
                <Splitter.Panel style={{ overflow: 'hidden', paddingLeft: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        {/* 头部过滤器卡片 */}
                        <Card variant="borderless" styles={{ body: { padding: '16px' } }} style={{ marginBottom: 16 }}>
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
                            <Card variant="borderless">
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
                </Splitter.Panel>
            </Splitter>
        </PageContainer>
    );
};

export default ComprehensivePage;
