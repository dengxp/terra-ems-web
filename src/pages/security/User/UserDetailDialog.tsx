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

import { findUserById, getRoleOptions } from "@/apis";
import { findPostOptions } from "@/apis/post";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import ProFormDictRadioGroup from "@/components/radio/ProFormDictRadioGroup";
import ProFormDeptSelect from "@/components/select/ProFormDeptSelect";
import { OperationEnum } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import { ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useEffect, useState } from 'react';

type Props = ProModalFormProps;

const defaultValue = {
  username: '',
  password: '',
  realName: '',
  gender: 2,
  status: 1,
  phone: '',
  email: '',
  departmentId: undefined,
  roles: []
}
const UserDetailDialog = (props: Props) => {
  const { open } = props;
  const [_postList, _setPostList] = useState<any[]>([]);
  const [_roleList, setRoleList] = useState<any[]>([]);

  const {
    form,
    handleCreate,
    handleUpdate,
    getState
  } = useCrud<SysUser>({
    pathname: '/system/user',
    entityName: '用户',
    baseUrl: '/api/system/user',
    onOpenChange: props.onOpenChange
  });

  const state = getState('/system/user');

  const onFinish = async (values: Record<string, any>) => {
    if (values.id) {
      const data = { ...state.editData, ...values };
      await handleUpdate(data);
    } else {
      await handleCreate(values);
    }
  }

  useEffect(() => {
    if (open) {
      // 0. Reset: 确保表单状态重置
      form.resetFields();

      // 1. Echo: 无论新增还是编辑，如果有 editData (比如复制新增场景)，先行回显
      if (state.editData) {
        form.setFieldsValue({ ...state.editData });
      }

      // 2. Logic Branch
      if (state.operation === OperationEnum.EDIT && state.editData?.id) {
        findUserById(state.editData.id)
          .then(res => {
            const userData = res.data;
            form.setFieldsValue(userData);
          })
      } else if (state.operation === OperationEnum.CREATE) {
        // Create: 新建模式下设置默认值 (如果 editData 为空)
        if (!state.editData) {
          form.setFieldsValue({ ...defaultValue });
        }
      }
    }
  }, [open, state.operation, state.editData, form]);

  return (
    <ProModalForm {...props}
      title={state.dialogTitle}
      form={form}
      grid={true}
      rowProps={{ gutter: 0 }}
      labelCol={{ span: 6 }}
      modalProps={{
        destroyOnHidden: true,
        maskClosable: false,
      }}
      loading={state.loading} onFinish={onFinish}>
      <ProFormText label={'ID'}
        name={'id'}
        hidden={true} />

      <ProFormText label={'登录账号'}
        name={'username'}
        placeholder={'请输入登录账号'}
        colProps={{ span: 12 }}
        fieldProps={{
          disabled: state.operation === OperationEnum.EDIT
        }}
        rules={[
          {
            required: true,
            message: '登录账号不能为空'
          },
          {
            min: 4,
            message: '账号长度不能少于4位'
          },
          {
            max: 20,
            message: '账号长度不能超过20位'
          },
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_.]*$/,
            message: '账号必须以字母开头，只能包含字母、数字、下划线和点'
          }
        ]} />

      <ProFormText.Password label={'用户密码'}
        name={'password'}
        placeholder={'请输入用户密码'}
        colProps={{ span: 12 }}
        fieldProps={{
          autoComplete: 'new-password',
          disabled: state.operation === OperationEnum.EDIT
        }}
        rules={[
          {
            required: state.operation === OperationEnum.CREATE,
            message: '用户密码不能为空'
          }
        ]}
      />

      <ProFormText label={'用户姓名'}
        name={'realName'}
        placeholder={'请输入用户姓名'}
        colProps={{ span: 12 }}
        rules={[
          {
            required: true,
            message: '用户姓名不能为空'
          }
        ]}
      />
      <ProFormDeptSelect label={'归属部门'} name={'deptId'}
        colProps={{ span: 12 }}
      />
      <ProFormText label={'手机号'}
        name={'phone'}
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
        initialValue={2}
        dictKey={'gender'}
        colProps={{ span: 12 }}
      />
      <ProFormDictRadioGroup dictKey={'status'}
        label={'状态'}
        name={'status'}
        initialValue={1}
        colProps={{ span: 12 }}
      />
      <ProFormSelect label={'岗位'}
        name={'postIds'}
        mode={'multiple'}
        colProps={{ span: 12 }}
        placeholder={'请选择岗位'}
        request={async () => {
          const result = await findPostOptions();
          return result.data;
        }}
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
