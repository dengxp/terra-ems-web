import React, { useState, useEffect } from 'react';
import {
    Card, Col, Row, DatePicker, Select, Space, Empty, Table, Statistic, Typography, Splitter
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer } from '@ant-design/pro-components';
import { Pie } from '@ant-design/plots';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import {
    getDailyAnalysis,
    getMonthlyAnalysis,
    getYearlyAnalysis,
    PeakValleyAnalysisResult,
    timePeriodTypeOptions,
    PeriodSummary,
} from '@/apis/peakValley';
import StatisticsCard from '../components/StatisticsCard';
import {
    DollarOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
import './index.less';

const PeakValleyPage: React.FC = () => {
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<PeakValleyAnalysisResult | null>(null);

    // 加载分析数据
    const fetchAnalysis = async () => {
        if (!selectedUnitId) return;

        setLoading(true);
        try {
            let res;
            switch (timeType) {
                case 'DAY':
                    res = await getDailyAnalysis(selectedUnitId, dataTime.format('YYYY-MM-DD'));
                    break;
                case 'MONTH':
                    res = await getMonthlyAnalysis(selectedUnitId, dataTime.format('YYYY-MM'));
                    break;
                case 'YEAR':
                    res = await getYearlyAnalysis(selectedUnitId, dataTime.year());
                    break;
            }
            if (res && res.success) {
                setAnalysisResult(res.data || null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalysis();
    }, [selectedUnitId, timeType, dataTime]);


    const getPickerType = () => {
        switch (timeType) {
            case 'DAY': return 'date';
            case 'MONTH': return 'month';
            case 'YEAR': return 'year';
            default: return 'month';
        }
    };

    // 获取时段颜色
    const getPeriodColor = (periodType: string) => {
        const option = timePeriodTypeOptions.find(o => o.value === periodType);
        return option?.color || '#999';
    };

    // 饼图配置
    const pieConfig: any = {
        data: analysisResult?.periodSummaries ? analysisResult.periodSummaries.map(item => ({
            type: item.periodName,
            value: item.electricity,
        })) : [],
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        label: {
            text: (d: any) => `${d.type}: ${Number(d.value || 0).toFixed(2)} kWh`,
            position: 'outside',
        },
        legend: {
            position: 'bottom' as const,
        },
        color: timePeriodTypeOptions.map(o => o.color),
    };

    // 表格列定义
    const columns: ColumnsType<PeriodSummary> = [
        {
            title: '时段',
            dataIndex: 'periodName',
            key: 'periodName',
            render: (text: string, record: PeriodSummary) => (
                <span style={{ color: getPeriodColor(record.periodType), fontWeight: 'bold' }}>
                    {text}
                </span>
            ),
        },
        {
            title: '用电量 (kWh)',
            dataIndex: 'electricity',
            key: 'electricity',
            align: 'right' as const,
            render: (val: number) => Number(val || 0).toFixed(2),
        },
        {
            title: '电费 (元)',
            dataIndex: 'cost',
            key: 'cost',
            align: 'right' as const,
            render: (val: number) => Number(val || 0).toFixed(2),
        },
        {
            title: '占比',
            dataIndex: 'percentage',
            key: 'percentage',
            align: 'right' as const,
            render: (val: number) => `${Number(val || 0).toFixed(1)}%`,
        },
    ];

    return (
        <PageContainer ghost title={false} className="peak-valley-page">
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
                        <Card bordered={false} bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
                                        {selectedUnitName || '尖峰平谷分析'} <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>峰谷平电量分布与占比</Text>
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
                                {/* 总用电量Banner */}
                                <div style={{ marginBottom: 0 }}>
                                    <StatisticsCard
                                        title="总用电量"
                                        value={Number(analysisResult?.totalElectricity || 0)}
                                        precision={2}
                                        unit="kWh"
                                        loading={loading}
                                        isString={false}
                                    />
                                </div>

                                {/* 时段统计卡片 - 增加适度的顶部间距 */}
                                <div className="period-cards-container" style={{ marginTop: 8 }}>
                                    {/* 始终渲染所有时段类型的卡片，确保布局固定 */}
                                    {timePeriodTypeOptions.map((option) => {
                                        // 查找对应的数据，如果没有则显示 0
                                        const item = analysisResult?.periodSummaries?.find(s => s.periodType === option.value) || {
                                            periodType: option.value,
                                            periodName: option.label,
                                            electricity: 0,
                                            cost: 0,
                                            percentage: 0
                                        };

                                        return (
                                            <div className="period-card-wrapper" key={option.value}>
                                                <Card
                                                    size="small"
                                                    className="period-card"
                                                    style={{ borderTop: `3px solid ${option.color}` }}
                                                >
                                                    <Statistic
                                                        title={option.label}
                                                        value={item.electricity || 0}
                                                        precision={2}
                                                        suffix="kWh"
                                                        valueStyle={{ color: option.color, fontSize: 18 }}
                                                        loading={loading}
                                                    />
                                                </Card>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* 图表和表格 */}
                                <Row gutter={16} className="chart-table-row">
                                    <Col span={12}>
                                        <Card size="small" title="用电量占比" style={{ height: '100%' }}>
                                            <div style={{ height: 300 }}>
                                                {/* @ts-ignore */}
                                                <Pie {...pieConfig} />
                                            </div>
                                        </Card>
                                    </Col>
                                    <Col span={12}>
                                        <Card
                                            size="small"
                                            title="分时统计明细"
                                            style={{ height: '100%' }}
                                            extra={
                                                <Space>
                                                    <DollarOutlined />
                                                    <span>总电费: ¥{Number(analysisResult?.totalCost || 0).toFixed(2)}</span>
                                                </Space>
                                            }
                                        >
                                            <Table
                                                dataSource={(analysisResult?.periodSummaries || []) as PeriodSummary[]}
                                                columns={columns}
                                                rowKey="periodType"
                                                pagination={false}
                                                loading={loading}
                                                size="small"
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

export default PeakValleyPage;
