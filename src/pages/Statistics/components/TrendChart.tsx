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

import { TrendDataItem } from '@/apis/statistics';
import { Column } from '@ant-design/plots';
import { Empty, Spin } from 'antd';
import React from 'react';

interface TrendChartProps {
    data: TrendDataItem[];
    title?: string;
    unit?: string;
    height?: number;
    loading?: boolean;
}

/**
 * 能耗趋势图表组件
 * 使用 @ant-design/plots 实现（UmiJS 推荐）
 */
const TrendChart: React.FC<TrendChartProps> = ({
    data,
    title = '能耗趋势',
    unit = 'kWh',
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

    // 转换数据格式
    const chartData = data.map(item => ({
        label: item.label,
        value: item.value || 0,
    }));

    const config = {
        data: chartData,
        xField: 'label',
        yField: 'value',
        height: height - 40,
        color: '#1890ff',
        columnStyle: {
            radius: [4, 4, 0, 0],
        },
        xAxis: {
            label: {
                autoRotate: true,
                autoHide: false,
            },
        },
        yAxis: {
            title: {
                text: unit,
            },
        },
        tooltip: {
            formatter: (datum: any) => ({
                name: '能耗',
                value: `${datum.value?.toFixed(2)} ${unit}`,
            }),
        },
        meta: {
            value: {
                alias: '能耗',
            },
        },
    };

    return (
        <div>
            {/* 标题 */}
            <div style={{ textAlign: 'center', fontSize: 14, marginBottom: 8, color: 'rgba(0,0,0,0.65)' }}>
                {title}
            </div>
            <Column {...config} />
        </div>
    );
};

export default TrendChart;
