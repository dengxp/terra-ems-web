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

import { Pie } from '@ant-design/plots';
import { Empty, Spin } from 'antd';
import React from 'react';

interface ProcessEnergyPieChartProps {
    data: { name: string; value: number }[];
    title?: string;
    unit?: string;
    height?: number;
    loading?: boolean;
}

/**
 * 工序能耗占比饼图
 */
const ProcessEnergyPieChart: React.FC<ProcessEnergyPieChartProps> = ({
    data,
    title = '工序能耗占比分析',
    unit = 'tce',
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
        colorField: 'name',
        radius: 0.8,
        label: {
            type: 'outer',
            content: '{name}: {percentage}',
        },
        interactions: [
            {
                type: 'element-active',
            },
        ],
        tooltip: {
            formatter: (datum: any) => {
                return { name: datum.name, value: `${datum.value.toFixed(2)} ${unit}` };
            },
        },
        legend: {
            position: 'bottom',
        },
    };

    return (
        <div>
            <div style={{ textAlign: 'center', fontSize: 14, marginBottom: 8, color: 'rgba(0,0,0,0.65)', fontWeight: 'bold' }}>
                {title}
            </div>
            <Pie {...config} />
        </div>
    );
};

export default ProcessEnergyPieChart;
