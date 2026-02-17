import { getRole } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import ProFormDictRadioGroup from "@/components/radio/ProFormDictRadioGroup";
import { OperationEnum } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import MenuTree from "@/pages/system/Role/components/MenuTree";
import { ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Form } from 'antd';
import { useEffect } from 'react';

type Props = ProModalFormProps;

const RoleDetailDialog = (props: Props) => {
  const {
    open,
    onOpenChange,
  } = props;

  const {
    form,
    handleCreate,
    handleUpdate,
    getState
  } = useCrud<SysRole>({
    pathname: '/system/role',
    entityName: '角色',
    baseUrl: '/api/system/role',
    onOpenChange
  });

  const state = getState('/system/role');
  const operation = state.operation;
  const record = state.editData as SysRole | null;

  const onFinish = async (values: Record<string, any>) => {
    const { menuIds, ...rest } = values;
    const { checked, halfChecked } = menuIds;
    const newValues = { ...rest, menuIds: [...checked, ...halfChecked] };

    // 确保 ID 被包含
    const data = (values.id || record?.id) ? { ...record, ...newValues } : { ...newValues };
    if (data.id) {
      await handleUpdate(data);
    } else {
      await handleCreate(newValues);
    }
  }

  useEffect(() => {
    if (open) {
      // 1. 初步回显
      if (record) {
        form.setFieldsValue({ ...record });

        // 2. 深度加载
        if (operation === OperationEnum.EDIT && record.id) {
          getRole(record.id)
            .then(res => {
              if (res.data) {
                form.setFieldsValue({ ...res.data });
              }
            })
            .catch(err => {
              console.error('获取角色详情失败', err);
            });
        }
      } else if (operation === OperationEnum.CREATE) {
        form.resetFields();
      }
    }
  }, [open, operation, record, form]);

  return (
    <ProModalForm {...props}
      title={state.dialogTitle}
      form={form}
      labelCol={{ span: 5 }}
      wrapperCol={{ span: 18 }}
      width={600}
      modalProps={{
        destroyOnClose: true,
        centered: true
      }}
      loading={state.loading} onFinish={onFinish}>
      <ProFormText label={'ID'}
        name={'id'}
        hidden={true} />
      <ProFormText label={'角色名称'}
        name={'name'}
        placeholder={'请输入角色名称'}
        rules={[
          {
            required: true,
            message: '角色名称不能为空'
          }
        ]} />
      <ProFormText name={'code'}
        label={'角色代码'}
        placeholder={'请输入角色代码'}
        tooltip={'控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole(\'admin\')`)'}
        rules={[
          {
            required: true,
            message: '角色代码不能为空'
          }
        ]}
      />
      <ProFormDigit label={'显示顺序'}
        name={'sortOrder'}
        min={0}
        max={1000}
        fieldProps={{ precision: 0 }}
        initialValue={0}
        placeholder={'请输入显示顺序'}
        wrapperCol={{ span: 10 }}
        rules={[
          {
            required: true,
            message: '显示顺序不能为空'
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
