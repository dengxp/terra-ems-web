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

import {
  EnergySavingProject,
  projectStatusOptions
} from '@/apis/energySavingProject';
import { ProModalForm } from '@/components/container';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import {
  ProFormDatePicker,
  ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea
} from '@ant-design/pro-components';
import React, { useEffect } from 'react';

interface ProjectFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ visible, onVisibleChange, onSuccess }) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<EnergySavingProject>({
        pathname: '/energy-saving/project',
        entityName: '节能项目',
        baseUrl: '/api/ems/saving-projects',
        onOpenChange: onVisibleChange
    });

    const state = getState('/energy-saving/project');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue(state.editData);
            } else {
                form.resetFields();
                form.setFieldsValue({ status: 'PLANNING' });
            }
        }
    }, [visible, state.operation, state.editData, form]);

    return (
        <ProModalForm
            title={state?.dialogTitle}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={async (values) => {
                await handleSaveOrUpdate(values);
                onSuccess();
                return true;
            }}
            layout="horizontal"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
            }}
            width={640}
            loading={state.loading}
        >
            <ProFormText name="id" hidden />
            <ProFormText
                name="name"
                label="项目名称"
                placeholder="请输入项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
            />
            <ProFormText
                name="liablePerson"
                label="项目负责人"
                placeholder="请输入项目负责人"
            />
            <ProFormSelect
                name="status"
                label="项目状态"
                options={projectStatusOptions}
                rules={[{ required: true, message: '请选择项目状态' }]}
            />
            <ProFormDatePicker
                name="completionTime"
                label="计划完成时间"
                width="md"
            />
            <ProFormDigit
                name="savingAmount"
                label="节约量(元)"
                placeholder="预计节约金额"
                min={0}
                fieldProps={{
                    precision: 2,
                    formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                    parser: (value) => value?.replace(/,/g, '') as unknown as number,
                }}
            />
            <ProFormTextArea
                name="plan"
                label="总体计划"
                placeholder="请输入项目总体计划"
                fieldProps={{ rows: 3 }}
            />
            <ProFormTextArea
                name="implementationPlan"
                label="实施计划"
                placeholder="请输入详细实施计划"
                fieldProps={{ rows: 3 }}
            />
            <ProFormText
                name="currentWork"
                label="当前工作"
                placeholder="当前进展情况"
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="备注信息"
                fieldProps={{ rows: 2 }}
            />
        </ProModalForm>
    );
};

export default ProjectForm;
