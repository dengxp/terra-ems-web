import React, {useEffect, useRef, useState} from 'react';
import {Checkbox, Flex, Tree} from "antd";
import {getMenuTree} from "@/apis/menu";
import {isEqual} from "lodash";

type TreeCheckedValue = {
  checked: React.Key[];
  halfChecked: React.Key[];
};

type Props = {
  value?: TreeCheckedValue;                  // 当前选中的key数组（受控）
  onChange?: (value: TreeCheckedValue) => void;  // 选中值变化时触发
}

const MenuTree = ({value, onChange}: Props) => {
  const [menuTree, setMenuTree] = useState<any[]>([]);
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(value?.checked || []);
  const [halfCheckedKeys, setHalfCheckedKeys] = useState<React.Key[]>(value?.halfChecked || []);

  const [checkStrictly, setCheckStrictly] = useState(false);   // 父子联动开关
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const checkStrictlyRef = useRef(checkStrictly);

  // 同步 value → checkedKeys
  useEffect(() => {
    const {checked = [], halfChecked = []} = value || {};
    if (!isEqual(checkedKeys, checked)) {
      setCheckedKeys(checked);
    }
    if (!isEqual(halfCheckedKeys, halfChecked)) {
      setHalfCheckedKeys(halfChecked)
    }
  }, [value, checkedKeys, halfCheckedKeys]);

  // 拉取菜单树
  useEffect(() => {
    getMenuTree()
      .then(res => {
        if (res.success) {
          setMenuTree(res.data);
          // 初始默认展开所有
          const allKeys = getAllKeys(res.data);
          setExpandedKeys(allKeys);
        }
      })
  }, []);

  // 获取所有节点 key（用于全选/展开）
  const getAllKeys = (data: any[]): React.Key[] => {
    let keys: React.Key[] = [];
    data.forEach(item => {
      keys.push(item.key);
      if (item.children) {
        keys = keys.concat(getAllKeys(item.children));
      }
    });
    return keys;
  };

  // 勾选变化
  // const onCheck = (checkedKeysValue: any) => {
  //
  //   debugger;
  //   const newCheckedKeys = checkStrictly ? checkedKeysValue : checkedKeysValue.checked;
  //   const newHalfCheckedKeys = checkStrictly ? [] : checkedKeysValue.halfChecked;
  //
  //   setCheckedKeys(newCheckedKeys);
  //   setHalfCheckedKeys(newHalfCheckedKeys);
  //   onChange?.({checked: newCheckedKeys, halfChecked: newHalfCheckedKeys});
  // };

  const onCheck = (checked: any, info: any) => {
    debugger;
    if (checkStrictlyRef.current) {
      setCheckedKeys(checked); // 直接是数组
    } else {
      setCheckedKeys(checked.checked); // 对象形式，取 checked 数组
      setHalfCheckedKeys(checked.halfChecked);
    }
  };

  // 展开/折叠 切换
  const toggleExpand = () => {
    if (expandedKeys.length) {
      setExpandedKeys([]);
    } else {
      const allKeys = getAllKeys(menuTree);
      setExpandedKeys(allKeys);
    }
  };

  // 全选/全不选 切换
  const toggleCheckAll = () => {
    if (checkedKeys.length === getAllKeys(menuTree).length) {
      setCheckedKeys([]);
      onChange?.({checked: [], halfChecked: []});
    } else {
      const allKeys = getAllKeys(menuTree);
      setCheckedKeys(allKeys);
      onChange?.({checked: allKeys, halfChecked: []});
    }
  };

  useEffect(() => {
    checkStrictlyRef.current = checkStrictly;
    if (checkStrictly) {
      setHalfCheckedKeys([]);
    }
  }, [checkStrictly]);

  return (
    <>
      <Flex className={'mb-1'} justify={'space-between'}>
        <Checkbox onChange={toggleExpand} checked={expandedKeys.length > 0}>展开/折叠</Checkbox>
        <Checkbox onChange={toggleCheckAll}
                  checked={checkedKeys.length === getAllKeys(menuTree).length}>全选/全不选</Checkbox>
        <Checkbox onChange={e => setCheckStrictly(!e.target.checked)} checked={!checkStrictly}>父子联动</Checkbox>
      </Flex>
      <Tree checkable
            checkStrictly={checkStrictly}
            checkedKeys={checkStrictly ? checkedKeys : {checked: checkedKeys, halfChecked: halfCheckedKeys}}
            onCheck={onCheck}
            treeData={menuTree}
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            fieldNames={{title: 'label'}}
            className={'overflow-y-auto flex-grow'}
            style={{height: 320}}
            rootClassName={'border'}
      />
    </>
  )
};

export default MenuTree;
