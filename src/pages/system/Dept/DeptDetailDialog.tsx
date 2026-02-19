import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { DataItemStatus, OperationEnum } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import { ProFormText } from "@ant-design/pro-components";
import { useEffect, useState } from 'react';
import DeptFormFields from "./components/DeptFormFields";
import { SysDept } from "@/apis/dept";

type Props = ProModalFormProps;

const defaultValue = {
  parentId: undefined,
  name: '',
  managerId: undefined,
  status: DataItemStatus.ENABLE,
  sortOrder: 0,
}

const DeptDetailDialog = (props: Props) => {
  const [departmentId, setDepartmentId] = useState<number>();
  const {
    form,
    handleSaveOrUpdate,
    getState
  } = useCrud<SysDept>({
    pathname: '/system/dept',
    entityName: '部门',
    baseUrl: '/api/system/dept',
    onOpenChange: props.onOpenChange
  });

  const state = getState('/system/dept');

  const onFinish = async (values: Record<string, any>) => {
    const data = values.id ? { ...state.editData, ...values } : { ...values };
    await handleSaveOrUpdate(data);
  }

  useEffect(() => {
    if (props.open) {
      form.resetFields();
      if (state.operation === OperationEnum.EDIT) {
        form.setFieldsValue({ ...state.editData });
        setDepartmentId(state.editData?.id);
      } else {
        form.setFieldsValue({ ...defaultValue, parentId: state.editData?.parentId });
        setDepartmentId(undefined);
      }
    }
  }, [props.open, state.operation, state.editData, form]);

  return (
    <ProModalForm {...props}
      title={state.dialogTitle}
      form={form}
      grid={true}
      rowProps={{ gutter: 0 }}
      labelCol={{ span: 6 }}
      loading={state.loading} onFinish={onFinish}>
      <ProFormText label={'ID'}
        name={'id'}
        hidden={true} />
      <DeptFormFields
        departmentId={departmentId}
        operation={state.operation}
        isSubDept={state.operation === OperationEnum.CREATE && !!state.editData?.parentId}
      />
    </ProModalForm>
  )
}

export default DeptDetailDialog;
