import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Row, Col } from 'antd';
import {
    ThunderboltOutlined,
    CloudOutlined,
    RiseOutlined,
    FallOutlined,
    AlertOutlined,
    SettingOutlined,
    BarChartOutlined,
    DashboardOutlined,
    FireOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import './DashboardV2.less';



/**
 * 能源管理系统 Dashboard V2 - 高颜值版本
 */
const DashboardV2: React.FC = () => {
    const stats = [
        { title: '今日总能耗', value: '12,458', unit: 'kWh', icon: <ThunderboltOutlined />, trend: 'up', trendValue: '8.5%', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { title: '电力消耗', value: '8,234', unit: 'kWh', icon: <ThunderboltOutlined />, trend: 'down', trendValue: '3.2%', gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
        { title: '碳排放量', value: '2,156', unit: 'tCO₂', icon: <CloudOutlined />, trend: 'down', trendValue: '5.8%', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
        { title: '综合节能率', value: '15.8', unit: '%', icon: <FireOutlined />, trend: 'up', trendValue: '2.1%', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    ];

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

    const energyTypes = [
        { name: '电力', value: 45, color: '#6366f1' },
        { name: '天然气', value: 25, color: '#10b981' },
        { name: '蒸汽', value: 18, color: '#f59e0b' },
        { name: '水', value: 12, color: '#06b6d4' },
    ];

    const devices = [
        { name: '1#变压器', value: 87, status: 'normal' },
        { name: '2#变压器', value: 92, status: 'warning' },
        { name: '空压机组', value: 65, status: 'normal' },
        { name: '冷却系统', value: 78, status: 'normal' },
        { name: '照明系统', value: 45, status: 'normal' },
    ];

    const quickLinks = [
        { name: '报警管理', icon: <AlertOutlined />, color: '#ef4444' },
        { name: '设备管理', icon: <SettingOutlined />, color: '#6366f1' },
        { name: '能耗报表', icon: <BarChartOutlined />, color: '#10b981' },
        { name: '数据分析', icon: <DashboardOutlined />, color: '#8b5cf6' },
        { name: '系统设置', icon: <AppstoreOutlined />, color: '#f59e0b' },
        { name: '帮助中心', icon: <AppstoreOutlined />, color: '#06b6d4' },
    ];

    return (
        <PageContainer
            header={{
                title: '能源管理驾驶舱',
                subTitle: '实时监控 · 智能分析 · 节能增效',
            }}
        >
            <div className="dashboard-v2">
                {/* 统计卡片 */}
                <Row gutter={[20, 20]}>
                    {stats.map((item, idx) => (
                        <Col xs={24} sm={12} lg={6} key={idx}>
                            <div className="stat-card gradient" style={{ background: item.gradient }}>
                                <div className="stat-icon-bg">
                                    {item.icon}
                                </div>
                                <div className="stat-info">
                                    <div className="stat-title">{item.title}</div>
                                    <div className="stat-value">
                                        {item.value}
                                        <span className="stat-unit">{item.unit}</span>
                                    </div>
                                    <div className={`stat-trend ${item.trend}`}>
                                        {item.trend === 'up' ? <RiseOutlined /> : <FallOutlined />}
                                        <span>{item.trendValue}</span>
                                        <span className="trend-label">较上月</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {/* 图表区域 */}
                <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                    <Col xs={24} lg={16}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">本周能耗趋势</h3>
                                <a className="card-link">查看详情 →</a>
                            </div>
                            <div className="chart-area">
                                {weekData.map((item, idx) => (
                                    <div key={idx} className="chart-bar-wrapper">
                                        <div className="chart-value">{item.value}</div>
                                        <div className="chart-bar-bg">
                                            <div
                                                className="chart-bar"
                                                style={{ height: `${(item.value / maxValue) * 100}%` }}
                                            />
                                        </div>
                                        <div className="chart-label">{item.day}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} lg={8}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">能源类型分布</h3>
                            </div>
                            <div className="energy-list">
                                {energyTypes.map((item, idx) => (
                                    <div key={idx} className="energy-item">
                                        <div className="energy-info">
                                            <span className="energy-dot" style={{ background: item.color }} />
                                            <span className="energy-name">{item.name}</span>
                                            <span className="energy-value">{item.value}%</span>
                                        </div>
                                        <div className="energy-bar-bg">
                                            <div
                                                className="energy-bar"
                                                style={{ width: `${item.value}%`, background: item.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* 设备监控 + 快捷入口 */}
                <Row gutter={[20, 20]} style={{ marginTop: 20 }}>
                    <Col xs={24} lg={16}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">设备实时监控</h3>
                            </div>
                            <div className="device-list">
                                {devices.map((item, idx) => (
                                    <div key={idx} className="device-item">
                                        <div className="device-info">
                                            <span className="device-name">{item.name}</span>
                                            <span className={`device-status ${item.status}`}>
                                                {item.status === 'warning' ? '负载较高' : '正常'}
                                            </span>
                                        </div>
                                        <div className="device-bar-bg">
                                            <div
                                                className="device-bar"
                                                style={{
                                                    width: `${item.value}%`,
                                                    background: item.value > 90 ? '#ef4444' : item.value > 80 ? '#f59e0b' : '#10b981',
                                                }}
                                            />
                                        </div>
                                        <span className="device-percent">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} lg={8}>
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">快捷入口</h3>
                            </div>
                            <div className="quick-grid">
                                {quickLinks.map((item, idx) => (
                                    <div key={idx} className="quick-item">
                                        <div className="quick-icon" style={{ background: `${item.color}15`, color: item.color }}>
                                            {item.icon}
                                        </div>
                                        <span className="quick-name">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </PageContainer>
    );
};

export default DashboardV2;
