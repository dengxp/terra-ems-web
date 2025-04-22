import React, {useState} from "react";
import {getDeptTree} from "@/apis";
import {ProFormTreeSelect} from "@ant-design/pro-components";
import {getTreeKeys} from "@/utils";

type Props = Record<string, any>

function ProFormDeptSelect(props: Props) {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const {fieldProps, ...rest} = props;

  return (
    <ProFormTreeSelect {...rest}
                       request={async () => {
                         const result = await getDeptTree();
                         const treeData = result.data && result.data.length ? result.data : [];
                         const keys = getTreeKeys(treeData);
                         setExpandedKeys(keys);
                         return treeData;
                       }}
                       className={'w-full'}
                       fieldProps={{
                         ...(fieldProps || {}),
                         allowClear: true,
                         treeDefaultExpandAll: true,
                         treeExpandedKeys: expandedKeys,
                         showSearch: true,
                         filterTreeNode: (inputValue, treeNode) => {
                           if(!inputValue) return true;

                           const label = treeNode.label;
                           if(typeof label === 'string') {
                             return label.toLowerCase().includes(inputValue.toLowerCase());
                           }
                           if(typeof label === 'number') {
                             return label.toString().includes(inputValue);
                           }
                           return false;
                         }
                       }}
    />
  )
}

export default ProFormDeptSelect;
