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

    // 仅展示有能耗的数据，并按降序排列
    const chartData = [...data]
        .filter(item => item.currentValue > 0)
        .sort((a, b) => b.currentValue - a.currentValue);

    // 为每个数据项添加排名标签
    const dataWithRank = chartData.map((item, index) => ({
        ...item,
        rankName: `${index + 1}. ${item.energyUnitName}`,
    }));

    const config: any = {
        data: dataWithRank,
        // Plots V2 Bar：xField 映射分类（垂直），yField 映射数值（水平）
        xField: 'rankName',
        yField: 'currentValue',
        colorField: 'energyUnitName',
        height: height - 40,
        legend: false,
        // 当数据量多时启用滚动条
        scrollbar: dataWithRank.length > 10 ? { type: 'y' } : undefined,
        label: {
            text: 'currentValue',
            position: 'right',
            style: {
                dx: 5,
            },
            formatter: (val: any) => (val > 0 ? val.toFixed(2) : ''),
        },
        axis: {
            y: {
                title: '能耗值 (tce)',
            },
            x: {
                labelFontSize: 11,
            }
        },
        tooltip: {
            // V2 简写：显示 y 轴渠道的数据
            channel: 'y',
            valueFormatter: (val: any) => `${val.toFixed(2)} tce`,
        },
        // 留出左侧空间给名称，右侧空间给标签
        paddingLeft: 100,
        paddingRight: 60,
    };

    return (
        <div style={{ padding: '0 8px' }}>
            <div style={{ textAlign: 'center', fontSize: 13, marginBottom: 8, color: 'rgba(0,0,0,0.45)' }}>
                {title}
            </div>
            <Bar {...config} />
        </div>
    );
};

export default RankingChart;
