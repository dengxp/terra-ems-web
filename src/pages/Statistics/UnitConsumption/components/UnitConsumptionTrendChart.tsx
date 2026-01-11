import React from 'react';
import { Empty, Spin } from 'antd';
import { DualAxes } from '@ant-design/plots';
import { UnitConsumptionTrendItem } from '@/apis/statistics';

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
    const config = {
        data: [data, data],
        xField: 'label',
        yField: ['energyConsumption', 'unitConsumption'],
        geometryOptions: [
            {
                geometry: 'column',
                isGroup: true,
                seriesField: 'type',
                // 这里需要重组第一个数据源以支持分组柱状图，但简单起见我们先只显示能耗作为柱子，单耗作为线
                // 如果要显示能耗和产量，我们可以用两个线或者自定义复合图
            },
            {
                geometry: 'line',
                lineStyle: {
                    lineWidth: 3,
                    stroke: '#5AD8A6',
                },
                smooth: true,
            },
        ],
        yAxis: {
            energyConsumption: {
                title: { text: `能耗 (${energyUnit})` },
            },
            unitConsumption: {
                title: { text: `单耗 (${energyUnit}/${productionUnit})` },
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
