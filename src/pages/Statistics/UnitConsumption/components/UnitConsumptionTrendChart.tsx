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

import { UnitConsumptionTrendItem } from '@/apis/statistics';
import { DualAxes } from '@ant-design/plots';
import { Empty, Spin } from 'antd';
import React from 'react';

interface UnitConsumptionTrendChartProps {
    data: UnitConsumptionTrendItem[];
    title?: string;
    energyUnit?: string;
    productionUnit?: string;
    height?: number;
    loading?: boolean;
}

/**
 * 单耗分析趋势图表（双轴）
 * 展示：产量与能耗（柱状图/折线轴1）、单耗（折线轴2）
 */
const UnitConsumptionTrendChart: React.FC<UnitConsumptionTrendChartProps> = ({
    data,
    title = '单耗趋势分析',
    energyUnit = 'tce',
    productionUnit = 't',
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

    // 转换数据格式，适应 DualAxes
    // 我们需要将产量和能耗作为一组，单耗作为另一组
    // 为了更好的展示，我们重新构建下数据，将能耗和产量都放在第一个轴的视图中（如果 plots 支持）
    // 或者我们显示 能耗(柱), 产量(折线,左轴), 单耗(折线,右轴)

    // 方案 2: 使用更简单的配置，只比对能耗和单耗
    const simplifiedConfig = {
        data: [data, data],
        xField: 'label',
        yField: ['energyConsumption', 'unitConsumption'],
        height: height - 40,
        geometryOptions: [
            {
                geometry: 'column',
                color: '#5B8FF9',
            },
            {
                geometry: 'line',
                color: '#5AD8A6',
                smooth: true,
                lineStyle: {
                    lineWidth: 3,
                },
                point: {
                    shape: 'circle',
                    size: 4,
                    style: {
                        fill: '#5AD8A6',
                        stroke: '#fff',
                        lineWidth: 2,
                    },
                },
            },
        ],
        yAxis: {
            energyConsumption: {
                title: {
                    text: `能耗 (${energyUnit})`,
                    style: { fill: '#5B8FF9' },
                },
            },
            unitConsumption: {
                title: {
                    text: `单耗 (${energyUnit}/${productionUnit})`,
                    style: { fill: '#5AD8A6' },
                },
            },
        },
        meta: {
            energyConsumption: {
                alias: '综合能耗',
                formatter: (v: number) => `${v.toFixed(2)} ${energyUnit}`,
            },
            unitConsumption: {
                alias: '单位单耗',
                formatter: (v: number) => `${v.toFixed(4)}`,
            },
        },
    };

    return (
        <div>
            <div style={{ textAlign: 'center', fontSize: 14, marginBottom: 8, color: 'rgba(0,0,0,0.65)', fontWeight: 'bold' }}>
                {title}
            </div>
            <DualAxes {...simplifiedConfig} />
        </div>
    );
};

export default UnitConsumptionTrendChart;
