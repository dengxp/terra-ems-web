import { findDeptTree } from "@/apis";
import { getTreeKeys } from "@/utils";
import { ProFormTreeSelect } from "@ant-design/pro-components";
import React, { useState } from "react";

type Props = {
  excludeId?: number;
} & Record<string, any>

function ProFormDeptSelect(props: Props) {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const { fieldProps, excludeId, ...rest } = props;

  // 过滤掉当前部门及其子部门，防止死循环
  const filterTree = (nodes: any[], targetId?: number): any[] => {
    if (!targetId) return nodes;
    return nodes
      .filter(node => node.id !== targetId)
      .map(node => ({
        ...node,
        children: node.children ? filterTree(node.children, targetId) : undefined
      }));
  }

  return (
    <ProFormTreeSelect {...rest}
      request={async () => {
        const result = await findDeptTree();
        let treeData = result.data && result.data.length ? result.data : [];

        if (excludeId) {
          treeData = filterTree(treeData, excludeId);
        }

        // 使用 'id' 作为 key 获取所有节点的 id
        const keys = getTreeKeys(treeData, 'id');
        setExpandedKeys(keys);
        return treeData;
      }}
      className={'w-full'}
      fieldProps={{
        ...(fieldProps || {}),
        fieldNames: { label: 'name', value: 'id', children: 'children' },
        allowClear: true,
        treeDefaultExpandAll: true,
        treeExpandedKeys: expandedKeys,
        onTreeExpand: (keys) => setExpandedKeys(keys),
        listHeight: 400, // 显式设置虚拟滚动高度（如果用了 virtual）
        showSearch: true,
        filterTreeNode: (inputValue, treeNode) => {
          if (!inputValue) return true;
          // @ts-ignore
          const title = treeNode.title || treeNode.name;
          if (typeof title === 'string') {
            return title.toLowerCase().includes(inputValue.toLowerCase());
          }
          if (typeof title === 'number') {
            return title.toString().includes(inputValue);
          }
          return false;
        }
      }}
    />
  )
}

export default ProFormDeptSelect;
