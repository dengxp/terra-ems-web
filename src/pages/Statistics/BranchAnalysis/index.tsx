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

import { BranchAnalysis, getBranchAnalysis } from '@/apis/statistics';
import EnergyUnitTree from '@/components/EnergyUnitTree';
import { ApartmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { Card, DatePicker, Empty, Progress, Select, Space, Spin, Splitter, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;

const BranchAnalysisPage: React.FC = () => {
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('DAY');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [branchData, setBranchData] = useState<BranchAnalysis[]>([]);

    // 加载支路分析数据
    const fetchBranchData = async () => {
        if (!selectedUnitId) return;

        setLoading(true);
        try {
            const res = await getBranchAnalysis({
                parentUnitId: selectedUnitId,
                timeType,
                dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
            });
            if (res.success) {
                setBranchData(res.data || []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranchData();
    }, [selectedUnitId, timeType, dataTime]);


    const getPickerType = () => {
        switch (timeType) {
            case 'DAY': return 'date';
            case 'MONTH': return 'month';
            case 'YEAR': return 'year';
            default: return 'date';
        }
    };

    const columns: ColumnsType<BranchAnalysis> = [
        {
            title: '支路名称',
            dataIndex: 'branchName',
            key: 'branchName',
            width: 180,
            render: (text: string) => (
                <Space>
                    <ApartmentOutlined style={{ color: '#1890ff' }} />
                    {text}
                </Space>
            ),
        },
        {
            title: '电压等级',
            dataIndex: 'voltageLevel',
            key: 'voltageLevel',
            width: 100,
            render: (text: string) => text ? <Tag color="blue">{text}</Tag> : '-',
        },
        {
            title: '额定电流(A)',
            dataIndex: 'ratedCurrent',
            key: 'ratedCurrent',
            width: 110,
            render: (val: number) => val?.toFixed(2) || '-',
        },
        {
            title: '额定功率(kW)',
            dataIndex: 'ratedPower',
            key: 'ratedPower',
            width: 120,
            render: (val: number) => val?.toFixed(2) || '-',
        },
        {
            title: '能耗',
            dataIndex: 'totalConsumption',
            key: 'totalConsumption',
            width: 150,
            render: (val: number, record: BranchAnalysis) => (
                <Space>
                    <ThunderboltOutlined style={{ color: '#faad14' }} />
                    <Text strong>{val?.toFixed(2)}</Text>
                    <Text type="secondary">{record.unit}</Text>
                </Space>
            ),
        },
        {
            title: '占比',
            dataIndex: 'percentage',
            key: 'percentage',
            width: 180,
            render: (val: number) => (
                <Progress
                    percent={val}
                    size="small"
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }}
                    format={(percent) => `${percent?.toFixed(1)}%`}
                />
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
                                        {selectedUnitName || '支路能耗分析'}
                                        <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>
                                            配电支路能耗分布
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
                                        dataSource={branchData}
                                        rowKey="branchId"
                                        pagination={false}
                                        size="middle"
                                        locale={{ emptyText: <Empty description="暂无支路数据" /> }}
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

export default BranchAnalysisPage;
