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

import { resetUserPwd } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormText } from "@ant-design/pro-components";
import { message } from "antd";
import { useEffect, useState } from 'react';

type Props = ProModalFormProps;

function PasswordDialog(props: Props) {
  const { onOpenChange, ...restProps } = props;
  const [loading, setLoading] = useState(false);
  const {
    form,
    getState
  } = useCrud<SysUser>({
    pathname: '/system/user',
    entityName: '用户',
    baseUrl: '/api/system/user',
    onOpenChange: props.onOpenChange
  });

  const state = getState('/system/user');

  const onFinish = async (values: Record<string, any>) => {
    const { id, newPassword } = values;
    setLoading(true);
    resetUserPwd(id, newPassword)
      .then(res => {
        setLoading(false);
        void message.success(res.message || '操作成功');
        props.onOpenChange?.(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (props.open && state.editData) {
      form.setFieldValue('id', state.editData.id);
    }
  }, [props.open]);

  return (
    <ProModalForm {...restProps}
      onOpenChange={onOpenChange}
      form={form}
      width={480}
      loading={loading}
      onFinish={onFinish}
      grid={true}
      layout="horizontal"
      labelCol={{ span: 6 }}
      rowProps={{ gutter: 24 }}
    >
      <ProFormText label={'ID'} name={'id'} hidden={true} />
      <ProFormText.Password name={'newPassword'}
        label={'新密码'}
        placeholder={'请输入新密码'}
        tooltip={'最少8位，包含大写、小写字母、数字以及特殊字符，最长20位'}
        hasFeedback
        fieldProps={{
          autoComplete: 'new-password'
        }}
        rules={[
          { required: true, message: '新密码不能为空' },
          {
            pattern: new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,20}$'),
            message: '最少8位, 包含大写、小写字母、数字以及特殊字符'
          }
        ]}
      />
      <ProFormText.Password name={'confirmPassword'}
        label={'确认密码'}
        placeholder={'请输入确认密码'}
        dependencies={['newPassword']}
        hasFeedback
        fieldProps={{
          autoComplete: 'new-password'
        }}
        rules={[
          { required: true, message: '请输入确认密码' },
          {
            validator: (_, value) => {
              const password = form.getFieldValue('newPassword');
              if (value && value !== password) {
                return Promise.reject(new Error('两次输入密码不一致'));
              }

              return Promise.resolve();
            }
          }
        ]}
      />

    </ProModalForm>
  );
}

export default PasswordDialog;
