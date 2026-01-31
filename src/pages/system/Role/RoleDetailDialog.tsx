import React, { useEffect } from 'react';
import { Form, Tooltip } from 'antd';
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import ProFormDictRadioGroup from "@/components/radio/ProFormDictRadioGroup";
import MenuTree from "@/pages/system/Role/components/MenuTree";
import { OperationEnum } from "@/enums";
import editButton from "@/components/button/EditButton";
import { getRole } from "@/apis";
import { Question } from "@/components";
import { QuestionCircleFilled } from "@ant-design/icons";

type Props = ProModalFormProps;

const RoleDetailDialog = (props: Props) => {

  const {
    form,
    handleCreate,
    handleUpdate,
    getState
  } = useCrud<SysRole>({
    pathname: '/system/role',
    entityName: '角色',
    baseUrl: '/api/system/role',
    onOpenChange: props.onOpenChange
  });

  const state = getState('/system/role');

  const onFinish = async (values: Record<string, any>) => {
    const { menuIds, ...rest } = values;
    const { checked, halfChecked } = menuIds;
    const newValues = { ...rest, menuIds: [...checked, ...halfChecked] };
    if (values.roleId) {
      const data = { ...state.editData, ...newValues };
      await handleUpdate(data);
    } else {
      await handleCreate(newValues);
    }
  }

  useEffect(() => {
    if (props.open && state.operation === OperationEnum.EDIT) {
      getRole(state.editData?.roleId)
        .then(res => {
          if (res.data) {
            // 用返回的角色数据填充表单
            form.setFieldsValue({ ...res.data });
          }
        })
    }
  }, [props.open, state.operation]);

  return (
    <ProModalForm {...props}
      title={state.dialogTitle}
      form={form}
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 18 }}
      width={600}
      loading={state.loading} onFinish={onFinish}>
      <ProFormText label={'ID'}
        name={'roleId'}
        hidden={true} />
      <ProFormText label={'角色名称'}
        name={'roleName'}
        placeholder={'请输入角色名称'}
        rules={[
          {
            required: true,
            message: '角色名称不能为空'
          }
        ]} />
      <ProFormText name={'roleKey'}
        label={'角色键值'}
        placeholder={'请输入角色键值'}
        tooltip={'控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole(\'admin\')`)'}
        rules={[
          {
            required: true,
            message: '角色键值不能为空'
          }
        ]}
      />
      <ProFormDigit label={'角色顺序'}
        name={'roleSort'}
        min={0}
        max={1000}
        fieldProps={{ precision: 0 }}
        initialValue={0}
        placeholder={'请输入角色顺序'}
        wrapperCol={{ span: 10 }}
        rules={[
          {
            required: true,
            message: '角色顺序不能为空'
          },
        ]}
      />
      <ProFormDictRadioGroup dictKey={'sys_normal_disable'}
        label={'状态'}
        initialValue={'0'}
        name={'status'}
      />
      <Form.Item label={'菜单权限'} name={'menuIds'}
        rules={[
          {
            required: true,
            message: '请选择菜单权限'
          }
        ]}
      >
        <MenuTree />
      </Form.Item>
      <ProFormTextArea label={'备注'}
        name={'remark'}
        placeholder={'请输入备注信息'}
      />
    </ProModalForm>
  )
}

export default RoleDetailDialog;
