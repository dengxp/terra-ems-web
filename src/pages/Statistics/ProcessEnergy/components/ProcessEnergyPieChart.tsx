import React from 'react';
import { Empty, Spin } from 'antd';
import { Pie } from '@ant-design/plots';

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
