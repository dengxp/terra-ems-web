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

import {
  CostPolicyBinding
} from '@/apis/costPolicyBinding';
import { getEnabledEnergyUnitTree } from '@/apis/energyUnit';
import { getEnabledPricePolicies } from '@/apis/pricePolicy';
import { ProModalForm } from '@/components/container';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import {
  ProFormDatePicker, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea, ProFormTreeSelect
} from '@ant-design/pro-components';
import React, { useEffect } from 'react';

interface BindingFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const BindingForm: React.FC<BindingFormProps> = ({ visible, onVisibleChange, onSuccess }) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<CostPolicyBinding>({
        pathname: '/cost-management/policy-binding',
        entityName: '策略绑定',
        baseUrl: '/api/ems/cost-policy-bindings',
        onOpenChange: onVisibleChange
    });

    const state = getState('/cost-management/policy-binding');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({
                    ...state.editData,
                    energyUnitId: state.editData?.energyUnit?.id,
                    pricePolicyId: state.editData?.pricePolicy?.id,
                });
            } else {
                form.resetFields();
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
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
            }}
            width={520}
            loading={state.loading}
        >
            <ProFormText name="id" hidden />
            <ProFormTreeSelect
                name="energyUnitId"
                label="用能单元"
                colProps={{ span: 24 }}
                disabled={state.operation === OperationEnum.EDIT}
                rules={[{ required: true, message: '请选择用能单元' }]}
                request={async () => {
                    const res = await getEnabledEnergyUnitTree();
                    return res.data || [];
                }}
                fieldProps={{
                    fieldNames: { label: 'name', value: 'id', children: 'children' },
                    showSearch: true,
                    treeDefaultExpandAll: true,
                    filterTreeNode: (input: string, node: any) =>
                        (node?.name as string)?.toLowerCase().includes(input.toLowerCase()),
                }}
            />
            <ProFormSelect
                name="pricePolicyId"
                label="电价策略"
                rules={[{ required: true, message: '请选择电价策略' }]}
                request={async () => {
                    const res = await getEnabledPricePolicies();
                    return (res.data || []).map((p: any) => ({ label: p.name, value: p.id }));
                }}
            />
            <ProFormDatePicker
                name="effectiveStartDate"
                label="生效开始日期"
                width="md"
                rules={[{ required: true, message: '请选择生效开始日期' }]}
            />
            <ProFormDatePicker
                name="effectiveEndDate"
                label="生效结束日期"
                width="md"
                tooltip="为空表示长期有效"
            />
            <ProFormRadio.Group
                name="status"
                label="状态"
                hidden={state.operation === OperationEnum.CREATE}
                options={[
                    { label: '启用', value: 0 },
                    { label: '禁用', value: 1 },
                ]}
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

export default BindingForm;
