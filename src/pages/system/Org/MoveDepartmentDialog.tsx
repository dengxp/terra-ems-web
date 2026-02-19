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
