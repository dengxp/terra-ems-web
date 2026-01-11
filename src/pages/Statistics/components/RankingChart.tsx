import React from 'react';
import { Empty, Spin } from 'antd';
import { Bar } from '@ant-design/plots';
import { ComparisonAnalysis } from '@/apis/statistics';

interface RankingChartProps {
    data: ComparisonAnalysis[];
    title?: string;
    height?: number;
    loading?: boolean;
}

/**
 * 单元能耗排名图表
 */
const RankingChart: React.FC<RankingChartProps> = ({
    data,
    title = '子单元能耗排名',
    height = 400,
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
                <Empty description="暂无排名数据" />
            </div>
        );
    }

    const config = {
        data,
        xField: 'currentValue',
        yField: 'energyUnitName',
        height: height - 40,
        seriesField: 'energyUnitName',
        legend: false,
        xAxis: {
            title: {
                text: '能耗值 (tce)',
            },
        },
        label: {
            position: 'middle',
            style: {
                fill: '#FFFFFF',
                opacity: 0.6,
            },
        },
        tooltip: {
            formatter: (datum: any) => ({
                name: '累计消耗',
                value: `${datum.currentValue?.toFixed(2)} tce`,
            }),
        },
    };

    return (
        <div>
            <div style={{ textAlign: 'center', fontSize: 14, marginBottom: 8, color: 'rgba(0,0,0,0.65)' }}>
                {title}
            </div>
            <Bar {...config} />
        </div>
    );
};

export default RankingChart;
