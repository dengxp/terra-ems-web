/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
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

import { EnergyUnit, getEnergyUnitTree } from '@/apis/energyUnit';
import { Equipment, getEquipmentsByEnergyUnitId } from '@/apis/equipment';
import { getMeters, updateMeter, Meter } from '@/apis/meter';
import { getMeterPointsByMeterId, MeterPoint } from '@/apis/meterPoint';
import { DeleteButton, IconButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import useCrud from "@/hooks/common/useCrud";
import { ReactComponent as MoveTo } from '@/icons/svg/move-to.svg';
import { generateList, getParentKey } from "@/utils/tree";
import Icon, {
    DeleteOutlined, EditOutlined, PlusOutlined, SettingOutlined,
    DownOutlined, RightOutlined
} from '@ant-design/icons';
import { ProDescriptions } from '@ant-design/pro-components';
import type { TreeDataNode } from 'antd';
import { Button, Dropdown, Empty, Flex, Input, List, message, Space, Splitter, Tabs, Tag, Tree, Spin } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import EnergyUnitForm from './components/EnergyUnitForm';
import MeterPointChartDialog from './components/MeterPointChartDialog';
import MoveEnergyUnitDialog from './components/MoveEnergyUnitDialog';

const MeterListItem: React.FC<{ meter: Meter; onRemove: () => void }> = ({ meter, onRemove }) => {
    const [expanded, setExpanded] = useState(false);
    const [points, setPoints] = useState<MeterPoint[]>([]);
    const [loading, setLoading] = useState(false);
    
    // 历史数据弹窗状态
    const [chartOpen, setChartOpen] = useState(false);
    const [activePoint, setActivePoint] = useState<MeterPoint | null>(null);

    const toggleExpand = async () => {
        if (!expanded && points.length === 0) {
            setLoading(true);
            try {
                const res = await getMeterPointsByMeterId(meter.id);
                if (res.success) setPoints(res.data || []);
            } finally {
                setLoading(false);
            }
        }
        setExpanded(!expanded);
    };

    return (
        <List.Item
            className="rounded transition-all duration-300 flex flex-col items-start bg-white hover:shadow-sm"
            style={{ padding: '8px 12px', margin: '6px 0', border: '1px solid #e8e8e8', borderColor: expanded ? '#1677ff40' : '#e8e8e8' }}
        >
            <div 
                className="flex justify-between w-full items-center cursor-pointer select-none"
                onClick={toggleExpand}
            >
                <Space>
                    <span style={{ display: 'inline-block', width: 14, textAlign: 'center', transition: 'transform 0.3s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                        <RightOutlined style={{ fontSize: 12, color: '#aaa' }} />
                    </span>
                    <Tag color={meter.energyType?.color || 'blue'} style={{ margin: 0 }}>
                        {meter.energyType?.name || '未知'}
                    </Tag>
                    <span style={{ fontWeight: expanded ? 500 : 400, color: expanded ? '#1677ff' : '#333', transition: 'color 0.3s' }}>{meter.name}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>({meter.code})</span>
                </Space>
                <div onClick={(e) => e.stopPropagation()}>
                    <DeleteButton tooltip="移除关联" onClick={onRemove} />
                </div>
            </div>
            
            {expanded && (
                <div className="w-full mt-3 pl-4 relative">
                    {/* 竖线装饰 */}
                    <div style={{ position: 'absolute', left: 4, top: 0, bottom: 0, width: 2, backgroundColor: '#f0f0f0' }}></div>

                    {loading ? (
                        <div className="py-4 text-center">
                            <Spin size="small" /> <span style={{ color: '#999', fontSize: 12, marginLeft: 8 }}>加载点位中...</span>
                        </div>
                    ) : points.length > 0 ? (
                        <List
                            size="small"
                            dataSource={points}
                            style={{ backgroundColor: '#fafafa', borderRadius: 4, padding: '4px 8px' }}
                            renderItem={(p) => (
                                <List.Item style={{ padding: '6px 0', borderBottom: '1px dashed #e8e8e8' }}>
                                    <Space className="w-full flex justify-between">
                                        <Space>
                                            <span style={{ color: '#555', fontSize: 13 }}>{p.name}</span>
                                            <span style={{ color: '#999', fontSize: 12 }}>({p.code})</span>
                                        </Space>
                                        {(() => {
                                            let color = 'cyan';
                                            let text = p.pointType;
                                            if (p.pointType === 'COLLECT') {
                                                color = 'blue';
                                                text = '采集点';
                                            } else if (p.pointType === 'CALCULATE' || p.pointType === 'CALC') {
                                                color = 'purple';
                                                text = '计算点';
                                            } else if (p.pointType === 'MANUAL') {
                                                color = 'orange';
                                                text = '手工点';
                                            } else if (p.pointType === 'VIRTUAL') {
                                                color = 'default';
                                                text = '虚拟点';
                                            }

                                            return (
                                                <Space>
                                                    <Tag color={color} bordered={false} style={{ fontSize: 12, margin: 0, lineHeight: '20px' }}>
                                                        {text}
                                                    </Tag>
                                                    <Button 
                                                        type="link" 
                                                        size="small" 
                                                        onClick={() => {
                                                            setActivePoint(p);
                                                            setChartOpen(true);
                                                        }}
                                                        style={{ padding: 0, fontSize: 12 }}
                                                    >
                                                        历史数据
                                                    </Button>
                                                </Space>
                                            );
                                        })()}
                                    </Space>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <div className="py-3 text-center" style={{ backgroundColor: '#fafafa', borderRadius: 4 }}>
                            <span style={{ color: '#bfbfbf', fontSize: 12 }}>没有查找到关联的计量点</span>
                        </div>
                    )}
                </div>
            )}
            
            {/* 历史数据弹窗 */}
            <MeterPointChartDialog 
                open={chartOpen}
                onOpenChange={setChartOpen}
                point={activePoint}
            />
        </List.Item>
    );
};

/**
 * 用能单元管理页面
 */
const EnergyUnitPage: React.FC = () => {
    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
    const [selectedNode, setSelectedNode] = useState<EnergyUnit | null>(null);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [moveVisible, setMoveVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    // 用于保存原始数据以便查找节点
    const [_rawData, setRawData] = useState<EnergyUnit[]>([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [contextMenuVisible, setContextMenuVisible] = useState(false);
    const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
    const [contextMenuNode, setContextMenuNode] = useState<EnergyUnit | null>(null);
    // 计量器具相关
    const [meters, setMeters] = useState<Meter[]>([]);
    const [metersLoading, setMetersLoading] = useState(false);
    // 用能设备相关
    const [equipments, setEquipments] = useState<Equipment[]>([]);
    const [equipmentsLoading, setEquipmentsLoading] = useState(false);

    const {
        getState,
        updateState,
        toCreate,
        toEdit,
        toDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<EnergyUnit>({
        entityName: '用能单元',
        pathname: '/basic-data/energy-unit',
        baseUrl: '/api/energy-units',
    });

    const state = getState('/basic-data/energy-unit');

    // 将 EnergyUnit 转换为 antd Tree 的 TreeDataNode
    const convertToTreeData = useCallback((nodes: EnergyUnit[]): TreeDataNode[] => {
        return nodes.map((node) => ({
            key: node.id,
            title: node.name,
            children: node.children ? convertToTreeData(node.children) : undefined,
            isLeaf: !node.children || node.children.length === 0,
            rawData: node, // 保存原始数据供上下文菜单展示
        } as any));
    }, []);

    // 查找节点（递归）
    const findNode = useCallback((id: number, nodes: EnergyUnit[]): EnergyUnit | null => {
        for (const node of nodes) {
            if (node.id === id) return node;
            if (node.children) {
                const found = findNode(id, node.children);
                if (found) return found;
            }
        }
        return null;
    }, []);

    // 加载树形数据
    const loadTree = useCallback(async () => {
        updateState('/basic-data/energy-unit', { loading: true });
        try {
            const res = await getEnergyUnitTree();
            if (res.success && res.data) {
                setRawData(res.data);
                const treeRows = convertToTreeData(res.data);
                setTreeData(treeRows);

                // 默认展开所有节点
                const getAllKeys = (nodes: EnergyUnit[]): React.Key[] => {
                    let keys: React.Key[] = [];
                    for (const node of nodes) {
                        keys.push(node.id);
                        if (node.children) {
                            keys = keys.concat(getAllKeys(node.children));
                        }
                    }
                    return keys;
                };
                setExpandedKeys(getAllKeys(res.data));

                // 如果之前有选中的节点，尝试恢复选中状态
                if (selectedNode) {
                    const node = findNode(selectedNode.id, res.data);
                    if (node) {
                        setSelectedNode(node);
                        setSelectedKeys([node.id]);
                    }
                } else if (res.data.length > 0) {
                    // 默认选中第一个节点
                    setSelectedNode(res.data[0]);
                    setSelectedKeys([res.data[0].id]);
                }
            }
        } catch (error) {
            messageApi.error('加载数据失败');
        } finally {
            updateState('/basic-data/energy-unit', { loading: false });
        }
    }, [convertToTreeData, messageApi, selectedNode, updateState, findNode]);

    useEffect(() => {
        loadTree();
    }, []);

    // 加载选中节点的计量器具
    const loadMeters = useCallback(async (unitId: number) => {
        setMetersLoading(true);
        try {
            const res = await getMeters({ current: 1, pageSize: 1000, energyUnitId: unitId });
            if (res.success) {
                setMeters(res.data?.content || []);
            }
        } catch (error) {
            console.error('加载计量器具失败', error);
        } finally {
            setMetersLoading(false);
        }
    }, []);

    // 加载选中节点的用能设备
    const loadEquipments = useCallback(async (unitId: number) => {
        setEquipmentsLoading(true);
        try {
            const res = await getEquipmentsByEnergyUnitId(unitId);
            if (res.success) {
                setEquipments(res.data || []);
            }
        } catch (error) {
            console.error('加载用能设备失败', error);
        } finally {
            setEquipmentsLoading(false);
        }
    }, []);

    // 选中节点
    const handleSelect = (keys: React.Key[], info: any) => {
        setSelectedKeys(keys);
        if (keys.length > 0 && info.node) {
            const node = (info.node as any).rawData as EnergyUnit;
            setSelectedNode(node);
            // 加载该节点关联的计量器具和用能设备
            loadMeters(node.id);
            loadEquipments(node.id);
        } else {
            setSelectedNode(null);
            setMeters([]);
            setEquipments([]);
        }
    };

    // 移除计量器具关联
    const handleRemoveMeter = async (meter: Meter) => {
        if (!selectedNode) return;
        try {
            // 将计量器具的 energyUnit 置空
            await updateMeter(meter.id, { ...meter, energyUnit: null });
            messageApi.success('已移除关联');
            loadMeters(selectedNode.id);
        } catch (error) {
            messageApi.error('操作失败');
        }
    };

    // 新增子节点
    const handleCreate = () => {
        const initialData = selectedNode ? { parentId: selectedNode.id } : {};
        toCreate(initialData);
    };

    // 编辑节点
    const handleEdit = () => {
        if (!selectedNode) {
            messageApi.warning('请先选择一个节点');
            return;
        }
        toEdit(selectedNode);
    };

    // 删除节点
    const handleDelete = async (node?: EnergyUnit) => {
        const target = node || selectedNode;
        if (!target) {
            messageApi.warning('请先选择一个节点');
            return;
        }
        if (target.children && target.children.length > 0) {
            messageApi.error('该节点下存在子节点，无法删除');
            return;
        }
        try {
            await toDelete(target.id);
            if (!node || target.id === (selectedNode?.id)) {
                setSelectedNode(null);
                setSelectedKeys([]);
            }
            void loadTree();
        } catch (error) {
            // 错误由全局处理
        }
    };

    // 移动节点
    const handleMove = () => {
        if (!selectedNode) {
            messageApi.warning('请先选择一个节点');
            return;
        }
        setMoveVisible(true);
    };

    const dataList = useMemo(() => {
        return generateList(treeData);
    }, [treeData]);

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        setSearchValue(value);
        const newExpandedKeys = dataList
            .map((item) => {
                if (item.title.indexOf(value) > -1) {
                    return getParentKey(item.key, treeData);
                }
                return null;
            })
            .filter((item): item is React.Key => item !== null && item !== undefined);

        const uniqueKeys = Array.from(new Set(newExpandedKeys));

        if (uniqueKeys.length > 0) {
            setExpandedKeys(uniqueKeys);
            setAutoExpandParent(true);
        }
    };

    const displayTreeData = useMemo(() => {
        const loop = (data: any[]): TreeDataNode[] =>
            data
                .map((item) => {
                    const node = item.rawData as EnergyUnit;
                    const strTitle = node.name;
                    const index = strTitle.indexOf(searchValue);

                    const beforeStr = strTitle.substring(0, index);
                    const afterStr = strTitle.slice(index + searchValue.length);

                    const title =
                        index > -1 ? (
                            <span key={item.key}>
                                {beforeStr}
                                <span style={{ color: '#f50' }}>{searchValue}</span>
                                {afterStr}
                            </span>
                        ) : (
                            <span key={item.key}>{strTitle}</span>
                        );

                    let children = item.children ? loop(item.children) : [];

                    if (index > -1 || children.length > 0) {
                        return {
                            ...item,
                            title,
                            children,
                        };
                    }

                    return null;
                })
                .filter(item => item !== null) as TreeDataNode[];

        return searchValue ? loop(treeData) : treeData;
    }, [searchValue, treeData]);

    useEffect(() => {
        if (state.shouldRefresh) {
            void loadTree();
            setShouldRefresh(false);
        }
    }, [state.shouldRefresh, loadTree, setShouldRefresh]);

    return (
        <>
            <Dropdown
                menu={{
                    items: contextMenuNode ? [
                        {
                            key: 'add',
                            label: '新增子节点',
                            icon: <PlusOutlined />,
                            onClick: () => toCreate({ parentId: contextMenuNode.id })
                        },
                        {
                            key: 'edit',
                            label: '编辑',
                            icon: <EditOutlined />,
                            onClick: () => toEdit(contextMenuNode)
                        },
                        {
                            key: 'move',
                            label: '移动',
                            icon: <Icon component={MoveTo} />,
                            onClick: () => setMoveVisible(true)
                        },
                        ...(!(contextMenuNode.children && contextMenuNode.children.length > 0) ? [{
                            key: 'delete',
                            label: '删除',
                            danger: true,
                            icon: <DeleteOutlined />,
                            onClick: () => handleDelete(contextMenuNode)
                        }] : [])
                    ] : []
                }}
                open={contextMenuVisible}
                onOpenChange={setContextMenuVisible}
                getPopupContainer={() => document.body}
            >
                <div style={{
                    position: 'fixed',
                    left: contextMenuPos.x,
                    top: contextMenuPos.y,
                    width: '1px',
                    height: '1px',
                    opacity: 0,
                    pointerEvents: 'none',
                    zIndex: -1
                }} />
            </Dropdown>
            <ProPageContainer className={'pt-1'}>
                {contextHolder}
                <Splitter style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
                    <Splitter.Panel
                        defaultSize="20%"
                        min="15%"
                        max="30%"
                        style={{
                            backgroundColor: '#fff',
                            display: 'flex',
                            flexGrow: 1,
                            flexDirection: 'column',
                            height: '100%',
                        }}
                    >
                        <div className={'p-2 border-b bg-white'}>
                            <Input.Search
                                placeholder={'搜索用能单元'}
                                onChange={onSearchChange}
                                allowClear
                            />
                        </div>
                        <Tree.DirectoryTree
                            selectedKeys={selectedKeys}
                            expandedKeys={expandedKeys}
                            defaultExpandAll={true}
                            autoExpandParent={autoExpandParent}
                            selectable
                            showLine
                            onExpand={(keys) => {
                                setExpandedKeys(keys);
                                setAutoExpandParent(false);
                            }}
                            treeData={displayTreeData}
                            onSelect={handleSelect}
                            rootClassName={'overflow-y-auto flex-1 p-2'}
                            blockNode
                            onRightClick={({ event, node }) => {
                                event.preventDefault();
                                const raw = (node as any).rawData as EnergyUnit;
                                setSelectedNode(raw);
                                setSelectedKeys([raw.id]);
                                setContextMenuNode(raw);
                                setContextMenuPos({ x: event.clientX, y: event.clientY });
                                setContextMenuVisible(true);
                            }}
                        />
                        <Flex
                            align={'center'}
                            justify={'space-around'}
                            rootClassName={'py-2 border-t bg-gray-100'}
                        >
                            <IconButton
                                color={'primary'}
                                variant={'solid'}
                                shape={'circle'}
                                icon={<PlusOutlined />}
                                disabled={state.loading}
                                size={'middle'}
                                onClick={handleCreate}
                                tooltip={'新增'}
                            />
                            <IconButton
                                color={'primary'}
                                variant={'solid'}
                                shape={'circle'}
                                icon={<EditOutlined />}
                                size={'middle'}
                                onClick={handleEdit}
                                disabled={state.loading || !selectedNode}
                                tooltip={'编辑'}
                            />
                            <IconButton
                                color={'primary'}
                                variant={'solid'}
                                shape={'circle'}
                                icon={<Icon component={MoveTo} />}
                                size={'middle'}
                                disabled={state.loading || !selectedNode}
                                onClick={handleMove}
                                tooltip={'移动到...'}
                            />
                            <IconButton
                                color={'danger'}
                                variant={'solid'}
                                shape={'circle'}
                                icon={<DeleteOutlined />}
                                size={'middle'}
                                disabled={!selectedNode}
                                onClick={handleDelete}
                                tooltip={'删除'}
                            />
                        </Flex>
                    </Splitter.Panel>
                    <Splitter.Panel style={{ backgroundColor: '#fff' }}>
                        <Flex vertical justify={'start'} rootClassName={'h-full'}>
                            {selectedNode ? (
                                <div className={'h-full overflow-y-auto'}>
                                    <ProDescriptions
                                        column={2}
                                        title={<div className={'pb-2 border-b'}>用能单元信息</div>}
                                        className={'px-2 py-4'}
                                    >
                                        <ProDescriptions.Item valueType={'text'} label={'编码'}>
                                            {selectedNode.code}
                                        </ProDescriptions.Item>
                                        <ProDescriptions.Item valueType={'text'} label={'名称'}>
                                            {selectedNode.name}
                                        </ProDescriptions.Item>
                                        <ProDescriptions.Item valueType={'text'} label={'层级'}>
                                            第 {selectedNode.level + 1} 级
                                        </ProDescriptions.Item>
                                        <ProDescriptions.Item valueType={'text'} label={'排序'}>
                                            {selectedNode.sortOrder}
                                        </ProDescriptions.Item>
                                        <ProDescriptions.Item valueType={'text'} label={'状态'}>
                                            <Tag color={selectedNode.status === 0 ? 'success' : 'error'}>
                                                {selectedNode.status === 0 ? '启用' : '停用'}
                                            </Tag>
                                        </ProDescriptions.Item>
                                        <ProDescriptions.Item valueType={'text'} label={'子节点数'}>
                                            {selectedNode.children?.length || 0} 个
                                        </ProDescriptions.Item>
                                        <ProDescriptions.Item valueType={'text'} label={'备注'} span={2}>
                                            {selectedNode.remark || '-'}
                                        </ProDescriptions.Item>
                                    </ProDescriptions>

                                    {/* 计量点 & 用能设备 Tabs */}
                                    <div className={'px-2 py-2'}>
                                        <Tabs
                                            defaultActiveKey="meters"
                                            size="small"
                                            items={[
                                                {
                                                    key: 'meters',
                                                    label: `计量器具 (${meters.length})`,
                                                    children: meters.length > 0 ? (
                                                        <List
                                                            size="small"
                                                            loading={metersLoading}
                                                            dataSource={meters}
                                                            renderItem={(item) => (
                                                                <MeterListItem
                                                                    key={item.id}
                                                                    meter={item}
                                                                    onRemove={() => handleRemoveMeter(item)}
                                                                />
                                                            )}
                                                        />
                                                    ) : (
                                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无关联的计量器具" style={{ margin: '20px 0' }} />
                                                    ),
                                                },
                                                {
                                                    key: 'equipments',
                                                    label: `用能设备 (${equipments.length})`,
                                                    children: equipments.length > 0 ? (
                                                        <List
                                                            size="small"
                                                            loading={equipmentsLoading}
                                                            dataSource={equipments}
                                                            renderItem={(item) => (
                                                                <List.Item
                                                                    className="hover:bg-gray-50 rounded px-2 transition-colors"
                                                                    style={{ padding: '6px 8px', margin: '1px 0' }}
                                                                >
                                                                    <Space>
                                                                        <Tag color="orange" style={{ margin: 0 }}>
                                                                            {item.type || '设备'}
                                                                        </Tag>
                                                                        <span>{item.name}</span>
                                                                        {item.ratedPower && (
                                                                            <span style={{ color: '#999', fontSize: 12 }}>
                                                                                ({item.ratedPower}kW)
                                                                            </span>
                                                                        )}
                                                                    </Space>
                                                                </List.Item>
                                                            )}
                                                        />
                                                    ) : (
                                                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用能设备" style={{ margin: '20px 0' }} />
                                                    ),
                                                },
                                            ]}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <Empty description="请在左侧选择一个节点" />
                            )}
                        </Flex>
                    </Splitter.Panel>
                </Splitter>
            </ProPageContainer>

            {/* 表单弹窗 */}
            <EnergyUnitForm
                visible={state.dialogVisible}
                onOpenChange={setDialogVisible}
                onSuccess={() => {
                    setDialogVisible(false);
                    void loadTree();
                }}
            />

            {selectedNode && (
                <MoveEnergyUnitDialog
                    open={moveVisible}
                    onOpenChange={setMoveVisible}
                    energyUnit={selectedNode}
                    treeData={treeData}
                    onSuccess={loadTree}
                />
            )}


        </>
    );
};

export default EnergyUnitPage;
