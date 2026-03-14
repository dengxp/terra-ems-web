/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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
