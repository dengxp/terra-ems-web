import React, { useState, useEffect } from 'react';
import { Card, Tree, DatePicker, Select, Space, Table, Empty, Typography, Tag, Spin, Badge } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { getBenchmarkAnalysis, BenchmarkAnalysis } from '@/apis/statistics';
import { AimOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const BenchmarkAnalysisPage: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [benchmarkData, setBenchmarkData] = useState<BenchmarkAnalysis[]>([]);

    // 加载用能单元树
    const fetchTree = async () => {
        const res = await getEnabledEnergyUnitTree();
        if (res.success) {
            const mapTree = (data: EnergyUnit[]): any[] =>
                data.map((item) => ({
                    title: item.name,
                    key: item.id,
                    children: item.children && item.children.length > 0 ? mapTree(item.children) : undefined,
                }));
            setTreeData(mapTree(res.data || []));
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

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

    const handleTreeSelect = (selectedKeys: React.Key[], info: any) => {
        if (selectedKeys.length > 0) {
            setSelectedUnitId(selectedKeys[0] as number);
            setSelectedUnitName(info.node.title || '');
        }
    };

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
            <div style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
                {/* 左侧树 */}
                <div style={{ width: '280px', flexShrink: 0 }}>
                    <Card
                        title={<Title level={5} style={{ margin: 0 }}><AimOutlined style={{ marginRight: 8 }} />用能单元</Title>}
                        bordered={false}
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        bodyStyle={{ padding: '12px', flex: 1, overflow: 'auto' }}
                    >
                        {treeData.length > 0 ? (
                            <Tree
                                treeData={treeData}
                                onSelect={handleTreeSelect}
                                blockNode
                                defaultExpandAll
                                selectedKeys={selectedUnitId ? [selectedUnitId] : []}
                            />
                        ) : (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </Card>
                </div>

                {/* 右侧内容 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* 头部过滤器卡片 */}
                    <Card bordered={false} bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16 }}>
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
                        <Card bordered={false}>
                            <div style={{ padding: '100px 0', textAlign: 'center' }}>
                                <Empty description="请从左侧选择一个用能单元开始分析" />
                            </div>
                        </Card>
                    ) : (
                        <Spin spinning={loading}>
                            <Card bordered={false} bodyStyle={{ padding: '16px' }}>
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
            </div>
        </PageContainer>
    );
};

export default BenchmarkAnalysisPage;
