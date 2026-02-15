import { FallOutlined, RiseOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './index.less';
import { StatCardProps } from './types';

const StatCard: React.FC<StatCardProps> = (props) => {
    const { title, value = 0, unit = '', mode = 'simple', color = '#1890ff' } = props;

    // gradient 模式（Dashboard 使用）
    if (mode === 'gradient') {
        const { icon, gradient, trend, trendValue } = props;
        const colors = {
            success: '#52c41a',
        };

        return (
            <div
                className={styles.gradientCard}
                style={{ background: gradient }}
            >
                <div className={styles.gradientIcon} style={{ color, opacity: 0.15 }}>
                    {icon}
                </div>
                <div className={styles.gradientContent}>
                    <div className={styles.gradientTitle}>{title}</div>
                    <div className={styles.gradientValue}>
                        <span style={{ color }}>{value}</span>
                        <span className={styles.gradientUnit}>{unit}</span>
                    </div>
                    <div className={styles.gradientTrend}>
                        {trend === 'up' ? (
                            <RiseOutlined style={{ color: colors.success }} />
                        ) : (
                            <FallOutlined style={{ color: '#ff4d4f' }} />
                        )}
                        <span style={{ color: trend === 'up' ? colors.success : '#ff4d4f' }}>
                            {trendValue}
                        </span>
                        <span className={styles.gradientTrendLabel}>较上月</span>
                    </div>
                </div>
            </div>
        );
    }

    // simple 模式（DeviationAnalysis 使用）
    const { yoy, mom, diff } = props;
    return (
        <div className={styles.simpleCard}>
            <div className={styles.simpleTitle}>{title}</div>
            <div className={styles.simpleValue} style={{ color }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
                {unit}
            </div>
            <div className={styles.simpleDetails}>
                {yoy !== undefined && <span>同比: {yoy}%</span>}
                {mom !== undefined && <span>环比: {mom}%</span>}
                {diff !== undefined && <span>差值: {typeof diff === 'number' ? diff.toLocaleString() : diff}</span>}
            </div>
        </div>
    );
};

export default StatCard;
