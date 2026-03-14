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

import { Line } from '@ant-design/plots';
import { Empty, Spin } from 'antd';
import React from 'react';

interface TrendItem {
    label: string;
    value: number;
    name: string;
}

interface ProcessEnergyTrendChartProps {
    data: TrendItem[];
    title?: string;
    unit?: string;
    height?: number;
    loading?: boolean;
}

/**
 * 工序能耗趋势分析图表
 */
const ProcessEnergyTrendChart: React.FC<ProcessEnergyTrendChartProps> = ({
    data,
    title = '工序能耗趋势分析',
    unit = 'tce',
    height = 350,
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
        data,
        xField: 'label',
        yField: 'value',
        seriesField: 'name',
        smooth: true,
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000,
            },
        },
        yAxis: {
            title: {
                text: `能耗 (${unit})`,
            },
        },
        tooltip: {
            shared: true,
            showMarkers: true,
        },
        legend: {
            position: 'top',
        },
    };

    return (
        <div>
            <div style={{ textAlign: 'center', fontSize: 14, marginBottom: 8, color: 'rgba(0,0,0,0.65)', fontWeight: 'bold' }}>
                {title}
            </div>
            <Line {...config} />
        </div>
    );
};

export default ProcessEnergyTrendChart;
