import React from 'react';
import {Tree, TreeDataNode} from "antd";

export function getTreeKeys(treeData: any[]): React.Key[] {
    const keys: React.Key[] = [];
    function traverse(nodes: TreeDataNode[]) {
        nodes.forEach(node => {
            keys.push(node.key);
            if (node.children) {
                traverse(node.children);
            }
        });
    }

    traverse(treeData);

    return keys;
}

// 递归移除节点的辅助函数
export const removeNode = (data: any[], key: string) => {
  return data
    .map((item) => {
      if (item.key === key) {
        return null; // 找到要删除的节点，返回 null
      }
      if (item.children) {
        // 递归处理子节点
        item.children = removeNode(item.children, key);
      }
      return item;
    })
    .filter((item) => item !== null); // 过滤掉空节点
};

export function filterNode(tree: Tree, id: number) {
  if(tree.id === id) {
    return undefined
  }
  else if(tree.children && tree.children.length > 0) {
    tree.children = tree.children.filter((node: any) => {
      if (node.id === id) {
        return false
      } else if (node.children !== undefined && node.children.length > 0) {
        node = filterNode(node, id)
        return true
      } else {
        return true
      }
    })
  }

  return tree
}

export function filterTree(treeData: any[], id: number) {
  let newTree: any[] = [], newNode;
  treeData.forEach(node => {
    newNode = filterNode(node, id)
    if (newNode) {
      newTree.push(newNode)
    }
  })

  return newTree
}

export const getParentKey = (key: React.Key, tree: Record<string, any>): React.Key => {
  let parentKey: React.Key;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item: Record<string, any>) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey!;
};

export const generateList = (tree: Record<string, any>) => {
  let dataList: { key: React.Key; title: string }[] = [];
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    const { key } = node;
    dataList.push({ key, title: (node.title || node.label) as string });
    if (node.children) {
      generateList(node.children);
    }
  }

  return dataList;
};
