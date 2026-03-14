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

import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { DataItemStatus, OperationEnum } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import { ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useEffect } from 'react';

import { ProFormRadio } from "@ant-design/pro-components";

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
      <ProFormDigit label={'显示排序'} name={'sortOrder'} min={0} max={1000}
        width={120}
      />
      <ProFormRadio.Group label={'状态'} name={'status'}
        options={[
          { label: '正常', value: 0 },
          { label: '停用', value: 1 }
        ]}
        rules={[
          { required: true, message: '请选择岗位状态' }
        ]}
      />
      <ProFormTextArea label={'备注'}
        name={'remark'}
        placeholder={'请输入岗位备注信息'}
      />
    </ProModalForm>
  )
}

export default PostDetailDialog;
