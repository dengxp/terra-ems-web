import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tree, DatePicker, Select, Space, Table, Empty, Typography, Tag, Spin, Progress, Input, Splitter } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { generateList, getParentKey } from '@/utils/tree';
import { getBranchAnalysis, BranchAnalysis } from '@/apis/statistics';
import { ApartmentOutlined, ThunderboltOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

const BranchAnalysisPage: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [selectedUnitName, setSelectedUnitName] = useState<string>('');
    const [timeType, setTimeType] = useState<'DAY' | 'MONTH' | 'YEAR'>('DAY');
    const [dataTime, setDataTime] = useState(dayjs());
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [branchData, setBranchData] = useState<BranchAnalysis[]>([]);

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
            const tree = mapTree(res.data || []);
            setTreeData(tree);
            // 默认展开所有节点
            const allKeys = generateList(tree).map((item) => item.key);
            setExpandedKeys(allKeys);
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
