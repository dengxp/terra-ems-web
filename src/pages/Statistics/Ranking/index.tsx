import React, { useState, useEffect, useMemo } from 'react';
import { Card, Col, Row, Tree, DatePicker, Select, Space, Empty, Table, Input, Splitter } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { generateList, getParentKey } from '@/utils/tree';
import {
    getRankingAnalysis,
    ComparisonAnalysis,
} from '@/apis/statistics';
import RankingChart from '../components/RankingChart';
import dayjs from 'dayjs';
import { ApartmentOutlined, BarChartOutlined, TrophyOutlined } from '@ant-design/icons';
import { Typography } from 'antd';

const { Title, Text } = Typography;

const RankingPage: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('MONTH');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [rankingData, setRankingData] = useState<ComparisonAnalysis[]>([]);

    const fetchTree = async () => {
        const res = await getEnabledEnergyUnitTree();
        if (res.success) {
            const mapTree = (data: EnergyUnit[]): any[] =>
                data.map((item) => ({
                    title: item.name,
                    key: item.id,
                    children: item.children && item.children.length > 0 ? mapTree(item.children) : undefined,
                }));
            const tree = mapTree(res.data || []);
            setTreeData(tree);
            // 默认展开所有节点
            const allKeys = generateList(tree).map((item) => item.key);
            setExpandedKeys(allKeys);
            if (res.data && res.data.length > 0 && !selectedUnitId) {
                setSelectedUnitId(res.data[0].id);
                setSelectedUnitName(res.data[0].name);
            }
        }
    };

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

    useEffect(() => {
        fetchTree();
    }, []);

    const fetchRanking = async () => {
        if (!selectedUnitId) return;
        setLoading(true);
        try {
            const res = await getRankingAnalysis({
                parentUnitId: selectedUnitId,
                timeType,
                dataTime: dataTime.format('YYYY-MM-DD HH:mm:ss'),
            });
            if (res.success) {
                setRankingData(res.data || []);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRanking();
    }, [selectedUnitId, timeType, dataTime]);

    const handleTreeSelect = (selectedKeys: React.Key[], info: any) => {
        if (selectedKeys.length > 0) {
            setSelectedUnitId(selectedKeys[0] as number);
            setSelectedUnitName(info.node.title || '');
        }
    };

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
            title: '总能耗 (tce)',
            dataIndex: 'currentValue',
            key: 'currentValue',
            align: 'right' as const,
            render: (val: number) => val?.toFixed(2),
        },
    ];

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
                                        {selectedUnitName || '能耗排名分析'} <Text type="secondary" style={{ marginLeft: 12, fontSize: 14, fontWeight: 'normal' }}>同级对标排名</Text>
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
                            <Card bordered={false}>
                                <div style={{ padding: '100px 0', textAlign: 'center' }}>
                                    <Empty description="请从左侧选择一个用能单元开始分析" />
                                </div>
                            </Card>
                        ) : (
                            <div style={{ minHeight: 'calc(100vh - 300px)' }}>
                                <Row gutter={16}>
                                    <Col span={14}>
                                        <Card size="small" title="排名图表 (tce)">
                                            <RankingChart
                                                data={rankingData}
                                                height={500}
                                                loading={loading}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={10}>
                                        <Card size="small" title="排名列表">
                                            <Table
                                                columns={columns}
                                                dataSource={rankingData}
                                                rowKey="energyUnitId"
                                                pagination={false}
                                                size="small"
                                                loading={loading}
                                                scroll={{ y: 440 }}
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

export default RankingPage;
