import React, { useEffect, useState } from 'react';
import { ProForm, ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import useCrud from "@/hooks/common/useCrud";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { Button, Form, Space } from "antd";
import { DataItemStatus, OperationEnum } from "@/enums";
import ProFormDeptSelect from "@/components/select/ProFormDeptSelect";
import ProFormRemoteSearchSelect from "@/components/select/ProFormRemoteSearchSelect";
import { findOptionsForDepartmentManager } from "@/apis";
import ProFormDictSelect from "@/components/select/ProFormDictSelect";

type Props = ProModalFormProps

const defaultValue = {
  parentId: undefined,
  name: '',
  managerId: undefined,
  status: DataItemStatus.ENABLE,
  ranking: 0,
}

function DetailPanel(props: Props) {
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const {
    form,
    getState,
    // operation,
    // dialogTitle,
    // loading,
    setDialogVisible,
    handleSaveOrUpdate,
    // editData
  } = useCrud<SysDept>({
    pathname: '/system/org',
    entityName: '部门',
    baseUrl: '/api/system/dept',
    onOpenChange: props.onOpenChange
  });

  const state = getState('/system/org');

  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 14, offset: 1 },
  }

  const fetchOptionsForDepartmentManager = async (value: string) => {
    const result = await findOptionsForDepartmentManager(departmentId, value);
    return result.data || [];
  }

  const onFinish = async (values: Record<string, any>) => {
    const data = values.id ? { ...state.editData, ...values } : { ...values };
    handleSaveOrUpdate(data)
      .then(() => {
        onCancel();
      })
  }

  const onReset = () => {
    form.resetFields();
    form.setFieldsValue({ ...defaultValue });
  }

  const onCancel = () => {
    onReset();
    setDialogVisible(false);
  }

  useEffect(() => {
    if (state.dialogVisible) {
      if (state.operation === OperationEnum.EDIT) {
        form.setFieldsValue({ ...state.editData });
        setDepartmentId(state.editData?.id);
      } else {
        form.setFieldsValue({ ...defaultValue, parentId: state.editData?.id });
      }
    }
  }, [state.dialogVisible, state.operation, state.editData?.id]);

  return (
    <ProForm form={form}
      layout={'horizontal'}
      {...formItemLayout}
      title={state.dialogTitle}
      loading={state.loading}
      onFinish={onFinish}
      onReset={onReset}
      submitter={false}
    >
      <ProFormText label={'ID'}
        name={'id'}
        hidden={true}
      />
      <ProFormText label={'部门名称'}
        name={'name'}
        placeholder={'请输入部门名称'}
        allowClear={true}
        rules={[
          {
            required: true,
            message: '部门名称不能为空'
          }
        ]}
      />
      <ProFormDeptSelect label={'上级部门'} name={'parentId'} />
      <ProFormRemoteSearchSelect label={'部门负责人'} name={'managerId'}
        colProps={{ span: 12 }}
        fetchOptions={fetchOptionsForDepartmentManager} />
      <ProFormDictSelect label={'状态'} name={'status'} dickey={'status'}
        placeholder={'请选择状态'}
      />

      <ProFormDigit label={'显示排序'} name={'ranking'} min={0} max={1000}
        rules={[
          { required: true, message: '请输入排序值' }
        ]}
      />
      <ProFormTextArea label={'部门介绍'}
        name={'description'}
        placeholder={'请输入部门介绍信息'}
      />
      <Form.Item wrapperCol={{ offset: 6 }}>
        <Space>
          <Button type={'primary'} htmlType={'submit'}>提交</Button>
          {
            state.operation === OperationEnum.CREATE &&
            <Button htmlType={'reset'}>重置</Button>
          }
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </ProForm>
  );
}

export default DetailPanel;
