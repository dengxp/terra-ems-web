import { getTopologyData } from '@/apis/topology';
import { Graph, treeToGraphData } from '@antv/g6';
import { Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

/** 实体类型 → 节点样式配置 */
const NODE_STYLES: Record<string, { color: string; icon: string; size: number }> = {
    root: { color: '#13C2C2', icon: '🏭', size: 48 },
    unit: { color: '#1890FF', icon: '🏗️', size: 40 },
    gateway: { color: '#52C41A', icon: '📡', size: 36 },
    equipment: { color: '#FA8C16', icon: '⚙️', size: 36 },
    meter: { color: '#722ED1', icon: '📊', size: 32 },
};

/**
 * 系统拓扑总览页面
 */
const TopologyPage: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<Graph | null>(null);
    const [loading, setLoading] = useState(true);

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
            const treeData = buildTreeData(data);
            renderGraph(treeData);
        } catch (e) {
            console.error('加载拓扑数据失败', e);
        } finally {
            setLoading(false);
        }
    };

    /** 将后端数据构建为树形结构 */
    const buildTreeData = (data: any) => {
        const { energyUnits, gateways, equipments, meters } = data;

        // 网关按用能单元分组
        const gwByUnit: Record<number, any[]> = {};
        gateways.forEach((gw: any) => {
            const unitId = gw.energyUnit?.id || gw.energyUnitId;
            if (unitId) {
                if (!gwByUnit[unitId]) gwByUnit[unitId] = [];
                gwByUnit[unitId].push(gw);
            }
        });

        // 设备按用能单元分组
        const eqByUnit: Record<number, any[]> = {};
        equipments.forEach((eq: any) => {
            const unitId = eq.energyUnit?.id || eq.energyUnitId;
            if (unitId) {
                if (!eqByUnit[unitId]) eqByUnit[unitId] = [];
                eqByUnit[unitId].push(eq);
            }
        });

        // 仪表按设备分组
        const meterByEquip: Record<number, any[]> = {};
        const meterNoEquip: any[] = [];
        (Array.isArray(meters) ? meters : []).forEach((m: any) => {
            const eqId = m.equipment?.id || m.equipmentId;
            if (eqId) {
                if (!meterByEquip[eqId]) meterByEquip[eqId] = [];
                meterByEquip[eqId].push(m);
            } else {
                meterNoEquip.push(m);
            }
        });

        // 递归构建用能单元树
        const buildUnit = (unit: any, depth: number): any => {
            const children: any[] = [];

            // 网关
            (gwByUnit[unit.id] || []).forEach((gw: any) => {
                children.push({
                    id: `gw-${gw.id}`,
                    name: gw.name,
                    entityType: 'gateway',
                    status: gw.runStatus || 'UNKNOWN',
                    data: gw,
                });
            });

            // 设备 → 仪表
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

            // 子用能单元
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

        if (energyUnits.length > 0) {
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

        const graph = new Graph({
            container,
            width,
            height,
            autoFit: 'view',
            data: treeToGraphData(treeData),
            node: {
                type: 'rect',
                style: (d: any) => {
                    const entityType = d.data?.entityType || 'unit';
                    const config = NODE_STYLES[entityType] || NODE_STYLES.unit;
                    const isOnline = d.data?.status === 'ONLINE';
                    const isGateway = entityType === 'gateway';

                    return {
                        size: [140, config.size],
                        radius: 8,
                        fill: '#0d1b2a',
                        stroke: config.color,
                        lineWidth: isGateway && isOnline ? 2 : 1,
                        shadowColor: config.color,
                        shadowBlur: isGateway && isOnline ? 15 : 5,
                        labelText: `${config.icon} ${d.data?.name || d.id}`,
                        labelFill: '#e0e0e0',
                        labelFontSize: entityType === 'root' ? 14 : 11,
                        labelFontWeight: entityType === 'root' ? 'bold' : 'normal',
                        labelPlacement: 'center',
                    };
                },
            },
            edge: {
                type: 'cubic-horizontal',
                style: {
                    stroke: '#1890FF44',
                    lineWidth: 1.5,
                },
                animation: {
                    enter: false,
                },
            },
            layout: {
                type: 'compact-box',
                direction: 'LR',
                getHGap: () => 40,
                getVGap: () => 8,
            },
            behaviors: [
                'zoom-canvas',
                'drag-canvas',
                {
                    type: 'click-select',
                },
            ],
        });

        graph.render();
        graphRef.current = graph;

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
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                background: 'rgba(0,0,0,0.3)',
                borderBottom: '1px solid rgba(24,144,255,0.2)',
                zIndex: 10,
            }}>
                <span style={{ color: '#13C2C2', fontSize: 16, fontWeight: 600, letterSpacing: 2 }}>
                    ⚡ 系统拓扑总览
                </span>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#999' }}>
                    <span>🏗️ 用能单元</span>
                    <span>📡 网关</span>
                    <span>⚙️ 用能设备</span>
                    <span>📊 计量器具</span>
                </div>
            </div>

            {/* 图容器 */}
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 20,
                }}>
                    <Spin size="large" tip="加载拓扑数据..." />
                </div>
            )}
            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '100%',
                    paddingTop: 48,
                }}
            />
        </div>
    );
};

export default TopologyPage;
