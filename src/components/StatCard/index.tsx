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
