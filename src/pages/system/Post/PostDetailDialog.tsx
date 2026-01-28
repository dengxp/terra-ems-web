import React, { useEffect } from 'react';
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { DataItemStatus, OperationEnum } from "@/enums";

import ProFormDictRadioGroup from "@/components/radio/ProFormDictRadioGroup";

type Props = ProModalFormProps;

const defaultValue = {
  name: '',
  code: '',
  status: DataItemStatus.ENABLE,
  ranking: 0,
}

const PostDetailDialog = (props: Props) => {
  const {
    form,
    handleSaveOrUpdate,
    getState
  } = useCrud<SysPost>({
    pathname: '/system/post',
    entityName: '岗位',
    baseUrl: '/api/system/post',
    onOpenChange: props.onOpenChange
  });

  const state = getState('/system/post');

  const onFinish = async (values: Record<string, any>) => {
    const data = values.id ? { ...state.editData, ...values } : { ...values };
    await handleSaveOrUpdate(data);
  }

  useEffect(() => {
    if (props.open) {
      if (state.operation === OperationEnum.EDIT) {
        form.setFieldsValue({ ...state.editData });
      } else {
        form.setFieldsValue({ ...defaultValue });
      }
    }
  }, [props.open, state.operation]);

  return (
    <ProModalForm {...props}
      title={state.dialogTitle}
      width={500}
      form={form}
      labelCol={{ span: 5 }}
      loading={state.loading} onFinish={onFinish}>
      <ProFormText label={'ID'}
        name={'id'}
        hidden={true} />
      <ProFormText label={'岗位名称'}
        name={'name'}
        placeholder={'请输入岗位名称'}
        rules={[
          {
            required: true,
            message: '岗位名称不能为空'
          }
        ]} />
      <ProFormText label={'岗位代码'}
        name={'code'}
        placeholder={'请输入岗位代码'}
        rules={[
          {
            required: true,
            message: '岗位代码不能为空'
          }
        ]} />
      <ProFormDigit label={'显示排序'} name={'ranking'} min={0} max={1000}
        rules={[
          { required: true, message: '请输入排序值' }
        ]}
        width={120}
      />
      <ProFormDictRadioGroup label={'状态'} name={'status'} dictKey={'status'}
        rules={[
          { required: true, message: '请选择岗位状态' }
        ]}
      />
      <ProFormTextArea label={'备注'}
        name={'description'}
        placeholder={'请输入岗位备注信息'}
      />
    </ProModalForm>
  )
}

export default PostDetailDialog;
