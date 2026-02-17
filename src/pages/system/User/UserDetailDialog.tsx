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
        // Fetch: 编辑模式下异步拉取完整详情
        findUserById(state.editData.id)
          .then(res => {
            const userData = res.data;
            if (userData?.roles) {
              setRoleList(userData.roles);
            }
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
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: '账号必须以字母开头，只能包含字母、数字和下划线'
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
        name={'positions'}
        mode={'multiple'}
        colProps={{ span: 12 }}
        placeholder={'请选择岗位'}
        request={async () => {
          const result = await findPostOptions();
          return result.data;
        }}
      />
      <ProFormSelect label={'角色'}
        name={'roles'}
        mode={'multiple'}
        colProps={{ span: 12 }}
        placeholder={'请选择角色'}
        request={async () => {
          const result = await getRoleOptions();
          // 需要去重吗？后端一般返回去重列表
          // 前端之前的代码曾做过去重，这里暂时直接返回
          // 如果需要去重，可以参考之前的 filter 逻辑
          // 但 getRoleOptions 应该是返回 Option 列表
          const data = result.data || [];
          // 简单去重
          const seen = new Set();
          return data.filter((item: any) => {
            if (seen.has(item.value)) return false;
            seen.add(item.value);
            return true;
          });
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
