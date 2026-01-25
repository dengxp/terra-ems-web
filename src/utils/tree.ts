import React from 'react';
import { TreeDataNode } from "antd";
import { Tree } from "@/types";

export function getTreeKeys(treeData: any[],): React.Key[] {
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

/**
 * 过滤掉树型结构tree中id为{id}的节点
 * @param tree 树型结构数据
 * @param id 节点ID
 */
export function filterNode(tree: any, id: number): any {
  // 如果当前节点就是要过滤的节点，返回undefined
  if (tree.id === id) {
    return undefined;
  }

  // 创建新节点的浅拷贝
  const newNode = { ...tree };

  // 如果有子节点，递归处理
  if (newNode.children && newNode.children.length > 0) {
    newNode.children = newNode.children
      .map((child: any) => filterNode(child, id))
      .filter((child: any) => child !== undefined);
  }

  return newNode;
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

export const generateList = (tree: Record<string, any>[]) => {
  let dataList: { key: React.Key; title: string }[] = [];
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    const { key } = node;
    dataList.push({ key, title: (node.title || node.label) as string });
    if (node.children) {
      dataList = [...dataList, ...generateList(node.children)];
    }
  }

  return dataList;
};

export const generateNodeList = (treeData: Record<string, any>[]) => {
  let dataList: Record<string, any>[] = [];
  for (let i = 0; i < treeData.length; i++) {
    const node = treeData[i];
    const { children, ...rest } = node;
    dataList.push({ ...rest });
    if (node.children) {
      const childrenDataList = generateNodeList(node.children);
      if (childrenDataList && childrenDataList.length > 0) {
        dataList = [...dataList, ...childrenDataList];
      }
    }
  }
  return dataList;
}

export const findNode = (tree: Record<string, any>[], key: number | string) => {
  const dataList = generateNodeList(tree);
  const nodes = dataList.filter(node => node.key === key);
  return nodes?.[0];
}
