import { getTopologyData } from '@/apis/topology';
import { Graph, treeToGraphData } from '@antv/g6';
import { Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
/** 实体类型 → 节点样式配置 */
const NODE_STYLES: Record<string, { color: string; shape: string; label: string }> = {
    unit:      { color: '#40A9FF', shape: 'diamond',  label: '用能单元' },
    gateway:   { color: '#73D13D', shape: 'circle',   label: '网关' },
    equipment: { color: '#FFA940', shape: 'rect',     label: '用能设备' },
    meter:     { color: '#B37FEB', shape: 'triangle', label: '计量器具' },
};

/**
 * 系统拓扑总览页面
 */
const TopologyPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ units: 0, gateways: 0, equipments: 0, meters: 0 });

    useEffect(() => {
        loadAndRender();
        return () => {
            graphRef.current?.destroy();
        };
    }, []);

    const loadAndRender = async () => {
        setLoading(true);
        try {
            const data = await getTopologyData();
            setStats({
                units: countNodes(data.energyUnits),
                gateways: data.gateways?.length || 0,
                equipments: data.equipments?.length || 0,
                meters: Array.isArray(data.meters) ? data.meters.length : 0,
            });
            const treeData = buildTreeData(data);
            renderGraph(treeData);
        } catch (e) {
            console.error('加载拓扑数据失败', e);
        } finally {
            setLoading(false);
        }
    };

    const countNodes = (units: any[]): number => {
        let count = 0;
        units?.forEach((u: any) => {
            count++;
            if (u.children) count += countNodes(u.children);
        });
        return count;
    };

    /** 将后端数据构建为树形结构 */
    const buildTreeData = (data: any) => {
        const { energyUnits, gateways, equipments, meters } = data;

        const gwByUnit: Record<number, any[]> = {};
        gateways?.forEach((gw: any) => {
            const unitId = gw.energyUnit?.id || gw.energyUnitId;
            if (unitId) {
                if (!gwByUnit[unitId]) gwByUnit[unitId] = [];
                gwByUnit[unitId].push(gw);
            }
        });

        const eqByUnit: Record<number, any[]> = {};
        equipments?.forEach((eq: any) => {
            const unitId = eq.energyUnit?.id || eq.energyUnitId;
            if (unitId) {
                if (!eqByUnit[unitId]) eqByUnit[unitId] = [];
                eqByUnit[unitId].push(eq);
            }
        });

        const meterByEquip: Record<number, any[]> = {};
        (Array.isArray(meters) ? meters : []).forEach((m: any) => {
            const eqId = m.equipment?.id || m.equipmentId;
            if (eqId) {
                if (!meterByEquip[eqId]) meterByEquip[eqId] = [];
                meterByEquip[eqId].push(m);
            }
        });

        const buildUnit = (unit: any, depth: number): any => {
            const children: any[] = [];

            (gwByUnit[unit.id] || []).forEach((gw: any) => {
                children.push({
                    id: `gw-${gw.id}`,
                    name: gw.name,
                    entityType: 'gateway',
                    status: gw.runStatus || 'UNKNOWN',
                    data: gw,
                });
            });

            (eqByUnit[unit.id] || []).forEach((eq: any) => {
                const meterChildren = (meterByEquip[eq.id] || []).map((m: any) => ({
                    id: `meter-${m.id}`,
                    name: m.name,
                    entityType: 'meter',
                    data: m,
                }));
                children.push({
                    id: `eq-${eq.id}`,
                    name: eq.name,
                    entityType: 'equipment',
                    data: eq,
                    children: meterChildren.length > 0 ? meterChildren : undefined,
                });
            });

            (unit.children || []).forEach((child: any) => {
                children.push(buildUnit(child, depth + 1));
            });

            return {
                id: `unit-${unit.id}`,
                name: unit.name,
                entityType: 'unit',
                data: unit,
                children: children.length > 0 ? children : undefined,
            };
        };

        if (energyUnits?.length > 0) {
            return buildUnit(energyUnits[0], 0);
        }
        return { id: 'empty', name: '暂无数据', entityType: 'unit' };
    };

    /** 渲染 G6 图 */
    const renderGraph = (treeData: any) => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        const width = container.offsetWidth;
        const height = container.offsetHeight;

        if (graphRef.current) {
            graphRef.current.destroy();
        }

        const graphData = treeToGraphData(treeData);

        const graph = new Graph({
            container,
            width,
            height,
            autoFit: 'center',
            data: graphData,
            node: {
                type: (d: any) => {
                    const entityType = d.data?.entityType || 'unit';
                    return NODE_STYLES[entityType]?.shape || 'circle';
                },
                style: (d: any) => {
                    const entityType = d.data?.entityType || 'unit';
                    const config = NODE_STYLES[entityType] || NODE_STYLES.unit;
                    return {
                        size: 18,
                        fill: config.color,
                        stroke: config.color,
                        lineWidth: 1,
                        shadowColor: `${config.color}88`,
                        shadowBlur: 10,
                        cursor: 'pointer',
                        labelText: d.data?.name || d.id,
                        labelFill: config.color,
                        labelFontSize: 12,
                        labelPlacement: 'right',
                        labelOffsetX: 8,
                    };
                },
                animation: {
                    enter: 'fade-in',
                },
            },
            edge: {
                type: 'cubic-horizontal',
                style: {
                    stroke: '#1890FF33',
                    lineWidth: 1,
                    endArrow: true,
                    endArrowSize: 3,
                    endArrowFill: '#1890FF55',
                    lineDash: [4, 4],
                },
                animation: {
                    enter: 'fade-in',
                },
            },
            layout: {
                type: 'compact-box',
                direction: 'LR',
                getHGap: () => 50,
                getVGap: () => 6,
            },
            behaviors: [
                'zoom-canvas',
                'drag-canvas',
            ],
            animation: {
                duration: 500,
            },
        });

        graph.render();
        graphRef.current = graph;

        // 边的流动动画 — 定时更新边样式模拟数据流
        startFlowAnimation(graph);

        // 响应窗口大小变化
        const resizeObserver = new ResizeObserver(() => {
            if (containerRef.current && graphRef.current) {
                graphRef.current.resize(
                    containerRef.current.offsetWidth,
                    containerRef.current.offsetHeight,
                );
            }
        });
        resizeObserver.observe(container);
    };

    /** 边流动动画 */
    const startFlowAnimation = (graph: Graph) => {
        let offset = 0;
        const animate = () => {
            if (!graphRef.current) return;
            offset = (offset + 1) % 20;
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    };

    return (
        <div style={{
            width: '100%',
            height: 'calc(100vh - 120px)',
            background: 'linear-gradient(135deg, #0a1929 0%, #0d2137 50%, #0a1929 100%)',
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* 标题栏 */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                background: 'rgba(0,0,0,0.4)',
                borderBottom: '1px solid rgba(24,144,255,0.15)',
                zIndex: 10,
                backdropFilter: 'blur(10px)',
            }}>
                <span style={{ color: '#13C2C2', fontSize: 16, fontWeight: 600, letterSpacing: 3 }}>
                    ⚡ 系统拓扑总览
                </span>
                <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
                    <StatBadge label="用能单元" count={stats.units} color="#40A9FF" />
                    <StatBadge label="网关" count={stats.gateways} color="#73D13D" />
                    <StatBadge label="用能设备" count={stats.equipments} color="#FFA940" />
                    <StatBadge label="计量器具" count={stats.meters} color="#B37FEB" />
                </div>
            </div>

            {/* 底部装饰线 */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 2,
                background: 'linear-gradient(90deg, transparent, #1890FF44, #13C2C2, #1890FF44, transparent)',
            }} />

            {/* 图容器 */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20,
                }}>
                    <Spin size="large" />
                </div>
            )}
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: 'calc(100% - 52px)',
                    marginTop: 52,
                }}
            />

            {/* 呼吸灯 CSS 动画 */}
            <style>{`
                @keyframes breathe {
                    0%, 100% { opacity: 0.4; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.05); }
                }
                @keyframes flow {
                    0% { stroke-dashoffset: 20; }
                    100% { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
};

/** 统计徽标组件 */
const StatBadge: React.FC<{ label: string; count: number; color: string }> = ({ label, count, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}`,
        }} />
        <span style={{ color: '#999' }}>{label}</span>
        <span style={{
            color,
            fontWeight: 600,
            fontSize: 14,
            textShadow: `0 0 8px ${color}88`,
        }}>
            {count}
        </span>
    </div>
);

export default TopologyPage;
