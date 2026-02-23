import { findModuleTree } from "@/apis/module";
import { Checkbox, Flex, Spin, Tree } from "antd";
import type { DataNode } from "antd/es/tree";
import { isEqual } from "lodash";
import React, { useEffect, useState } from 'react';

type Props = {
    value?: React.Key[];                  // Currently selected permission IDs
    onChange?: (value: React.Key[]) => void;  // Trigger changes
}

const PermissionTree = ({ value, onChange }: Props) => {
    const [treeData, setTreeData] = useState<DataNode[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(value || []);
    const [loading, setLoading] = useState(false);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [checkStrictly, setCheckStrictly] = useState(false);

    // Sync value -> checkedKeys
    useEffect(() => {
        if (value && !isEqual(checkedKeys, value)) {
            setCheckedKeys(value);
        }
    }, [value]);

    // Fetch Data
    useEffect(() => {
        setLoading(true);
        findModuleTree()
            .then((res) => {
                if (res.success && res.data) {
                    const modules = res.data;

                    // Sort modules
                    modules.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

                    const tree: DataNode[] = modules.map(mod => {
                        return {
                            title: mod.name,
                            key: `m-${mod.id}`,
                            children: (mod.permissions || []).map(p => ({
                                title: (
                                    <span style={p.superPermission ? { color: '#ff4d4f', fontWeight: 'bold' } : undefined}>
                                        {p.name} ({p.code})
                                        {p.superPermission && <span style={{ marginLeft: 4 }}>[超级]</span>}
                                    </span>
                                ),
                                key: p.id as number,
                                isLeaf: true
                            }))
                        };
                    });

                    setTreeData(tree);
                    // Expand all by default
                    setExpandedKeys(tree.map(n => n.key));
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const onCheck = (checked: any) => {
        // checked can be { checked: [], halfChecked: [] } or [] depending on checkStrictly
        const keys = Array.isArray(checked) ? checked : checked.checked;

        // Filter out module keys (strings starting with m-)
        const permKeys = keys.filter((k: React.Key) => typeof k === 'number' || (typeof k === 'string' && !k.startsWith('m-')));

        setCheckedKeys(keys); // Update UI state with all keys (including modules)
        onChange?.(permKeys); // Propagate only permission IDs
    };

    const toggleExpand = () => {
        if (expandedKeys.length) {
            setExpandedKeys([]);
        } else {
            setExpandedKeys(treeData.map(n => n.key));
        }
    }

    // Calculation for Select All state
    const getAllPermKeys = (nodes: DataNode[]) => {
        const keys: React.Key[] = [];
        const traverse = (data: DataNode[]) => {
            data.forEach(node => {
                if (!String(node.key).startsWith('m-')) {
                    keys.push(node.key);
                }
                if (node.children) traverse(node.children);
            });
        }
        traverse(nodes);
        return keys;
    };

    const allPermKeys = getAllPermKeys(treeData);
    const selectedPermKeys = checkedKeys.filter(k => typeof k === 'number' || !String(k).startsWith('m-'));

    const isAllChecked = allPermKeys.length > 0 && selectedPermKeys.length === allPermKeys.length;
    const isIndeterminate = selectedPermKeys.length > 0 && selectedPermKeys.length < allPermKeys.length;

    const toggleCheckAll = () => {
        if (isAllChecked) {
            setCheckedKeys([]);
            onChange?.([]);
        } else {
            const allUiKeys: React.Key[] = [];
            const traverse = (nodes: DataNode[]) => {
                nodes.forEach(node => {
                    allUiKeys.push(node.key);
                    if (node.children) traverse(node.children);
                });
            }
            traverse(treeData);
            setCheckedKeys(allUiKeys);
            onChange?.(allPermKeys);
        }
    }

    return (
        <Spin spinning={loading}>
            <Flex className={'mb-1'} justify={'space-between'}>
                <Checkbox onChange={toggleExpand} checked={expandedKeys.length > 0 && expandedKeys.length === treeData.length} indeterminate={expandedKeys.length > 0 && expandedKeys.length < treeData.length}>展开</Checkbox>
                <Checkbox onChange={toggleCheckAll} checked={isAllChecked} indeterminate={isIndeterminate}>全选</Checkbox>
                <Checkbox onChange={e => setCheckStrictly(!e.target.checked)} checked={!checkStrictly}>父子联动</Checkbox>
            </Flex>
            <div className={'border p-2 overflow-y-auto h-[520px]'}>
                <Tree
                    checkable
                    checkStrictly={checkStrictly}
                    checkedKeys={checkedKeys}
                    onCheck={onCheck}
                    treeData={treeData}
                    expandedKeys={expandedKeys}
                    onExpand={setExpandedKeys}
                />
            </div>
        </Spin>
    );
}

export default PermissionTree;
