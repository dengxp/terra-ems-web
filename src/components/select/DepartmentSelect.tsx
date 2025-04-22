// import React, {useEffect, useState} from 'react';
// import {findTree} from "@/services/edu-boss/department";
// import {TreeSelect, TreeSelectProps} from "antd";
//
// type Props = TreeSelectProps & {
//   currentDepartmentId?: number;
// }
//
// function DepartmentSelect(props: Props) {
//
//   const {currentDepartmentId, ...rest} = props;
//   const [treeData, setTreeData] = useState<API.DepartmentNode[]>([]);
//   const [filteredTreeData, setFilteredTreeData] = useState<API.DepartmentNode[]>([]);
//
//   useEffect(() => {
//     if (currentDepartmentId) {
//       const oldTreeData = [...treeData];
//
//     }
//   }, [currentDepartmentId]);
//
//   useEffect(() => {
//     findTree()
//       .then(res => {
//         if(res.data && res.data.length > 0) {
//           setTreeData(res.data);
//           setFilteredTreeData(res.data);
//         }
//       })
//   }, []);
//   return (
//     <TreeSelect {...rest}
//                 allowClear={true}
//                 showSearch={true}
//                 treeDefaultExpandAll={true}
//                 treeData={filteredTreeData}
//     />
//   );
// }
//
// export default DepartmentSelect;
