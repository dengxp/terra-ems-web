import React from 'react';
import { Empty, Spin } from 'antd';
import { Line } from '@ant-design/plots';

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
