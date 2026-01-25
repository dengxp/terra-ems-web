import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Tree, DatePicker, Select, Space, Empty, Spin, Typography, Input, Splitter } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { generateList, getParentKey } from '@/utils/tree';
import { getEnabledEnergyTypes, EnergyType } from '@/apis/energyType';
import { getProductNames } from '@/apis/productionRecord';
import {
    getUnitConsumptionAnalysis,
    UnitConsumption,
} from '@/apis/statistics';
import StatisticsCard from '../components/StatisticsCard';
import UnitConsumptionTrendChart from './components/UnitConsumptionTrendChart';
import dayjs from 'dayjs';
import { ApartmentOutlined, BarChartOutlined, LineChartOutlined, DashboardOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const UnitConsumptionPage: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [energyTypes, setEnergyTypes] = useState<EnergyType[]>([]);
    const [productNames, setProductNames] = useState<string[]>([]);

    // 筛选状态
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [selectedEnergyType, setSelectedEnergyType] = useState<number | undefined>(undefined);
    const [selectedProductName, setSelectedProductName] = useState<string | undefined>(undefined);

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<UnitConsumption | null>(null);
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    // 加载基础数据
    useEffect(() => {
        const initData = async () => {
            const [treeRes, etRes] = await Promise.all([
                getEnabledEnergyUnitTree(),
                getEnabledEnergyTypes(),
            ]);

            if (treeRes.success) {
                const mapTree = (nodes: EnergyUnit[]): any[] =>
                    nodes.map((item) => ({
                        title: item.name,
                        key: item.id,
                        children: item.children && item.children.length > 0 ? mapTree(item.children) : undefined,
                    }));
                const tree = mapTree(treeRes.data || []);
                setTreeData(tree);
                // 默认展开所有节点
                const allKeys = generateList(tree).map((item) => item.key);
                setExpandedKeys(allKeys);
            }

            if (etRes.success) {
                setEnergyTypes(etRes.data || []);
            }
        };
        initData();
    }, []);

    // 扁平化后的数据列表，用于搜索
    const dataList = useMemo(() => generateList(treeData), [treeData]);

    // 搜索输入变化处理
    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchValue(value);
        const newExpandedKeys = dataList
            .map((item) => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, treeData);
                }
                return null;
            })
            .filter((item): item is React.Key => item !== null && item !== undefined);

        const uniqueKeys = Array.from(new Set(newExpandedKeys));

        if (uniqueKeys.length > 0) {
            setExpandedKeys(uniqueKeys);
            setAutoExpandParent(true);
        }
    };

    // 渲染带高亮和过滤的树节点
    const displayTreeData = useMemo(() => {
        const loop = (data: any[]): any[] =>
            data
                .map((item) => {
                    const strTitle = item.title as string;
                    const index = strTitle.indexOf(searchValue);

                    const beforeStr = strTitle.substring(0, index);
                    const afterStr = strTitle.slice(index + searchValue.length);

                    const title =
                        index > -1 ? (
                            <span key={item.key}>
                                {beforeStr}
                                <span style={{ color: '#f50' }}>{searchValue}</span>
                                {afterStr}
                            </span>
                        ) : (
                            <span key={item.key}>{strTitle}</span>
                        );

                    let children = item.children ? loop(item.children) : [];

                    if (index > -1 || children.length > 0) {
                        return {
                            ...item,
                            title,
                            children,
                        };
                    }

                    return null;
                })
                .filter(item => item !== null) as any[];

        return searchValue ? loop(treeData) : treeData;
    }, [searchValue, treeData]);

    // 切换用能单元时加载产品列表
    useEffect(() => {
        if (selectedUnitId) {
            getProductNames(selectedUnitId).then(res => {
                if (res.success) {
                    setProductNames(res.data || []);
                }
            });
            setSelectedProductName(undefined);
        }
    }, [selectedUnitId]);

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
                productName: selectedProductName,
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
    }, [selectedUnitId, timeType, dataTime, selectedEnergyType, selectedProductName]);

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

    return (
        <PageContainer ghost title={false}>
            <Splitter>
                {/* 左侧树 */}
                <Splitter.Panel defaultSize="20%" min="15%" max="30%" style={{ overflow: 'hidden' }}>
                    <Card
                        title={<Space><ApartmentOutlined style={{ color: '#1890ff' }} />用能单元</Space>}
                        bordered={false}
                        size="small"
                        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        bodyStyle={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        className="custom-tree-card"
                    >
                        <Input.Search
                            placeholder="搜索用能单元"
                            onChange={onSearchChange}
                            allowClear
                            style={{ marginBottom: 8 }}
                        />
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            {treeData.length > 0 ? (
                                <Tree
                                    treeData={displayTreeData}
                                    onSelect={handleTreeSelect}
                                    blockNode
                                    showLine={{ showLeafIcon: false }}
                                    expandedKeys={expandedKeys}
                                    onExpand={(keys) => {
                                        setExpandedKeys(keys);
                                        setAutoExpandParent(false);
                                    }}
                                    autoExpandParent={autoExpandParent}
                                    selectedKeys={selectedUnitId ? [selectedUnitId] : []}
                                />
                            ) : (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>
                    </Card>
                </Splitter.Panel>

                {/* 右侧内容 */}
                <Splitter.Panel style={{ overflow: 'hidden', paddingLeft: '16px' }}>
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                        {/* 头部过滤器卡片 */}
                        <Card bordered={false} bodyStyle={{ padding: '16px' }} style={{ marginBottom: 16 }}>
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
                                            options={energyTypes.map(t => ({ label: t.name, value: t.id }))}
                                        />
                                    </Space>
                                    <Space>
                                        <Text type="secondary">产品：</Text>
                                        <Select
                                            placeholder="全部产品"
                                            allowClear
                                            style={{ width: 120 }}
                                            value={selectedProductName}
                                            onChange={setSelectedProductName}
                                            options={productNames.map(p => ({ label: p, value: p }))}
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
                            <Card bordered={false}>
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
                                                        {data?.energyConsumption?.toFixed(2)} <Text type="secondary" style={{ fontSize: 14 }}>{data?.energyUnit || 'tce'}</Text>
                                                    </Title>
                                                </Space>
                                            </Card>
                                        </Col>
                                        <Col span={12}>
                                            <Card size="small" style={{ backgroundColor: '#fcfcfc' }}>
                                                <Space direction="vertical" style={{ width: '100%' }}>
                                                    <Text type="secondary">本期总产量</Text>
                                                    <Title level={4} style={{ margin: 0 }}>
                                                        {data?.production?.toFixed(2)} <Text type="secondary" style={{ fontSize: 14 }}>{data?.productionUnit || 't'}</Text>
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
