import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Tree, DatePicker, Select, Space, Empty, Spin, Typography, Input, Splitter } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnergyTypeOptions } from '@/apis/energyType';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import { getProductOptions } from '@/apis/product';
import {
    getUnitConsumptionAnalysis,
    UnitConsumption,
} from '@/apis/statistics';
import StatisticsCard from '../components/StatisticsCard';
import UnitConsumptionTrendChart from './components/UnitConsumptionTrendChart';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const UnitConsumptionPage: React.FC = () => {
    const [energyTypeOptions, setEnergyTypeOptions] = useState<API.Option[]>([]);
    const [productOptions, setProductOptions] = useState<API.Option[]>([]);

    // 筛选状态
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [selectedEnergyType, setSelectedEnergyType] = useState<number | undefined>(undefined);
    const [selectedProductId, setSelectedProductId] = useState<number | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<UnitConsumption | null>(null);

    // 加载能源类型选项
    useEffect(() => {
        getEnergyTypeOptions().then(res => {
            if (res.success) {
                setEnergyTypeOptions(res.data || []);
            }
        });
    }, []);

    // 加载产品列表
    useEffect(() => {
        getProductOptions().then(res => {
            if (res.success && res.data) {
                setProductOptions(res.data);
            }
        });
    }, []);

    // 加载分析数据
    const fetchAnalysis = async () => {
        if (!selectedUnitId) return;

        setLoading(true);
        try {
            const res = await getUnitConsumptionAnalysis({
                energyUnitId: selectedUnitId,
                timeType,
                dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
                energyTypeId: selectedEnergyType,
                productId: selectedProductId,
            });

            if (res.success) {
                setData(res.data || null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [selectedUnitId, timeType, dataTime, selectedEnergyType, selectedProductId]);

    const getPickerType = () => {
        switch (timeType) {
            case 'DAY': return 'date';
            case 'MONTH': return 'month';
            case 'YEAR': return 'year';
            default: return 'month';
        }
    };

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
                                        {selectedUnitName || '产品单耗分析'} <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>单位产品能耗水平分析</Text>
                                    </Title>
                                </div>
                                <Space wrap size="middle">
                                    <Space>
                                        <Text type="secondary">能源：</Text>
                                        <Select
                                            placeholder="全部能源(折标)"
                                            allowClear
                                            style={{ width: 140 }}
                                            value={selectedEnergyType}
                                            onChange={setSelectedEnergyType}
                                            options={energyTypeOptions}
                                        />
                                    </Space>
                                    <Space>
                                        <Text type="secondary">产品：</Text>
                                        <Select
                                            placeholder="全部产品"
                                            allowClear
                                            style={{ width: 120 }}
                                            value={selectedProductId}
                                            onChange={setSelectedProductId}
                                            options={productOptions}
                                        />
                                    </Space>
                                    <Select
                                        value={timeType}
                                        onChange={(v) => { setTimeType(v); setDataTime(dayjs()); }}
                                        style={{ width: 80 }}
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
                            <Spin spinning={loading}>
                                <div style={{ minHeight: 'calc(100vh - 300px)' }}>
                                    {/* 核心指标 */}
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={8}>
                                            <StatisticsCard
                                                title="当前单位能耗"
                                                value={data?.unitConsumption || 0}
                                                unit={selectedEnergyType ? 'kW·h/t' : 'tce/t'}
                                                loading={loading}
                                                precision={4}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <StatisticsCard
                                                title="单耗同比"
                                                value={data?.unitConsumption || 0}
                                                compareValue={data?.lastYearUnitConsumption}
                                                compareLabel="去年同期"
                                                changeRate={data?.yoyRate}
                                                unit={selectedEnergyType ? 'kW·h/t' : 'tce/t'}
                                                loading={loading}
                                                precision={4}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <StatisticsCard
                                                title="单耗环比"
                                                value={data?.unitConsumption || 0}
                                                compareValue={data?.lastPeriodUnitConsumption}
                                                compareLabel="上期"
                                                changeRate={data?.momRate}
                                                unit={selectedEnergyType ? 'kW·h/t' : 'tce/t'}
                                                loading={loading}
                                                precision={4}
                                            />
                                        </Col>
                                    </Row>

                                    {/* 辅助指标 */}
                                    <Row gutter={16} style={{ marginBottom: 16 }}>
                                        <Col span={12}>
                                            <Card size="small" style={{ backgroundColor: '#fcfcfc' }}>
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <Text type="secondary">本期综合能耗</Text>
                                                    <Title level={4} style={{ margin: 0 }}>
                                                        {(data?.energyConsumption ?? 0).toFixed(2)} <Text type="secondary" style={{ fontSize: 14 }}>{data?.energyUnit || 'tce'}</Text>
                                                    </Title>
                                                </Space>
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card size="small" style={{ backgroundColor: '#fcfcfc' }}>
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <Text type="secondary">本期总产量</Text>
                                                    <Title level={4} style={{ margin: 0 }}>
                                                        {(data?.production ?? 0).toFixed(2)} <Text type="secondary" style={{ fontSize: 14 }}>{data?.productionUnit || 't'}</Text>
                                                    </Title>
                                                </Space>
                                            </Card>
                                        </Col>
                                    </Row>

                                    {/* 趋势图表 */}
                                    <Card size="small">
                                        <UnitConsumptionTrendChart
                                            data={data?.trendData || []}
                                            energyUnit={data?.energyUnit}
                                            productionUnit={data?.productionUnit}
                                            title={`${selectedUnitName} - 单耗与能耗对比趋势`}
                                            loading={loading}
                                        />
                                    </Card>
                                </div>
                            </Spin>
                        )}
                    </div>
                </Splitter.Panel>
            </Splitter>
        </PageContainer>
    );
};

export default UnitConsumptionPage;
