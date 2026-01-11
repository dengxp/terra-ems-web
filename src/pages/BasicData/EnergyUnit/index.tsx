import React, { useState, useEffect, useCallback } from 'react';
import { ProDescriptions } from '@ant-design/pro-components';
import { ProPageContainer } from '@/components/container';
import { Tree, Flex, Splitter, Modal, message, Empty, Tag } from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import type { TreeDataNode } from 'antd';
import { IconButton } from '@/components/button';
import { getEnergyUnitTree, deleteEnergyUnit, EnergyUnit } from '@/apis/energyUnit';
import EnergyUnitForm from './components/EnergyUnitForm';

/**
 * 用能单元管理页面
 */
const EnergyUnitPage: React.FC = () => {
    const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedNode, setSelectedNode] = useState<EnergyUnit | null>(null);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'addChild' | 'edit'>('add');
    const [editingNode, setEditingNode] = useState<EnergyUnit | undefined>(undefined);
    const [parentNode, setParentNode] = useState<EnergyUnit | null>(null);
    // 用于保存原始数据以便查找节点
    const [rawData, setRawData] = useState<EnergyUnit[]>([]);
    const [messageApi, contextHolder] = message.useMessage();

    // 将 EnergyUnit 转换为 antd Tree 的 TreeDataNode
    const convertToTreeData = useCallback((nodes: EnergyUnit[]): TreeDataNode[] => {
        return nodes.map((node) => ({
            key: node.id,
            title: node.name,
            children: node.children ? convertToTreeData(node.children) : undefined,
            isLeaf: !node.children || node.children.length === 0,
        }));
    }, []);

    // 加载树形数据
    const loadTree = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getEnergyUnitTree();
            if (res.success && res.data) {
                setRawData(res.data);
                setTreeData(convertToTreeData(res.data));
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
            setLoading(false);
        }
    }, [convertToTreeData, messageApi, selectedNode]);

    useEffect(() => {
        loadTree();
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

    // 选中节点
    const handleSelect = (keys: React.Key[], info: any) => {
        setSelectedKeys(keys);
        if (keys.length > 0) {
            const nodeId = keys[0] as number;
            const node = findNode(nodeId, rawData);
            setSelectedNode(node);
        } else {
            setSelectedNode(null);
        }
    };

    // 新增子节点
    const handleCreate = () => {
        if (selectedNode) {
            // 有选中节点时，新增子节点
            setFormMode('addChild');
            setParentNode(selectedNode);
        } else {
            // 无选中节点时，新增根节点
            setFormMode('add');
            setParentNode(null);
        }
        setEditingNode(undefined);
        setFormVisible(true);
    };

    // 编辑节点
    const handleEdit = () => {
        if (!selectedNode) {
            messageApi.warning('请先选择一个节点');
            return;
        }
        setFormMode('edit');
        setEditingNode(selectedNode);
        setParentNode(null);
        setFormVisible(true);
    };

    // 删除节点
    const handleDelete = () => {
        if (!selectedNode) {
            messageApi.warning('请先选择一个节点');
            return;
        }
        if (selectedNode.children && selectedNode.children.length > 0) {
            messageApi.error('该节点下存在子节点，无法删除');
            return;
        }
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除用能单元「${selectedNode.name}」吗？`,
            okText: '确定',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const res = await deleteEnergyUnit(selectedNode.id);
                    if (res.success) {
                        messageApi.success('删除成功');
                        setSelectedNode(null);
                        setSelectedKeys([]);
                        loadTree();
                    } else {
                        messageApi.error(res.message || '删除失败');
                    }
                } catch (error) {
                    messageApi.error('删除失败');
                }
            },
        });
    };

    // 表单成功回调
    const handleFormSuccess = () => {
        setFormVisible(false);
        loadTree();
    };

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                {contextHolder}
                <Splitter style={{ height: 640, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
                    <Splitter.Panel
                        defaultSize="24%"
                        min="12%"
                        max="40%"
                        style={{
                            backgroundColor: '#fff',
                            display: 'flex',
                            flexGrow: 1,
                            flexDirection: 'column',
                            height: '100%',
                        }}
                    >
                        <Tree.DirectoryTree
                            selectedKeys={selectedKeys}
                            expandedKeys={expandedKeys}
                            defaultExpandAll={true}
                            autoExpandParent={true}
                            selectable
                            showLine
                            onExpand={(keys) => setExpandedKeys(keys)}
                            treeData={treeData}
                            onSelect={handleSelect}
                            rootClassName={'overflow-y-auto flex-1 p-2'}
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
                                disabled={formVisible}
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
                                disabled={formVisible || !selectedNode}
                                tooltip={'编辑'}
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
                        <Flex vertical justify={'center'} rootClassName={'h-full'}>
                            {selectedNode ? (
                                <div className={'h-full'}>
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
                visible={formVisible}
                onVisibleChange={setFormVisible}
                onSuccess={handleFormSuccess}
                currentNode={editingNode}
                parentNode={parentNode}
                mode={formMode}
            />
        </>
    );
};

export default EnergyUnitPage;
