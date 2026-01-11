import React, { useState, useEffect, useMemo } from 'react';
import { ProPageContainer } from '@/components/container';
import { Card, Form, Select, DatePicker, Button, Row, Col, Statistic, Table, Space } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { getCostDeviationAnalysis, CostDeviationDTO, ElectricityData, StatisticsData, ConsumptionDetail } from '@/apis/energyCostRecord';
import styles from './index.less';

const timeTypeOptions = [
    { label: '月', value: 'MONTH' },
    { label: '年', value: 'YEAR' },
];

// 统计卡片组件
const StatCard: React.FC<{
    title: string;
    value?: number;
    yoy?: number;
    mom?: number;
    diff?: number;
    unit?: string;
    color?: string;
}> = ({ title, value = 0, yoy, mom, diff, unit = '', color = '#1890ff' }) => (
    <Card size="small" className={styles.statCard}>
        <div className={styles.statTitle}>{title}</div>
        <div className={styles.statValue} style={{ color }}>{value?.toLocaleString()}{unit}</div>
        <div className={styles.statDetails}>
            {yoy !== undefined && <span>同比: {yoy}%</span>}
            {mom !== undefined && <span>环比: {mom}%</span>}
            {diff !== undefined && <span>差值: {diff?.toLocaleString()}</span>}
        </div>
    </Card>
);

// 尖峰平谷卡片组件
const PeakValleyCard: React.FC<{
    title: string;
    sharp?: number;
    peak?: number;
    flat?: number;
    valley?: number;
    sharpDiff?: number;
    peakDiff?: number;
    flatDiff?: number;
    valleyDiff?: number;
}> = ({ title, sharp = 0, peak = 0, flat = 0, valley = 0, sharpDiff, peakDiff, flatDiff, valleyDiff }) => (
    <Card size="small" className={styles.statCard}>
        <div className={styles.statTitle}>{title}</div>
        <div className={styles.peakValleyGrid}>
            <div>尖: {sharp?.toLocaleString()}{sharpDiff !== undefined && <span className={styles.diff}>({sharpDiff > 0 ? '+' : ''}{sharpDiff})</span>}</div>
            <div>峰: {peak?.toLocaleString()}{peakDiff !== undefined && <span className={styles.diff}>({peakDiff > 0 ? '+' : ''}{peakDiff})</span>}</div>
            <div>平: {flat?.toLocaleString()}{flatDiff !== undefined && <span className={styles.diff}>({flatDiff > 0 ? '+' : ''}{flatDiff})</span>}</div>
            <div>谷: {valley?.toLocaleString()}{valleyDiff !== undefined && <span className={styles.diff}>({valleyDiff > 0 ? '+' : ''}{valleyDiff})</span>}</div>
        </div>
    </Card>
);

const DeviationAnalysisPage: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CostDeviationDTO>({});

    const fetchData = async () => {
        const values = form.getFieldsValue();
        if (!values.timeType || !values.dataTime) return;

        setLoading(true);
        try {
            const res = await getCostDeviationAnalysis({
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
    const timeType = form.getFieldValue('timeType');

    return (
        <ProPageContainer className="pt-1">
            <Card size="small">
                <Form form={form} layout="inline" onFinish={fetchData}>
                    <Form.Item name="timeType" label="期间">
                        <Select options={timeTypeOptions} style={{ width: 100 }} />
                    </Form.Item>
                    <Form.Item name="dataTime" label="时间">
                        <DatePicker picker={timeType === 'YEAR' ? 'year' : 'month'} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
                            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); fetchData(); }}>重置</Button>
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
