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

import { BenchmarkAnalysis, getBenchmarkAnalysis } from '@/apis/statistics';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import { AimOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Badge, Card, DatePicker, Empty, Select, Space, Spin, Splitter, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;

const BenchmarkAnalysisPage: React.FC = () => {
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [benchmarkData, setBenchmarkData] = useState<BenchmarkAnalysis[]>([]);

    // 移除 redundant fetchTree useEffect

    // 加载对标分析数据
    const fetchBenchmarkData = async () => {
        if (!selectedUnitId) return;

        setLoading(true);
        try {
            const res = await getBenchmarkAnalysis({
                parentUnitId: selectedUnitId,
                timeType,
                dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
            });
            if (res.success) {
                setBenchmarkData(res.data || []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBenchmarkData();
    }, [selectedUnitId, timeType, dataTime]);


    const getPickerType = () => {
        switch (timeType) {
            case 'DAY': return 'date';
            case 'MONTH': return 'month';
            case 'YEAR': return 'year';
            default: return 'month';
        }
    };

    const getEvaluationColor = (evaluation: string) => {
        switch (evaluation) {
            case '达标': return 'success';
            case '良': return 'processing';
            case '中': return 'warning';
            case '差': return 'error';
            default: return 'default';
        }
    };

    const columns: ColumnsType<BenchmarkAnalysis> = [
        {
            title: '用能单元',
            dataIndex: 'energyUnitName',
            key: 'energyUnitName',
            width: 180,
            render: (text: string) => (
                <Space>
                    <AimOutlined style={{ color: '#1890ff' }} />
                    {text}
                </Space>
            ),
        },
        {
            title: '实际能耗',
            dataIndex: 'actualConsumption',
            key: 'actualConsumption',
            width: 130,
            render: (val: number, record: BenchmarkAnalysis) => (
                <Text>{val?.toFixed(2)} {record.unit}</Text>
            ),
        },
        {
            title: '标杆值',
            dataIndex: 'benchmarkValue',
            key: 'benchmarkValue',
            width: 130,
            render: (val: number, record: BenchmarkAnalysis) => (
                <Text type="secondary">{val?.toFixed(2)} {record.unit}</Text>
            ),
        },
        {
            title: '标杆等级',
            dataIndex: 'benchmarkGrade',
            key: 'benchmarkGrade',
            width: 100,
            render: (text: string) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: '差异',
            dataIndex: 'difference',
            key: 'difference',
            width: 120,
            render: (val: number, record: BenchmarkAnalysis) => (
                <Text type={val > 0 ? 'danger' : 'success'}>
                    {val > 0 ? '+' : ''}{val?.toFixed(2)} {record.unit}
                </Text>
            ),
        },
        {
            title: '达标率',
            dataIndex: 'complianceRate',
            key: 'complianceRate',
            width: 100,
            render: (val: number) => (
                <Text type={val <= 100 ? 'success' : 'danger'}>{val?.toFixed(1)}%</Text>
            ),
        },
        {
            title: '是否达标',
            dataIndex: 'isCompliant',
            key: 'isCompliant',
            width: 100,
            render: (val: boolean) => (
                <Badge
                    status={val ? 'success' : 'error'}
                    text={val ? '达标' : '未达标'}
                />
            ),
        },
        {
            title: '评价',
            dataIndex: 'evaluation',
            key: 'evaluation',
            width: 80,
            render: (text: string) => (
                <Tag color={getEvaluationColor(text)} icon={
                    text === '达标' ? <CheckCircleOutlined /> :
                        text === '差' ? <CloseCircleOutlined /> :
                            <ExclamationCircleOutlined />
                }>
                    {text}
                </Tag>
            ),
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
                                        {selectedUnitName || '对标分析'}
                                        <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>
                                            能耗标杆对比分析
                                        </Text>
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
                            <Card variant="borderless">
                                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                                    <Empty description="请从左侧选择一个用能单元开始分析" />
                                </div>
                            </Card>
                        ) : (
                            <Spin spinning={loading}>
                                <Card variant="borderless" styles={{ body: { padding: '16px' } }}>
                                    <Table
                                        columns={columns}
                                        dataSource={benchmarkData}
                                        rowKey="energyUnitId"
                                        pagination={false}
                                        size="middle"
                                        locale={{ emptyText: <Empty description="暂无对标数据，请先配置标杆值" /> }}
                                    />
                                </Card>
                            </Spin>
                        )}
                    </div>
                </Splitter.Panel>
            </Splitter>
        </PageContainer>
    );
};

export default BenchmarkAnalysisPage;
