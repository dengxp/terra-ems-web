import React, { useState, useEffect } from 'react';
import { ProPageContainer } from '@/components/container';
import { Card, Form, Select, DatePicker, Button, Row, Col, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Line, Column } from '@ant-design/plots';
import { getCostTrendAnalysis, CostTrend, TrendChartData } from '@/apis/energyCostRecord';

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
            const res = await getCostTrendAnalysis({
                timeType: values.timeType,
                dataTime: values.dataTime.format('YYYY-MM-DD'),
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

    const getPickerType = () => {
        const timeType = form.getFieldValue('timeType');
        if (timeType === 'DAY') return 'date';
        if (timeType === 'YEAR') return 'year';
        return 'month';
    };

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

    return (
        <ProPageContainer className="pt-1">
            <Card size="small">
                <Form form={form} layout="inline" onFinish={fetchData}>
                    <Form.Item name="timeType" label="周期类型">
                        <Select options={timeTypeOptions} style={{ width: 100 }} onChange={() => form.validateFields()} />
                    </Form.Item>
                    <Form.Item name="dataTime" label="时间">
                        <DatePicker picker={getPickerType()} />
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
