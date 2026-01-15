import React, { useEffect, useState } from 'react';
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import ProFormDictRadioGroup from "@/components/radio/ProFormDictRadioGroup";
import { OperationEnum } from "@/enums";
import ProFormDeptSelect from "@/components/select/ProFormDeptSelect";
import { findUserById } from "@/apis";
import { findPostOptions } from "@/apis/post";

type Props = ProModalFormProps;

const defaultValue = {
  username: '',
  password: '',
  name: '',
  gender: 0,
  status: 0,
  phone: '',
  email: '',
  departmentId: undefined,
  roles: []
}
const UserDetailDialog = (props: Props) => {
  const [postList, setPostList] = useState<any[]>([]);
  const [roleList, setRoleList] = useState<any[]>([]);

  const {
    form,
    handleCreate,
    handleUpdate,
    getState
  } = useCrud<UserDTO>({
    pathname: '/system/user',
    entityName: '用户',
    baseUrl: '/api/system/user',
    onOpenChange: props.onOpenChange
  });

  const state = getState('/system/user');

  const onFinish = async (values: Record<string, any>) => {
    if (values.userId) {
      const data = { ...state.editData, ...values };
      await handleUpdate(data);
    } else {
      await handleCreate(values);
    }
  }

  useEffect(() => {
    if (props.open) {
      if (state.operation === OperationEnum.EDIT) {
        findUserById(state.editData?.id)
          .then(res => {
            // debugger;
            setPostList(res.posts);
            setRoleList(res.roles);
            if (state.operation === OperationEnum.EDIT) {
              form.setFieldsValue({ ...res.data, postIds: res.postIds, roleIds: res.roleIds });
            }
          })
      } else {
        form.setFieldsValue({ ...defaultValue });
      }

    }
    // form.setFieldsValue({...state.editData});
  }, [props.open, state.operation]);

  // useEffect(() => {
  //   if (props.open) {
  //     if (snap.operation === OperationEnum.EDIT) {
  //       let roles = snap.editData?.roles ?? [];
  //       if(roles && roles.length > 0) {
  //         roles = roles.map((role: Role) => role.id);
  //       }
  //       form.setFieldsValue({...snap.editData, roles});
  //
  //     } else {
  //       form.setFieldsValue({...defaultValue});
  //     }
  //   }
  // }, [props.open, snap.operation]);

  // useEffect(() => {
  //   findOptions()
  //     .then(res => {
  //       setRoleOptions(res.data || []);
  //     })
  // }, []);

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
      {
        state.operation === OperationEnum.CREATE &&
        <>
          <ProFormText label={'用户名称'}
            name={'username'}
            placeholder={'请输入用户名称'}
            colProps={{ span: 12 }}
            rules={[
              {
                required: true,
                message: '用户名称不能为空'
              }
            ]} />
          <ProFormText.Password label={'用户密码'}
            name={'password'}
            placeholder={'请输入用户密码'}
            colProps={{ span: 12 }}
            fieldProps={{
              autoComplete: 'new-password'
            }}
            rules={[
              {
                required: true,
                message: '用户密码不能为空'
              }
            ]}
          />
        </>
      }
      <ProFormText label={'用户昵称'}
        name={'nickname'}
        placeholder={'请输入用户昵称'}
        colProps={{ span: 12 }}
        rules={[
          {
            required: true,
            message: '用户昵称不能为空'
          }
        ]}
      />
      <ProFormDeptSelect label={'归属部门'} name={'deptId'}
        colProps={{ span: 12 }}
      />
      <ProFormText label={'手机号'}
        name={'phoneNumber'}
        placeholder={'请输入手机号'}
        colProps={{ span: 12 }}
      />
      <ProFormText label={'邮箱'}
        name={'email'}
        placeholder={'请输入邮箱'}
        colProps={{ span: 12 }}
      />
      <ProFormDictRadioGroup label={'性别'}
        name={'gender'}
        initialValue={'2'}
        dictKey={'gender'}
        colProps={{ span: 12 }}
      />
      <ProFormDictRadioGroup dictKey={'status'}
        label={'状态'}
        name={'status'}
        colProps={{ span: 12 }}
      />
      <ProFormSelect label={'岗位'}
        name={'positions'}
        mode={'multiple'}
        colProps={{ span: 12 }}
        placeholder={'请选择岗位'}
        request={async () => {
          const result = await findPostOptions();
          return result.data;
        }}
      // fieldProps={{
      //   options: postList.map(item => ({key: item.postId, value: item.postId, label: item.postName}))
      // }}
      // request={async () => {
      //   const result = await getPostListAll();
      //   if (result.success) {
      //     return result.data.map((item: Record<string, any>) => ({
      //       key: item.postId,
      //       value: item.postId,
      //       label: item.postName
      //     }));
      //   }
      //   return [];
      // }}
      />
      <ProFormSelect label={'角色'}
        name={'roles'}
        mode={'multiple'}
        colProps={{ span: 12 }}
        fieldProps={{
          options: roleList.map(item => ({ key: item.roleId, value: item.roleId, label: item.roleName }))
        }}
      // request={async () => {
      //   const result = await getRoleListAll();
      //   if (result.success) {
      //     return result.data.map((item: Record<string, any>) => ({
      //       key: item.roleId,
      //       value: item.roleId,
      //       label: item.roleName
      //     }));
      //   }
      //   return [];
      // }}
      />
      <ProFormTextArea label={'备注'}
        name={'remark'}
        placeholder={'请输入备注信息'}
        labelCol={{ span: 3 }}
        wrapperCol={{ span: 21 }}
      />
    </ProModalForm>
  )
}

export default UserDetailDialog;
