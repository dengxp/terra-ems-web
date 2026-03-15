/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
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

import { findOptionsForDepartmentManager } from "@/apis";
import ProFormDeptSelect from "@/components/select/ProFormDeptSelect";
import ProFormDictSelect from "@/components/select/ProFormDictSelect";
import ProFormRemoteSearchSelect from "@/components/select/ProFormRemoteSearchSelect";
import { DataItemStatus, OperationEnum } from "@/enums";
import { ProForm, ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Button, Form, FormInstance, Space, message } from "antd";
import { useEffect, useState } from 'react';

type Props = {
  form: FormInstance;
  sysDept: SysDept;
  title: string;
  operation: OperationEnum;
  loading: boolean;
  onFinish: (values: any) => Promise<void>;
  onCancel: () => void;
}

const defaultValue = {
  parentId: undefined,
  name: '',
  managerId: undefined,
  status: DataItemStatus.ENABLE,
  ranking: 0,
}

function DetailPanel(props: Props) {
  const { form, sysDept, title, operation, loading, onFinish, onCancel } = props;
  const [departmentId, setDepartmentId] = useState<number | undefined>();

  const formItemLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 14, offset: 1 },
  }

  const fetchOptionsForDepartmentManager = async (value: string) => {
    const result = await findOptionsForDepartmentManager(departmentId, value);
    return result.data || [];
  }

  const onReset = () => {
    form.resetFields();
    if (operation === OperationEnum.CREATE) {
      form.setFieldsValue({ ...defaultValue, parentId: sysDept?.id || sysDept?.parentId });
    } else {
      form.setFieldsValue({ ...sysDept });
    }
  }

  useEffect(() => {
    form.resetFields();
    if (operation === OperationEnum.EDIT) {
      form.setFieldsValue({ ...sysDept });
      setDepartmentId(sysDept?.id);
    } else {
      // Create mode
      form.setFieldsValue({ ...defaultValue, parentId: sysDept?.id });
      setDepartmentId(undefined);
    }
  }, [sysDept, operation, form]);

  return (
    <ProForm form={form}
      layout={'horizontal'}
      {...formItemLayout}
      title={title}
      loading={loading}
      onFinish={onFinish}
      onFinishFailed={(errorInfo) => {
        console.error('Validate Failed:', errorInfo);
        message.error('表单校验失败，请检查输入');
      }}
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
        preload={true}
        fetchOptions={fetchOptionsForDepartmentManager} />
      <ProFormDictSelect label={'状态'} name={'status'} dickey={'status'}
        placeholder={'请选择状态'}
      />

      <ProFormDigit label={'显示排序'} name={'sortOrder'} min={0} max={1000} />
      <ProFormTextArea label={'部门介绍'}
        name={'description'}
        placeholder={'请输入部门介绍信息'}
      />
      <Form.Item wrapperCol={{ offset: 6 }}>
        <Space>
          <Button type={'primary'} htmlType={'submit'}>提交</Button>
          {
            operation === OperationEnum.CREATE &&
            <Button htmlType={'reset'}>重置</Button>
          }
          <Button onClick={onCancel}>取消</Button>
        </Space>
      </Form.Item>
    </ProForm>
  );
}

export default DetailPanel;
