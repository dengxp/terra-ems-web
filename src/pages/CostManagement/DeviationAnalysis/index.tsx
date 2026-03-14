/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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

import { CostDeviation, getCostDeviationAnalysis } from '@/apis/energyCostRecord';
import { ProPageContainer } from '@/components/container';
import PeakValleyCard from '@/components/PeakValleyCard';
import StatCard from '@/components/StatCard';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Form, Row, Select, Space, Table } from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useMemo, useState } from 'react';

const timeTypeOptions = [
    { label: '月', value: 'MONTH' },
    { label: '年', value: 'YEAR' },
];



const DeviationAnalysisPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CostDeviation>({});

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

            const res = await getCostDeviationAnalysis({
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

    const columns = useMemo(() => [
        { title: '用能单位', dataIndex: 'energyUnitName', key: 'energyUnitName' },
        { title: '总耗电量(kWh)', dataIndex: 'totalConsumption', key: 'totalConsumption', render: (v: number) => v?.toLocaleString() },
        { title: '尖(kWh)', dataIndex: 'sharpConsumption', key: 'sharpConsumption', render: (v: number) => v?.toLocaleString() },
        { title: '峰(kWh)', dataIndex: 'peakConsumption', key: 'peakConsumption', render: (v: number) => v?.toLocaleString() },
        { title: '平(kWh)', dataIndex: 'flatConsumption', key: 'flatConsumption', render: (v: number) => v?.toLocaleString() },
        { title: '谷(kWh)', dataIndex: 'valleyConsumption', key: 'valleyConsumption', render: (v: number) => v?.toLocaleString() },
        { title: '总电费(元)', dataIndex: 'totalCost', key: 'totalCost', render: (v: number) => `¥${v?.toLocaleString()}` },
        { title: '同比(%)', dataIndex: 'yoy', key: 'yoy' },
        { title: '占比(%)', dataIndex: 'percentage', key: 'percentage' },
    ], []);

    const ed = data.electricityData || {};
    const sd = data.statisticsData || {};

    const timeType = Form.useWatch('timeType', form);

    return (
        <ProPageContainer className="pt-1">
            <Card size="small">
                <Form form={form} layout="inline" onFinish={fetchData}>
                    <Form.Item name="timeType" label="周期类型">
                        <Select
                            options={timeTypeOptions}
                            style={{ width: 100 }}
                            onChange={() => form.setFieldValue('dataTime', undefined)}
                        />
                    </Form.Item>
                    <Form.Item name="dataTime" label="时间">
                        <DatePicker
                            picker={timeType === 'YEAR' ? 'year' : 'month'}
                            placeholder={timeType === 'YEAR' ? '选择年份' : '选择月份'}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); fetchData(); }}>重置</Button>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            <Card title="电力数据" size="small" style={{ marginTop: 16 }} loading={loading}>
                <Row gutter={16}>
                    <Col span={6}>
                        <StatCard title="总电量(kWh)" value={ed.totalConsumption} yoy={ed.totalConsumptionYoy} mom={ed.totalConsumptionMom} color="#1890ff" />
                    </Col>
                    <Col span={6}>
                        <StatCard title="总电费(元)" value={ed.totalCost} yoy={ed.totalCostYoy} mom={ed.totalCostMom} color="#f5222d" />
                    </Col>
                    <Col span={6}>
                        <StatCard title="功率因数" value={ed.powerFactor} yoy={ed.powerFactorYoy} mom={ed.powerFactorMom} color="#fa8c16" />
                    </Col>
                    <Col span={6}>
                        <PeakValleyCard title="尖峰平谷用电" sharp={ed.sharpConsumption} peak={ed.peakConsumption} flat={ed.flatConsumption} valley={ed.valleyConsumption} />
                    </Col>
                </Row>
            </Card>

            <Card title="统计数据" size="small" style={{ marginTop: 16 }} loading={loading}>
                <Row gutter={16}>
                    <Col span={5}>
                        <StatCard title="总电量(kWh)" value={sd.totalConsumption} yoy={sd.totalConsumptionYoy} mom={sd.totalConsumptionMom} diff={sd.totalConsumptionDiff} color="#1890ff" />
                    </Col>
                    <Col span={5}>
                        <StatCard title="总电费(元)" value={sd.totalCost} yoy={sd.totalCostYoy} mom={sd.totalCostMom} diff={sd.totalCostDiff} color="#f5222d" />
                    </Col>
                    <Col span={4}>
                        <StatCard title="功率因数" value={sd.powerFactor} yoy={sd.powerFactorYoy} mom={sd.powerFactorMom} diff={sd.powerFactorDiff} color="#fa8c16" />
                    </Col>
                    <Col span={5}>
                        <PeakValleyCard title="尖峰平谷用电" sharp={sd.sharpConsumption} peak={sd.peakConsumption} flat={sd.flatConsumption} valley={sd.valleyConsumption} />
                    </Col>
                    <Col span={5}>
                        <PeakValleyCard title="尖峰平谷差值" sharp={sd.sharpConsumption} peak={sd.peakConsumption} flat={sd.flatConsumption} valley={sd.valleyConsumption}
                            sharpDiff={sd.sharpConsumptionDiff} peakDiff={sd.peakConsumptionDiff} flatDiff={sd.flatConsumptionDiff} valleyDiff={sd.valleyConsumptionDiff} />
                    </Col>
                </Row>
            </Card>

            <Card title="耗电明细" size="small" style={{ marginTop: 16 }}>
                <Table
                    loading={loading}
                    dataSource={data.consumptionDetails || []}
                    columns={columns}
                    rowKey="energyUnitId"
                    size="small"
                    pagination={false}
                />
            </Card>
        </ProPageContainer>
    );
};

export default DeviationAnalysisPage;
