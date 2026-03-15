/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
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
