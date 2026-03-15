/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
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

import { EnergyTypeDistribution } from '@/apis/statistics';
import { Pie } from '@ant-design/plots';
import { Empty, Spin } from 'antd';
import React from 'react';

interface ProportionChartProps {
    data: EnergyTypeDistribution[];
    title?: string;
    height?: number;
    loading?: boolean;
}

/**
 * 能源分布占比图表
 */
const ProportionChart: React.FC<ProportionChartProps> = ({
    data,
    title = '能源结构分布',
    height = 300,
    loading = false,
}) => {
    if (loading) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Spin tip="加载中..." />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Empty description="暂无数据" />
            </div>
        );
    }

    const config = {
        appendPadding: 10,
        data,
        angleField: 'value',
        colorField: 'energyTypeName',
        radius: 0.8,
        innerRadius: 0.6,
        height: height - 40,
        label: {
            type: 'outer',
            content: '{name} {percentage}',
        },
        interactions: [
            {
                type: 'element-selected',
            },
            {
                type: 'element-active',
            },
        ],
        statistic: {
            title: {
                style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'visible',
                    textOverflow: 'ellipsis',
                    fontSize: '14px',
                },
                content: '总能耗 (tce)',
            },
            content: {
                style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'visible',
                    textOverflow: 'ellipsis',
                    fontSize: '18px',
                },
                formatter: (_datum: any, data: any[]) => {
                    const total = data.reduce((a, b) => a + b.value, 0);
                    return total.toFixed(2);
                },
            },
        },
    };

    return (
        <div>
            <div style={{ textAlign: 'center', fontSize: 14, marginBottom: 8, color: 'rgba(0,0,0,0.65)' }}>
                {title}
            </div>
            <Pie {...config} />
        </div>
    );
};

export default ProportionChart;
