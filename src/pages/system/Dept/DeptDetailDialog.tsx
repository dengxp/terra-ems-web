import { findOptionsForDepartmentManager } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import ProFormDeptSelect from "@/components/select/ProFormDeptSelect";
import ProFormDictSelect from "@/components/select/ProFormDictSelect";
import ProFormRemoteSearchSelect from "@/components/select/ProFormRemoteSearchSelect";
import { DataItemStatus, OperationEnum } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import { ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useEffect, useState } from 'react';

type Props = ProModalFormProps;

const defaultValue = {
  parentId: undefined,
  name: '',
  managerId: undefined,
  status: DataItemStatus.ENABLE,
  ranking: 0,
}

const DeptDetailDialog = (props: Props) => {
  const [departmentId, setDepartmentId] = useState();
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

  const fetchOptionsForDepartmentManager = async (value: string) => {
    const result = await findOptionsForDepartmentManager(departmentId, value);
    return result.data || [];
  }

  useEffect(() => {
    if (props.open) {
      if (state.operation === OperationEnum.EDIT) {
        form.setFieldsValue({ ...state.editData });
        setDepartmentId(state.editData?.id);
      } else {
        form.setFieldsValue({ ...defaultValue, parentId: state.editData?.parentId });
      }
    }
  }, [props.open, state.operation]);

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
      <ProFormText label={'部门名称'}
        name={'name'}
        placeholder={'请输入部门名称'}
        labelCol={{ span: 3 }}
        rules={[
          {
            required: true,
            message: '部门名称不能为空'
          }
        ]} />
      <ProFormDeptSelect label={'上级部门'} name={'parentId'}
        colProps={{ span: 12 }}
      />
      <ProFormRemoteSearchSelect label={'部门负责人'} name={'managerId'}
        colProps={{ span: 12 }}
        fetchOptions={fetchOptionsForDepartmentManager} />
      <ProFormDictSelect label={'状态'} name={'status'} dickey={'status'}
        colProps={{ span: 12 }}
        placeholder={'请选择状态'}
      />

      <ProFormDigit label={'显示排序'} name={'ranking'} min={0} max={1000}
        colProps={{ span: 12 }}
        rules={[
          { required: true, message: '请输入排序值' }
        ]}
      />
      <ProFormTextArea label={'部门介绍'}
        name={'description'}
        placeholder={'请输入部门介绍信息'}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
      />
    </ProModalForm>
  )
}

export default DeptDetailDialog;
