import React, {useMemo} from 'react';
import {ProModalForm} from "@/components/container";
import {ProModalFormProps} from "@/components/container/ProModalForm";
import {ProFormText, ProFormTreeSelect} from "@ant-design/pro-components";
import {filterTree} from "@/utils/tree";
import useCrud from "@/hooks/common/useCrud";
import {moveDepartment} from "@/apis";
import {message, TreeDataNode} from "antd";
import {SysDepartment} from "@/types";

type Props = ProModalFormProps & {
  department: SysDepartment,
  treeData: TreeDataNode[]
}

function MoveDepartmentDialog(props: Props) {
  const {department, treeData, ...rest} = props;
  const [messageApi, contextHolder] = message.useMessage();

  const {
    setShouldRefresh,
  } = useCrud<SysDepartment>({
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
      moveDepartment(department.id, values.parentId)
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

  return (
    <ProModalForm {...rest} title={'移动部门'} onFinish={onFinish}>
      <ProFormText label={'部门名称'} name={'name'}>{props.department.name}</ProFormText>
      <ProFormTreeSelect label={'上级部门'} name={'parentId'} allowClear={true}
                         placeholder={'请选择上级部门'}
                         fieldProps={{
                           showSearch: true,
                           treeNodeFilterProp: 'label',
                           treeDefaultExpandAll: true,
                           treeData: filteredTreeData
                         }}
      />
    </ProModalForm>
  );
}

export default MoveDepartmentDialog;
