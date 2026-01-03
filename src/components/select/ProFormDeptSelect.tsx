import React, {useState} from "react";
import {findDeptTree} from "@/apis";
import {ProFormTreeSelect} from "@ant-design/pro-components";
import {getTreeKeys} from "@/utils";

type Props = Record<string, any>

function ProFormDeptSelect(props: Props) {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  const {fieldProps, ...rest} = props;

  return (
    <ProFormTreeSelect {...rest}
                       request={async () => {
                         const result = await findDeptTree();
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
                         onTreeExpand: (keys) => setExpandedKeys(keys),
                         listHeight: 400, // 显式设置虚拟滚动高度（如果用了 virtual）
                         showSearch: true,
                         filterTreeNode: (inputValue, treeNode) => {
                           if(!inputValue) return true;

                           const title = treeNode.title;
                           if(typeof title === 'string') {
                             return title.toLowerCase().includes(inputValue.toLowerCase());
                           }
                           if(typeof title === 'number') {
                             return title.toString().includes(inputValue);
                           }
                           return false;
                         }
                       }}
    />
  )
}

export default ProFormDeptSelect;
