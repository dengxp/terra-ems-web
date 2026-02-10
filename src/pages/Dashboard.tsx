import React from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Col, Row, Progress, Tag, List, Avatar, Typography, Space } from 'antd';
import {
    ThunderboltOutlined,
    CloudOutlined,
    AlertOutlined,
    SettingOutlined,
    BarChartOutlined,
    DashboardOutlined,
    FireOutlined,
} from '@ant-design/icons';
import StatCard from '@/components/stat-card';

const { Text } = Typography;

// 统一配色
const colors = {
    primary: '#1890ff',
    success: '#52c41a',
    warning: '#faad14',
    info: '#13c2c2',
};

// 浅色渐变
const gradients = {
    blue: 'linear-gradient(135deg, #e0f4ff 0%, #bae7ff 100%)',
    green: 'linear-gradient(135deg, #e8fff0 0%, #b7eb8f 100%)',
    orange: 'linear-gradient(135deg, #fff7e6 0%, #ffd591 100%)',
    cyan: 'linear-gradient(135deg, #e6fffb 0%, #87e8de 100%)',
};



/**
 * 能源管理系统 Dashboard
 */
const Dashboard: React.FC = () => {
    const weekData = [
        { day: '周一', value: 65 },
        { day: '周二', value: 78 },
        { day: '周三', value: 66 },
        { day: '周四', value: 82 },
        { day: '周五', value: 75 },
        { day: '周六', value: 90 },
        { day: '周日', value: 85 },
    ];
    const maxValue = Math.max(...weekData.map((d) => d.value));

    const energyData = [
        { name: '电力', value: 45, color: colors.primary },
        { name: '天然气', value: 25, color: colors.success },
        { name: '蒸汽', value: 18, color: colors.warning },
        { name: '水', value: 12, color: colors.info },
    ];

    const monitorData = [
        { name: '1#变压器', value: 87, status: 'normal' },
        { name: '2#变压器', value: 92, status: 'warning' },
        { name: '空压机组', value: 65, status: 'normal' },
        { name: '冷却系统', value: 78, status: 'normal' },
        { name: '照明系统', value: 45, status: 'normal' },
    ];

    const quickItems = [
        { name: '报警管理', icon: <AlertOutlined />, bg: 'linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%)', color: '#ff4d4f' },
        { name: '设备管理', icon: <SettingOutlined />, bg: gradients.blue, color: colors.primary },
        { name: '能耗报表', icon: <BarChartOutlined />, bg: gradients.green, color: colors.success },
        { name: '数据分析', icon: <DashboardOutlined />, bg: 'linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%)', color: '#722ed1' },
    ];

    // 统一卡片样式
    const cardStyle = { borderRadius: 12, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' };
    const cardMinHeight = 300;

    return (
        <PageContainer
            header={{
                title: '能源管理驾驶舱',
                subTitle: '实时监控 · 智能分析 · 节能增效',
            }}
        >
            {/* 统计卡片 */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard mode="gradient" title="今日总能耗" value="12,458" unit="kWh" icon={<ThunderboltOutlined />} trend="up" trendValue="8.5%" gradient={gradients.blue} color={colors.primary} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard mode="gradient" title="电力消耗" value="8,234" unit="kWh" icon={<ThunderboltOutlined />} trend="down" trendValue="3.2%" gradient={gradients.green} color={colors.success} />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard mode="gradient" title="碳排放量" value="2,156" unit="tCO₂" icon={<CloudOutlined />} trend="down" trendValue="5.8%" gradient={gradients.orange} color="#d48806" />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard mode="gradient" title="综合节能率" value="15.8" unit="%" icon={<FireOutlined />} trend="up" trendValue="2.1%" gradient={gradients.cyan} color={colors.info} />
                </Col>
            </Row>

            {/* 趋势图 + 能源分布 */}
            <Row gutter={[16, 16]} style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap' }}>
                <Col xs={24} lg={16} style={{ display: 'flex' }}>
                    <ProCard title="本周能耗趋势" extra={<a>查看详情</a>} headerBordered style={{ ...cardStyle, flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: 200, padding: '16px 0' }}>
                            {weekData.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                    <Text strong style={{ color: colors.primary, marginBottom: 6, fontSize: 12 }}>{item.value}</Text>
                                    <div
                                        style={{
                                            width: 28,
                                            height: `${(item.value / maxValue) * 120}px`,
                                            background: `linear-gradient(180deg, ${colors.primary} 0%, #91d5ff 100%)`,
                                            borderRadius: 4,
                                        }}
                                    />
                                    <Text type="secondary" style={{ marginTop: 6, fontSize: 12 }}>{item.day}</Text>
                                </div>
                            ))}
                        </div>
                    </ProCard>
                </Col>
                <Col xs={24} lg={8} style={{ display: 'flex' }}>
                    <ProCard title="能源类型分布" headerBordered style={{ ...cardStyle, flex: 1 }}>
                        <List
                            dataSource={energyData}
                            split={false}
                            renderItem={(item) => (
                                <List.Item style={{ padding: '12px 0' }}>
                                    <Space orientation="vertical" style={{ width: '100%' }} size={6}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Space size={8}>
                                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                                                <Text>{item.name}</Text>
                                            </Space>
                                            <Text strong>{item.value}%</Text>
                                        </div>
                                        <Progress percent={item.value} strokeColor={item.color} showInfo={false} size="small" />
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </ProCard>
                </Col>
            </Row>

            {/* 设备监控 + 快捷入口 */}
            <Row gutter={[16, 16]} style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap' }}>
                <Col xs={24} lg={16} style={{ display: 'flex' }}>
                    <ProCard title="设备实时监控" headerBordered style={{ ...cardStyle, flex: 1 }}>
                        <List
                            dataSource={monitorData}
                            split={false}
                            renderItem={(item) => (
                                <List.Item style={{ padding: '10px 0' }}>
                                    <Space orientation="vertical" style={{ width: '100%' }} size={6}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Text>{item.name}</Text>
                                            <Tag color={item.status === 'warning' ? 'orange' : 'green'}>
                                                {item.status === 'warning' ? '负载较高' : '正常'}
                                            </Tag>
                                        </div>
                                        <Progress
                                            percent={item.value}
                                            strokeColor={item.value > 90 ? '#ff4d4f' : item.value > 80 ? colors.warning : colors.success}
                                            size="small"
                                        />
                                    </Space>
                                </List.Item>
                            )}
                        />
                    </ProCard>
                </Col>
                <Col xs={24} lg={8} style={{ display: 'flex' }}>
                    <ProCard title="快捷入口" headerBordered style={{ ...cardStyle, flex: 1 }}>
                        <Row gutter={[12, 12]}>
                            {quickItems.map((item, idx) => (
                                <Col span={12} key={idx}>
                                    <div
                                        style={{
                                            background: item.bg,
                                            borderRadius: 10,
                                            padding: '24px 12px',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <Avatar size={40} style={{ backgroundColor: item.color, marginBottom: 8 }} icon={item.icon} />
                                        <div style={{ fontSize: 13, color: '#333' }}>{item.name}</div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </ProCard>
                </Col>
            </Row>
        </PageContainer>
    );
};

export default Dashboard;
