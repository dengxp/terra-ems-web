import { getTopologyData } from '@/apis/topology';
import { Graph, treeToGraphData, register, ExtensionCategory } from '@antv/g6';
import { Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

/** 实体类型 → 节点样式配置 */
const NODE_STYLES: Record<string, { color: string; icon: string; glowColor: string }> = {
    root: { color: '#13C2C2', icon: '🏭', glowColor: 'rgba(19,194,194,0.4)' },
    unit: { color: '#1890FF', icon: '🏗️', glowColor: 'rgba(24,144,255,0.3)' },
    gateway: { color: '#52C41A', icon: '📡', glowColor: 'rgba(82,196,26,0.4)' },
    equipment: { color: '#FA8C16', icon: '⚙️', glowColor: 'rgba(250,140,22,0.3)' },
    meter: { color: '#722ED1', icon: '📊', glowColor: 'rgba(114,46,209,0.3)' },
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
                entityType: depth === 0 ? 'root' : 'unit',
                data: unit,
                children: children.length > 0 ? children : undefined,
            };
        };

        if (energyUnits?.length > 0) {
            return buildUnit(energyUnits[0], 0);
        }
        return { id: 'empty', name: '暂无数据', entityType: 'root' };
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
            autoFit: 'view',
            padding: [20, 80, 20, 80],
            data: graphData,
            node: {
                type: 'rect',
                style: (d: any) => {
                    const entityType = d.data?.entityType || 'unit';
                    const config = NODE_STYLES[entityType] || NODE_STYLES.unit;
                    const isRoot = entityType === 'root';
                    const nodeWidth = isRoot ? 160 : 140;
                    const nodeHeight = isRoot ? 50 : 38;

                    return {
                        size: [nodeWidth, nodeHeight],
                        radius: isRoot ? 12 : 6,
                        fill: isRoot ? 'rgba(19,194,194,0.1)' : 'rgba(13,27,42,0.9)',
                        stroke: config.color,
                        lineWidth: isRoot ? 2 : 1,
                        shadowColor: config.glowColor,
                        shadowBlur: isRoot ? 20 : 8,
                        cursor: 'pointer',
                        // 标签
                        labelText: `${config.icon} ${d.data?.name || d.id}`,
                        labelFill: isRoot ? '#13C2C2' : '#d0d0d0',
                        labelFontSize: isRoot ? 14 : 11,
                        labelFontWeight: isRoot ? 'bold' : 'normal',
                        labelPlacement: 'center',
                        // 状态徽标（网关显示在线状态）
                        ...(entityType === 'gateway' ? {
                            badgeFill: d.data?.status === 'ONLINE' ? '#52C41A' : '#ff4d4f',
                            badgeText: '',
                            badgePlacement: 'right-top',
                            badgePadding: [2, 2],
                        } : {}),
                        // 呼吸灯光晕 — 所有节点都有微弱的光晕
                        halo: true,
                        haloFill: config.glowColor,
                        haloStroke: 'transparent',
                        haloLineWidth: 0,
                    };
                },
                animation: {
                    enter: 'fade-in',
                },
            },
            edge: {
                type: 'cubic-horizontal',
                style: (d: any) => {
                    // 根据源节点类型设置边的颜色
                    const sourceNode = graphData.nodes?.find((n: any) => n.id === d.source);
                    const entityType = sourceNode?.data?.entityType || 'unit';
                    const config = NODE_STYLES[entityType] || NODE_STYLES.unit;

                    return {
                        stroke: `${config.color}66`,
                        lineWidth: 1.5,
                        endArrow: true,
                        endArrowSize: 4,
                        endArrowFill: `${config.color}66`,
                    };
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
                    <StatBadge icon="🏗️" label="用能单元" count={stats.units} color="#1890FF" />
                    <StatBadge icon="📡" label="网关" count={stats.gateways} color="#52C41A" />
                    <StatBadge icon="⚙️" label="用能设备" count={stats.equipments} color="#FA8C16" />
                    <StatBadge icon="📊" label="计量器具" count={stats.meters} color="#722ED1" />
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
const StatBadge: React.FC<{ icon: string; label: string; count: number; color: string }> = ({ icon, label, count, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span>{icon}</span>
        <span style={{ color: '#888' }}>{label}</span>
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
