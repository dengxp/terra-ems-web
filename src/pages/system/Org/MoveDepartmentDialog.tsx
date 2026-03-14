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

import { moveDepartment } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { filterTree, getTreeKeys } from "@/utils/tree";
import { ProFormText, ProFormTreeSelect } from "@ant-design/pro-components";
import { message, TreeDataNode } from "antd";
import { useMemo } from 'react';

type Props = ProModalFormProps & {
  department: SysDept,
  treeData: TreeDataNode[]
}

function MoveDepartmentDialog(props: Props) {
  const { department, treeData, ...rest } = props;
  const [messageApi] = message.useMessage();

  const {
    setShouldRefresh,
  } = useCrud<SysDept>({
    pathname: '/system/org',
    entityName: '部门',
    baseUrl: '/api/system/dept',
  });

  const onFinish = async (values: Record<string, any>) => {
    if ((!values.parentId && !department.parentId) || values.parentId == department.parentId) {
      props.onOpenChange?.(false);
      return;
    }

    if (department.id) {
      moveDepartment({ ...department, parentId: values.parentId })
        .then(res => {
          messageApi.success(res.message);
          setShouldRefresh(true);
          props.onOpenChange?.(false);
        });
    }
  }

  const filteredTreeData = useMemo(() => {
    if (props.open) {
      const propTreeData = JSON.parse(JSON.stringify(props.treeData));
      return department.id
        ? filterTree(propTreeData, department.id)
        : [];
    }
    return [];
  }, [props.treeData, department, props.open])

  const expandedKeys = useMemo(() => {
    return getTreeKeys(filteredTreeData, 'id');
  }, [filteredTreeData]);

  return (
    <ProModalForm {...rest} title={'移动部门'} onFinish={onFinish}>
      <ProFormText label={'部门名称'} name={'name'}>{props.department.name}</ProFormText>
      <ProFormTreeSelect label={'上级部门'} name={'parentId'} allowClear={true}
        placeholder={'请选择上级部门'}
        fieldProps={{
          fieldNames: { label: 'name', value: 'id', children: 'children' },
          showSearch: true,
          treeNodeFilterProp: 'name',
          treeExpandedKeys: expandedKeys,
          treeDefaultExpandAll: true,
          treeData: filteredTreeData
        }}
      />
    </ProModalForm>
  );
}

export default MoveDepartmentDialog;
