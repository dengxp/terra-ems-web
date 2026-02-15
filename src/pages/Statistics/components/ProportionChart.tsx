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
