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

import { CostTrend, getCostTrendAnalysis, TrendChartData } from '@/apis/energyCostRecord';
import { ProPageContainer } from '@/components/container';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Column, Line } from '@ant-design/plots';
import { Button, Card, Col, DatePicker, Form, Row, Select, Space } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

const timeTypeOptions = [
    { label: '日', value: 'DAY' },
    { label: '月', value: 'MONTH' },
    { label: '年', value: 'YEAR' },
];

const TrendAnalysisPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CostTrend>({});

    const fetchData = async () => {
        const values = form.getFieldsValue();
        if (!values.timeType || !values.dataTime) return;

        setLoading(true);
        try {
            // 后端接收 LocalDate 类型，需要 YYYY-MM-DD 格式
            // 年份：传递该年第一天（如 2026-01-01）
            // 月份：传递该月第一天（如 2026-02-01）
            let dateStr = values.dataTime.format('YYYY-MM-DD');
            if (values.timeType === 'YEAR') {
                dateStr = values.dataTime.startOf('year').format('YYYY-MM-DD');
            } else if (values.timeType === 'MONTH') {
                dateStr = values.dataTime.startOf('month').format('YYYY-MM-DD');
            }

            const res = await getCostTrendAnalysis({
                timeType: values.timeType,
                dataTime: dateStr,
            });
            if (res.success && res.data) {
                setData(res.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        form.setFieldsValue({
            timeType: 'MONTH',
            dataTime: dayjs(),
        });
        fetchData();
    }, []);


    // 转换数据为 @ant-design/plots 格式
    const transformLineData = (chartData: TrendChartData) => {
        const result: { time: string; value: number }[] = [];
        (chartData.timeLabels || []).forEach((label, index) => {
            result.push({
                time: label,
                value: (chartData.costValues || [])[index] || 0,
            });
        });
        return result;
    };

    const transformBarData = (chartData: TrendChartData) => {
        const result: { time: string; value: number }[] = [];
        (chartData.timeLabels || []).forEach((label, index) => {
            result.push({
                time: label,
                value: (chartData.consumptionValues || [])[index] || 0,
            });
        });
        return result;
    };

    const lineConfig = (chartData: TrendChartData) => ({
        data: transformLineData(chartData),
        xField: 'time',
        yField: 'value',
        smooth: true,
        point: {
            size: 3,
            shape: 'circle',
        },
        label: {
            style: {
                fill: '#aaa',
            },
        },
    });

    const columnConfig = (chartData: TrendChartData) => ({
        data: transformBarData(chartData),
        xField: 'time',
        yField: 'value',
        color: '#52c41a',
        label: {
            position: 'top' as const,
            style: {
                fill: '#aaa',
            },
        },
    });

    const timeType = Form.useWatch('timeType', form);

    return (
        <ProPageContainer className="pt-1">
            <Card size="small">
                <Form form={form} layout="inline" onFinish={fetchData}>
                    <Form.Item name="timeType" label="周期类型">
                        <Select
                            options={timeTypeOptions}
                            style={{ width: 100 }}
                            onChange={() => {
                                form.setFieldValue('dataTime', undefined);
                                form.validateFields();
                            }}
                        />
                    </Form.Item>
                    <Form.Item name="dataTime" label="时间">
                        <DatePicker
                            picker={timeType === 'DAY' ? 'date' : timeType === 'YEAR' ? 'year' : 'month'}
                            placeholder={
                                timeType === 'YEAR' ? '选择年份' :
                                    timeType === 'MONTH' ? '选择月份' :
                                        '选择日期'
                            }
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); fetchData(); }}>重置</Button>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />} loading={loading}>搜索</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {(data.chartData || []).map((chartData, index) => (
                <Row key={chartData.energyTypeId || index} gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                        <Card title={`${chartData.costLabel || '费用'}(元)`} size="small" loading={loading}>
                            <div style={{ height: 300 }}>
                                <Line {...lineConfig(chartData)} />
                            </div>
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card title={`${chartData.consumptionLabel || '消耗量'}(${chartData.energyUnit || ''})`} size="small" loading={loading}>
                            <div style={{ height: 300 }}>
                                <Column {...columnConfig(chartData)} />
                            </div>
                        </Card>
                    </Col>
                </Row>
            ))}

            {(!data.chartData || data.chartData.length === 0) && !loading && (
                <Card size="small" style={{ marginTop: 16, textAlign: 'center', padding: 40 }}>
                    <div style={{ color: '#999' }}>暂无数据</div>
                </Card>
            )}
        </ProPageContainer>
    );
};

export default TrendAnalysisPage;
