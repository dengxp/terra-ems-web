import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Tree, DatePicker, Select, Space, Tabs, Empty, Typography, Input, Splitter, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyTypes, EnergyType } from '@/apis/energyType';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import {
    getStatisticsSummary,
    getYoYAnalysis,
    getMoMAnalysis,
    EnergyStatisticsSummary,
    ComparisonAnalysis,
    StatisticsQueryParams,
} from '@/apis/statistics';
import StatisticsCard from './components/StatisticsCard';
import TrendChart from './components/TrendChart';
import ComparisonTable from './components/ComparisonTable';
import dayjs from 'dayjs';
import { ApartmentOutlined, BarChartOutlined, LineChartOutlined, SwapOutlined, RetweetOutlined, FireOutlined } from '@ant-design/icons';

const StatisticsPage: React.FC = () => {
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [energyTypes, setEnergyTypes] = useState<EnergyType[]>([]);
    const [selectedEnergyTypeId, setSelectedEnergyTypeId] = useState<number | null>(null);

    const { Title, Text } = Typography;

    const [summary, setSummary] = useState<EnergyStatisticsSummary | null>(null);
    const [yoyData, setYoyData] = useState<ComparisonAnalysis[]>([]);
    const [momData, setMomData] = useState<ComparisonAnalysis[]>([]);

    // 加载能源类型
    const fetchEnergyTypes = async () => {
        const res = await getEnabledEnergyTypes();
        if (res.success && res.data && res.data.length > 0) {
            setEnergyTypes(res.data);
            if (!selectedEnergyTypeId) {
                setSelectedEnergyTypeId(res.data[0].id);
            }
        }
    };

    useEffect(() => {
        fetchEnergyTypes();
    }, []);

    // 加载统计数据
    const fetchStatistics = async () => {
        if (!selectedUnitId || !selectedEnergyTypeId) return;

        setLoading(true);
        // 激进重置：每次查询前先清空旧数据，不仅是逻辑清空，也是 UI 视觉清空
        setSummary(null);
        setYoyData([]);
        setMomData([]);

        const params: StatisticsQueryParams & { _t: number } = {
            energyUnitId: selectedUnitId,
            parentUnitId: selectedUnitId,
            timeType,
            energyTypeId: selectedEnergyTypeId,
            dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
            _t: Date.now(),
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

            setYoyData(yoyRes.success ? (yoyRes.data || []) : []);
            setMomData(momRes.success ? (momRes.data || []) : []);
        } catch (error) {
            message.error('加载统计数据失败，请重试');
            console.error('Fetch Statistics Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatistics();
    }, [selectedUnitId, timeType, dataTime, selectedEnergyTypeId]);

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

    const currentEnergyType = useMemo(() => {
        return energyTypes.find(t => t.id === selectedEnergyTypeId);
    }, [energyTypes, selectedEnergyTypeId]);

    const unit = currentEnergyType?.unit || 'kWh';

    // Tab items for Ant Design 5.x
    const tabItems = useMemo(() => [
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
    ], [yoyData, momData, loading]);

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
                                        {selectedUnitName || '能耗统计分析'} <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>同比环比分析</Text>
                                    </Title>
                                </div>
                                <Space size="middle">
                                    <Select
                                        value={selectedEnergyTypeId}
                                        onChange={setSelectedEnergyTypeId}
                                        style={{ width: 140 }}
                                        placeholder="能源类型"
                                        suffixIcon={<FireOutlined />}
                                        options={energyTypes.map(t => ({ label: t.name, value: t.id }))}
                                    />
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
                            <Card variant="borderless">
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
                                            unit={unit}
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
                                            unit={unit}
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
                                            unit={unit}
                                            loading={loading}
                                        />
                                    </Col>
                                </Row>

                                {/* 趋势图表 */}
                                <Card size="small" style={{ marginBottom: 16 }}>
                                    <TrendChart
                                        data={summary?.trendData || []}
                                        title={`${selectedUnitName} - ${currentEnergyType?.name || ''}能耗趋势`}
                                        loading={loading}
                                        height={280}
                                        unit={unit}
                                    />
                                </Card>

                                {/* 对比分析表格 - 使用 energyTypeId 作为 key 确保能源切换时 Tabs 状态重置 */}
                                <Card size="small" variant="borderless">
                                    <Tabs
                                        key={selectedEnergyTypeId}
                                        items={tabItems}
                                        defaultActiveKey="yoy"
                                    />
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
