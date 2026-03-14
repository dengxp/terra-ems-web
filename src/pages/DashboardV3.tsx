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

import {
  AppstoreOutlined, CloudOutlined, FallOutlined,
  FireOutlined, GlobalOutlined,
  NodeIndexOutlined, RiseOutlined, SafetyCertificateOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { Area, Pie } from '@ant-design/plots';
import { Col, Progress, Row, Space, Tag, Tooltip, Typography } from 'antd';
import React from 'react';
import './DashboardV3.less';

const { Title, Text } = Typography;

/**
 * 能源监控驾驶舱 V3 - 玻璃拟态专业版
 * 基于 ui-ux-pro-max 设计规范
 */
const DashboardV3: React.FC = () => {
    // 模拟数据：实时能耗曲线
    const areaData = [
        { time: '00:00', value: 120 }, { time: '02:00', value: 110 },
        { time: '04:00', value: 135 }, { time: '06:00', value: 240 },
        { time: '08:00', value: 450 }, { time: '10:00', value: 520 },
        { time: '12:00', value: 480 }, { time: '14:00', value: 550 },
        { time: '16:00', value: 600 }, { time: '18:00', value: 510 },
        { time: '20:00', value: 320 }, { time: '22:00', value: 180 },
    ];

    // 模拟数据：能源分布
    const pieData = [
        { type: '电力', value: 65 },
        { type: '天然 gas', value: 25 },
        { type: '蒸汽', value: 10 },
    ];

    // 模拟设备监控
    const devices = [
        { name: '1#总变', status: 'online' },
        { name: '2#总变', status: 'online' },
        { name: '空压机', status: 'warning' },
        { name: '水泵房', status: 'online' },
        { name: '锅炉房', status: 'online' },
        { name: '照明系统', status: 'online' },
        { name: '3#车间', status: 'offline' },
        { name: '冷水机', status: 'online' },
    ];

    return (
        <div className="dashboard-v3">
            {/* 1. 顶部状态栏 */}
            <div className="dashboard-header">
                <div className="header-title">
                    <Title level={2}>能源监控驾驶舱 <Tag color="blue" bordered={false} style={{ verticalAlign: 'middle', marginLeft: 8 }}>V3.0 PRO</Tag></Title>
                    <Text type="secondary">实时监测站：Terra Industrial Park - Central Node</Text>
                </div>
                <div className="header-status">
                    <div className="status-indicator">
                        <div className="pulse-dot online"></div>
                        <span>网关通信：在线 (延迟 4ms)</span>
                    </div>
                    <div className="target-progress">
                        <div className="progress-label">
                            <span>碳中和进度</span>
                            <span>78%</span>
                        </div>
                        <Progress percent={78} strokeColor="#52c41a" showInfo={false} size="small" />
                    </div>
                    <Space size="middle">
                        <Tooltip title="安全等级：高"><SafetyCertificateOutlined style={{ color: '#52c41a', fontSize: 20 }} /></Tooltip>
                        <Tooltip title="全球节点"><GlobalOutlined style={{ color: '#1890ff', fontSize: 20 }} /></Tooltip>
                    </Space>
                </div>
            </div>

            {/* 2. 核心指标区 */}
            <Row gutter={[24, 24]}>
                {[
                    { title: '今日总能耗', value: '25,684', unit: 'kWh', icon: <ThunderboltOutlined />, trend: 'down', trendVal: '4.2%', color: '#1890ff', bg: 'rgba(24, 144, 255, 0.1)' },
                    { title: '碳排放总量', value: '4.82', unit: 'tCO₂', icon: <CloudOutlined />, trend: 'down', trendVal: '1.5%', color: '#13c2c2', bg: 'rgba(19, 194, 194, 0.1)' },
                    { title: '标准煤消耗', value: '3.15', unit: 'tce', icon: <FireOutlined />, trend: 'up', trendVal: '2.8%', color: '#faad14', bg: 'rgba(250, 173, 20, 0.1)' },
                    { title: '实时总负荷', value: '856', unit: 'kW', icon: <NodeIndexOutlined />, trend: 'up', trendVal: '11%', color: '#722ed1', bg: 'rgba(114, 46, 209, 0.1)' },
                ].map((item, idx) => (
                    <Col xs={24} sm={12} lg={6} key={idx}>
                        <div className="glass-card stat-card-v3">
                            <div>
                                <div className="icon-container" style={{ backgroundColor: item.bg, color: item.color }}>{item.icon}</div>
                                <div className="stat-label">{item.title}</div>
                                <div className="stat-value" style={{ color: item.color }}>{item.value}<span style={{ fontSize: 14, fontWeight: 400, marginLeft: 4, color: '#999' }}>{item.unit}</span></div>
                            </div>
                            <div className="stat-footer">
                                <span style={{ color: '#999' }}>较昨日同期</span>
                                <span style={{ color: item.trend === 'up' ? '#ff4d4f' : '#52c41a', fontWeight: 600 }}>
                                    {item.trend === 'up' ? <RiseOutlined /> : <FallOutlined />} {item.trendVal}
                                </span>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>

            {/* 3. 趋势与分布 */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <div className="glass-card">
                        <div className="card-header">
                            <Title level={5} className="card-title">实时能耗趋势 (24h)</Title>
                            <Tag color="processing">实时更新中</Tag>
                        </div>
                        <div style={{ height: 300 }}>
                            <Area
                                data={areaData}
                                xField="time"
                                yField="value"
                                shapeField="smooth"
                                style={{
                                    fill: 'linear-gradient(to top, #ffffff, #1890ff)',
                                    fillOpacity: 0.1,
                                    stroke: '#1890ff',
                                    lineWidth: 2,
                                }}
                                tooltip={{
                                    channel: 'y',
                                    valueFormatter: (val: any) => `${val} kWh`,
                                }}
                                axis={{
                                    y: { title: '能耗量 (kWh)' },
                                    x: { labelFontSize: 11 }
                                }}
                            />
                        </div>
                    </div>
                </Col>
                <Col xs={24} lg={8}>
                    <div className="glass-card">
                        <div className="card-header">
                            <Title level={5} className="card-title">能源类型配比</Title>
                        </div>
                        <div style={{ height: 300 }}>
                            <Pie
                                data={pieData}
                                angleField="value"
                                colorField="type"
                                innerRadius={0.6}
                                label={{
                                    text: 'type',
                                    position: 'outside',
                                    style: {
                                        fontWeight: 'bold',
                                    },
                                }}
                                legend={{
                                    color: {
                                        position: 'bottom',
                                        layout: {
                                            justifyContent: 'center',
                                        }
                                    }
                                }}
                                scale={{
                                    color: { range: ['#1890ff', '#52c41a', '#faad14'] }
                                }}
                            />
                        </div>
                    </div>
                </Col>
            </Row>

            {/* 4. 底层监控区 */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <div className="glass-card">
                        <div className="card-header">
                            <Title level={5} className="card-title">核心设备实时状态</Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>Total: 128 nodes</Text>
                        </div>
                        <div className="device-grid">
                            {devices.map((dev, i) => (
                                <div key={i} className="device-box">
                                    <div className={`status-indicator`} style={{ justifyContent: 'center', marginBottom: 8 }}>
                                        <div className={`pulse-dot ${dev.status}`}></div>
                                    </div>
                                    <AppstoreOutlined className="device-icon" />
                                    <div className="device-name">{dev.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
                <Col xs={24} lg={12}>
                    <div className="glass-card">
                        <div className="card-header">
                            <Title level={5} className="card-title">今日各车间能效榜单 (Top 5)</Title>
                        </div>
                        <div style={{ padding: '4px 0' }}>
                            {[
                                { name: '机加工一车间', val: 98.5, color: '#52c41a' },
                                { name: '精密组装中心', val: 95.2, color: '#1890ff' },
                                { name: '自动化涂装线', val: 88.7, color: '#13c2c2' },
                                { name: '热处理分厂', val: 82.4, color: '#faad14' },
                                { name: '物流仓储中心', val: 76.8, color: '#ff4d4f' },
                            ].map((row, i) => (
                                <div key={i} style={{ marginBottom: 16 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <Text style={{ fontSize: 13 }}>{i + 1}. {row.name}</Text>
                                        <Text strong style={{ color: row.color }}>{row.val}%</Text>
                                    </div>
                                    <Progress percent={row.val} strokeColor={row.color} showInfo={false} size="small" />
                                </div>
                            ))}
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardV3;
