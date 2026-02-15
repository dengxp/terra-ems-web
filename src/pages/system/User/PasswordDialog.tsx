import { resetUserPwd } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormText } from "@ant-design/pro-components";
import { message } from "antd";
import { useEffect, useState } from 'react';

type Props = ProModalFormProps;

function PasswordDialog(props: Props) {
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
    const {userId, newPassword} = values;
    setLoading(true);
    resetUserPwd(userId, newPassword)
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
      form.setFieldValue('userId', state.editData.userId);
    }
  }, [props.open]);

  return (
    <ProModalForm {...props}
                  form={form}
                  width={480}
                  loading={loading}
                  onFinish={onFinish}
    >
      <ProFormText label={'ID'} name={'userId'} hidden={true}/>
      <ProFormText.Password name={'newPassword'}
                            label={'新密码'}
                            placeholder={'请输入新密码'}
                            tooltip={'最少8位，包含大写、小写字母、数字以及特殊字符，最长20位'}
                            hasFeedback
                            fieldProps={{
                              autoComplete: 'new-password'
                            }}
                            rules={[
                              {required: true, message: '新密码不能为空'},
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
                              {required: true, message: '请输入确认密码'},
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
