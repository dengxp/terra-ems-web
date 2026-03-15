/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import {
  getCarbonRanking, getCarbonSummary
} from '@/apis/carbonEmission';
import { ComparisonAnalysis, EnergyStatisticsSummary } from '@/apis/statistics';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import { TrophyOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Col, DatePicker, Empty, Row, Select, Space, Splitter, Table, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import RankingChart from '../components/RankingChart';
import StatisticsCard from '../components/StatisticsCard';
import TrendChart from '../components/TrendChart';

const { Title, Text } = Typography;

const CarbonEmissionPage: React.FC = () => {
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);

    const [summary, setSummary] = useState<EnergyStatisticsSummary | null>(null);
    const [rankingData, setRankingData] = useState<ComparisonAnalysis[]>([]);

    // 移除 redundant fetchTree useEffect

    const fetchAllData = async () => {
        if (!selectedUnitId) return;
        setLoading(true);
        const params = {
            energyUnitId: selectedUnitId,
            parentUnitId: selectedUnitId,
            timeType,
            dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
        };

        try {
            const [summaryRes, rankingRes] = await Promise.all([
                getCarbonSummary(params),
                getCarbonRanking(params),
            ]);

            if (summaryRes.success) setSummary(summaryRes.data || null);
            if (rankingRes.success) setRankingData(rankingRes.data || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, [selectedUnitId, timeType, dataTime]);


    const columns = [
        {
            title: '排名',
            dataIndex: 'index',
            key: 'index',
            width: 80,
            render: (_: any, __: any, index: number) => {
                const rank = index + 1;
                let color = 'inherit';
                if (rank === 1) color = '#f5222d';
                if (rank === 2) color = '#fa8c16';
                if (rank === 3) color = '#fadb14';
                return <span style={{ fontWeight: rank <= 3 ? 'bold' : 'normal', color }}><TrophyOutlined style={{ display: rank <= 3 ? 'inline-block' : 'none', marginRight: 4 }} />{rank}</span>;
            },
        },
        {
            title: '用能单元',
            dataIndex: 'energyUnitName',
            key: 'energyUnitName',
        },
        {
            title: '累计碳排放 (kgCO2)',
            dataIndex: 'currentValue',
            key: 'currentValue',
            align: 'right' as const,
            render: (val: number) => val?.toFixed(2),
        },
    ];

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
                                        {selectedUnitName || '碳排放核算'} <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>碳排放总量与趋势对标</Text>
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
                                    <Empty description="请从左侧选择一个用能单元开始核算" />
                                </div>
                            </Card>
                        ) : (
                            <div style={{ minHeight: 'calc(100vh - 300px)' }}>
                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={8}>
                                        <StatisticsCard
                                            title="总碳排放量"
                                            value={summary?.currentTotal || 0}
                                            unit="kgCO2"
                                            loading={loading}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <StatisticsCard
                                            title="碳排放同比"
                                            value={summary?.currentTotal || 0}
                                            compareValue={summary?.lastYearTotal}
                                            changeRate={summary?.yoyRate}
                                            unit="kgCO2"
                                            loading={loading}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <StatisticsCard
                                            title="碳排放环比"
                                            value={summary?.currentTotal || 0}
                                            compareValue={summary?.lastPeriodTotal}
                                            changeRate={summary?.momRate}
                                            unit="kgCO2"
                                            loading={loading}
                                        />
                                    </Col>
                                </Row>

                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={14}>
                                        <Card size="small" title="排放趋势 (kgCO2)">
                                            <TrendChart
                                                data={summary?.trendData || []}
                                                unit="kgCO2"
                                                height={300}
                                                loading={loading}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={10}>
                                        <Card size="small" title="子单元排名图 (kgCO2)">
                                            <RankingChart
                                                data={rankingData}
                                                height={300}
                                                loading={loading}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                <Card size="small" title="碳排放明细">
                                    <Table
                                        columns={columns}
                                        dataSource={rankingData}
                                        rowKey="energyUnitId"
                                        pagination={false}
                                        size="small"
                                        loading={loading}
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

export default CarbonEmissionPage;
