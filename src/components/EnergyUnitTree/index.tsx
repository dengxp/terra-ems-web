import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tree, Input, Empty, Space, Spin } from 'antd';
import { ApartmentOutlined } from '@ant-design/icons';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
import { getToken } from '@/utils/auth';
import { generateList, getParentKey } from '@/utils/tree';

export interface EnergyUnitTreeProps {
    /** 标题，默认为 "用能单元" */
    title?: React.ReactNode;
    /** 选中回调 */
    onSelect?: (unitId: number, unitName: string) => void;
    /** 当前选中的 ID */
    selectedUnitId?: number | null;
    /** 是否高度铺满容器，默认为 true */
    fullHeight?: boolean;
    /** 默认展开所有节点，默认为 true */
    defaultExpandAll?: boolean;
    /** 额外的 Card 样式 */
    style?: React.CSSProperties;
    /** 隐藏搜索框 */
    hideSearch?: boolean;
}

const EnergyUnitTree: React.FC<EnergyUnitTreeProps> = ({
    title = (
        <Space>
            <ApartmentOutlined style={{ color: '#1890ff' }} />
            用能单元
        </Space>
    ),
    onSelect,
    selectedUnitId,
    fullHeight = true,
    defaultExpandAll = true,
    style,
    hideSearch = false,
}) => {
    const [treeData, setTreeData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    // 加载数据
    const fetchTree = async () => {
        if (!getToken()) return;
        setLoading(true);
        try {
            const res = await getEnabledEnergyUnitTree();
            if (res.success) {
                const mapTree = (data: EnergyUnit[]): any[] =>
                    data.map((item) => ({
                        title: item.name,
                        key: item.id,
                        children: item.children && item.children.length > 0 ? mapTree(item.children) : undefined,
                    }));
                const tree = mapTree(res.data || []);
                setTreeData(tree);

                // 默认展开
                if (defaultExpandAll) {
                    const allKeys = generateList(tree).map((item) => item.key);
                    setExpandedKeys(allKeys);
                }

                // 默认选中第一个节点（如果当前没有选中的话）
                if (res.data && res.data.length > 0 && !selectedUnitId && onSelect) {
                    onSelect(res.data[0].id, res.data[0].name);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    // 辅助数据用于搜索
    const dataList = useMemo(() => generateList(treeData), [treeData]);

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
        const loop = (data: any[]): any[] =>
            data
                .map((item) => {
                    const strTitle = item.title as string;
                    const index = strTitle.indexOf(searchValue);
                    const beforeStr = strTitle.substring(0, index);
                    const afterStr = strTitle.slice(index + searchValue.length);

                    const titleContent =
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
                            title: titleContent,
                            children,
                        };
                    }
                    return null;
                })
                .filter((item) => item !== null) as any[];

        return searchValue ? loop(treeData) : treeData;
    }, [searchValue, treeData]);

    return (
        <Card
            title={title}
            bordered={false}
            size="small"
            style={{
                height: fullHeight ? '100%' : 'auto',
                display: 'flex',
                flexDirection: 'column',
                ...style,
            }}
            bodyStyle={{
                padding: '8px',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {!hideSearch && (
                <Input.Search
                    placeholder="搜索用能单元"
                    onChange={onSearchChange}
                    allowClear
                    style={{ marginBottom: 8 }}
                />
            )}
            <div style={{ flex: 1, overflow: 'auto' }}>
                <Spin spinning={loading}>
                    {treeData.length > 0 ? (
                        <Tree
                            treeData={displayTreeData}
                            onSelect={(keys, info) => {
                                if (keys.length > 0 && onSelect) {
                                    onSelect(keys[0] as number, info.node.title as string);
                                }
                            }}
                            blockNode
                            showLine={{ showLeafIcon: false }}
                            expandedKeys={expandedKeys}
                            onExpand={(keys) => {
                                setExpandedKeys(keys);
                                setAutoExpandParent(false);
                            }}
                            autoExpandParent={autoExpandParent}
                            selectedKeys={selectedUnitId ? [selectedUnitId] : []}
                        />
                    ) : (
                        !loading && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </Spin>
            </div>
        </Card>
    );
};

export default EnergyUnitTree;
