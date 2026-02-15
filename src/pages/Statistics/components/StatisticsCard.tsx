import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';
import { Card, Space, Statistic, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface StatisticsCardProps {
    title: string;
    value: number | string;
    unit?: string;
    precision?: number;
    compareValue?: number;
    compareLabel?: string;
    changeRate?: number;
    loading?: boolean;
    style?: React.CSSProperties;
    icon?: React.ReactNode;
    color?: string;
    isString?: boolean;
}

/**
 * 统计卡片组件
 * 固定高度，确保卡片对齐
 */
const StatisticsCard: React.FC<StatisticsCardProps> = ({
    title,
    value,
    unit = 'kWh',
    precision = 2,
    compareValue,
    compareLabel,
    changeRate,
    loading = false,
    style,
    icon,
    color = '#1890ff',
    isString = false,
}) => {
    const getRateColor = (rate: number) => {
        if (rate > 0) return '#cf1322';
        if (rate < 0) return '#3f8600';
        return '#666';
    };

    const getRateIcon = (rate: number) => {
        if (rate > 0) return <ArrowUpOutlined />;
        if (rate < 0) return <ArrowDownOutlined />;
        return <MinusOutlined />;
    };

    // 固定卡片高度，确保对齐
    const cardStyle: React.CSSProperties = {
        height: 140,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        ...style,
    };

    const bodyStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        padding: '16px 20px',
    };

    return (
        <Card
            style={cardStyle}
            loading={loading}
            bodyStyle={bodyStyle}
            bordered={false}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        color: 'rgba(0, 0, 0, 0.45)',
                        fontSize: 14,
                        marginBottom: 4
                    }}>
                        {title}
                    </div>
                    {isString ? (
                        <div style={{
                            fontSize: 24,
                            fontWeight: 600,
                            color: color,
                            lineHeight: '38px',
                        }}>
                            {value}
                        </div>
                    ) : (
                        <Statistic
                            value={value as number}
                            precision={precision}
                            suffix={<span style={{ fontSize: 14, color: '#999', marginLeft: 4 }}>{unit}</span>}
                            valueStyle={{
                                fontSize: 28,
                                fontWeight: 600,
                                color: color,
                                lineHeight: 1.2,
                            }}
                        />
                    )}
                </div>
                {icon && (
                    <div style={{
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: `${color}15`,
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 24,
                        marginLeft: 12
                    }}>
                        {icon}
                    </div>
                )}
            </div>
            {/* 对比信息区域 - 固定显示区域，避免高度变化 */}
            <div style={{ minHeight: 22, marginTop: 8 }}>
                {(compareValue !== undefined || changeRate !== undefined) && (
                    <Space size={12}>
                        {compareValue !== undefined && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                {compareLabel || '对比期'}: {compareValue?.toFixed(precision)}
                            </Text>
                        )}
                        {changeRate !== undefined && (
                            <Text style={{ color: getRateColor(changeRate), fontSize: 13 }}>
                                {getRateIcon(changeRate)} {Math.abs(changeRate).toFixed(2)}%
                            </Text>
                        )}
                    </Space>
                )}
            </div>
        </Card>
    );
};

export default StatisticsCard;
