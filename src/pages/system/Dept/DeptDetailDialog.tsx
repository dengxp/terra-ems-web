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
import { ProFormText } from "@ant-design/pro-components";
import { useEffect, useState } from 'react';
import DeptFormFields from "./components/DeptFormFields";
import { SysDept } from "@/apis/dept";

type Props = ProModalFormProps;

const defaultValue = {
  parentId: undefined,
  name: '',
  managerId: undefined,
  status: DataItemStatus.ENABLE,
  sortOrder: 0,
}

const DeptDetailDialog = (props: Props) => {
  const [departmentId, setDepartmentId] = useState<number>();
  const {
    form,
    handleSaveOrUpdate,
    getState
  } = useCrud<SysDept>({
    pathname: '/system/dept',
    entityName: '部门',
    baseUrl: '/api/system/dept',
    onOpenChange: props.onOpenChange
  });

  const state = getState('/system/dept');

  const onFinish = async (values: Record<string, any>) => {
    const data = values.id ? { ...state.editData, ...values } : { ...values };
    await handleSaveOrUpdate(data);
  }

  useEffect(() => {
    if (props.open) {
      form.resetFields();
      if (state.operation === OperationEnum.EDIT) {
        form.setFieldsValue({ ...state.editData });
        setDepartmentId(state.editData?.id);
      } else {
        form.setFieldsValue({ ...defaultValue, parentId: state.editData?.parentId });
        setDepartmentId(undefined);
      }
    }
  }, [props.open, state.operation, state.editData, form]);

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
      <DeptFormFields
        departmentId={departmentId}
        operation={state.operation}
        isSubDept={state.operation === OperationEnum.CREATE && !!state.editData?.parentId}
      />
    </ProModalForm>
  )
}

export default DeptDetailDialog;
