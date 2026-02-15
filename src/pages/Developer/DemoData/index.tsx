import React, { useState, useEffect } from 'react';
import { Card, Button, Form, TreeSelect, message, Typography, Space, Alert, Divider } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { generateRankingData } from '@/apis/demo';
import { getToken } from '@/utils/auth';
import { RocketOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const DemoDataPage: React.FC = () => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [form] = Form.useForm();

    const fetchTree = async () => {
        if (!getToken()) return;
        setFetching(true);
        try {
            const res = await getEnabledEnergyUnitTree();
            if (res.success) {
                const convertToTreeSelect = (units: EnergyUnit[]): any[] => {
                    return units.map(unit => ({
                        title: unit.name,
                        value: unit.id,
                        key: unit.id,
                        children: unit.children ? convertToTreeSelect(unit.children) : [],
                    }));
                };
                setTreeData(convertToTreeSelect(res.data || []));
            }
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    const onFinish = async (values: { parentUnitId: number }) => {
        setLoading(true);
        try {
            const res = await generateRankingData(values.parentUnitId);
            if (res.success) {
                message.success(res.message || '数据生成成功！');
            } else {
                message.error(res.message || '生成失败');
            }
        } catch (error) {
            console.error('Generate error:', error);
            message.error('请求发生异常');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer ghost title="演示数据生成">
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <Card variant="borderless">
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                        <div>
                            <Title level={4}>
                                <DatabaseOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                能耗排名数据模拟
                            </Title>
                            <Paragraph>
                                此工具用于在数据库中快速生成演示用的能耗历史数据。它会为选中的<Text strong>父用能单元</Text>下的所有直接子单元生成对应的点位及能耗明细。
                            </Paragraph>
                        </div>

                        <Alert
                            message="操作说明"
                            description={
                                <ul style={{ marginBottom: 0 }}>
                                    <li>系统会自动检查子单元是否已有关联采集点位，若无则自动创建演示点位。</li>
                                    <li>生成的模拟数据包含：过去12个月的月度数据、过去30天的日数据以及本年度汇总数据。</li>
                                    <li>重复点击将更新已有演示点位的最新数值，不会产生冗余垃圾点位。</li>
                                </ul>
                            }
                            type="info"
                            showIcon
                        />

                        <Divider />

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="目标父单元"
                                name="parentUnitId"
                                rules={[{ required: true, message: '请选择一个父级用能单元' }]}
                                tooltip="系统将为该单元下的每一个直接子单元生成能耗数据"
                            >
                                <TreeSelect
                                    showSearch
                                    style={{ width: '100%' }}
                                    dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                    placeholder="请选择要模拟的层级（如：某分厂或某车间）"
                                    allowClear
                                    treeDefaultExpandAll
                                    treeData={treeData}
                                    loading={fetching}
                                />
                            </Form.Item>

                            <Form.Item style={{ marginTop: 24 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<RocketOutlined />}
                                    loading={loading}
                                    size="large"
                                    block
                                >
                                    立即生成演示数据
                                </Button>
                            </Form.Item>
                        </Form>
                    </Space>
                </Card>
            </div>
        </PageContainer>
    );
};

export default DemoDataPage;
