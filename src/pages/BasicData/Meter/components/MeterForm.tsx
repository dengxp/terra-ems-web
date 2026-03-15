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

import { EnergyType, getEnabledEnergyTypes } from '@/apis/energyType';
import { Meter } from '@/apis/meter';
import { ProModalForm } from "@/components/container";
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { ProFormDatePicker, ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';

interface MeterFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

/**
 * 计量器具表单弹窗
 */
const MeterForm: React.FC<MeterFormProps> = ({ visible, onCancel, onSuccess }) => {
    const [energyTypes, setEnergyTypes] = useState<EnergyType[]>([]);

    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<Meter>({
        pathname: '/basic-data/meter',
        entityName: '计量器具',
        baseUrl: '/api/meters',
        onOpenChange: (open) => {
            if (!open) onCancel();
        }
    });

    const state = getState('/basic-data/meter');

    // 获取启用的能源类型
    useEffect(() => {
        if (visible) {
            getEnabledEnergyTypes().then((res) => {
                if (res.success) {
                    setEnergyTypes(res.data || []);
                }
            });
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({
                    ...state.editData,
                    energyTypeId: state.editData?.energyType?.id
                });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    status: 0,
                    checkCycle: 365,
                    reminderCycle: 30
                });
            }
        }
    }, [visible, state.operation, state.editData, form]);

    return (
        <ProModalForm
            title={state.dialogTitle}
            open={visible}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
            form={form}
            onFinish={async (values) => {
                // 构造传给后端的对象，后端实体要求 EnergyType 对象
                const submitData = {
                    ...state.editData,
                    ...values,
                    energyType: { id: values.energyTypeId }
                };
                delete (submitData as any).energyTypeId;

                await handleSaveOrUpdate(submitData);
                onSuccess();
                return true;
            }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
                width: 800,
            }}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            grid={true}
            colProps={{ span: 12 }}
            rowProps={{
                gutter: [16, 0]
            }}
            loading={state.loading}
        >
            <ProFormText
                name="id"
                hidden
            />
            <ProFormText
                name="name"
                label="器具名称"
                placeholder="请输入器具名称"
                rules={[{ required: true, message: '请输入器具名称' }]}
            />
            <ProFormText
                name="code"
                label="器具编码"
                placeholder="请输入器具编码"
                rules={[{ required: true, message: '请输入器具编码' }]}
                disabled={state.operation === OperationEnum.EDIT}
            />
            <ProFormSelect
                name="energyTypeId"
                label="能源类型"
                placeholder="请选择能源类型"
                rules={[{ required: true, message: '请选择能源类型' }]}
                options={energyTypes.map(item => ({
                    label: item.name,
                    value: item.id
                }))}
            />
            <ProFormSelect
                name="type"
                label="器具类型"
                placeholder="请选择器具类型"
                rules={[{ required: true, message: '请选择器具类型' }]}
                options={[
                    { label: '电表', value: 'ELECTRIC_METER' },
                    { label: '水表', value: 'WATER_METER' },
                    { label: '气表', value: 'GAS_METER' },
                    { label: '热量表', value: 'HEAT_METER' },
                ]}
            />
            <ProFormText
                name="modelNumber"
                label="规格型号"
                placeholder="请输入规格型号"
            />
            <ProFormText
                name="measureRange"
                label="测量范围"
                placeholder="请输入测量范围"
            />
            <ProFormText
                name="manufacturer"
                label="生产厂商"
                placeholder="请输入生产厂商"
            />
            <ProFormText
                name="personCharge"
                label="负责人"
                placeholder="请输入负责人"
            />
            <ProFormText
                name="location"
                label="安装位置"
                placeholder="请输入安装位置"
            />
            <ProFormDatePicker
                name="startTime"
                label="起始时间"
            />
            <ProFormDatePicker
                name="putrunTime"
                label="投运时间"
            />
            <ProFormDigit
                name="checkCycle"
                label="检定周期(天)"
                placeholder="请输入检定周期"
            />
            <ProFormDigit
                name="reminderCycle"
                label="提醒周期(天)"
                placeholder="请输入提醒周期"
            />
            <ProFormSelect
                name="status"
                label="状态"
                options={[
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ]}
                rules={[{ required: true }]}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
                colProps={{ span: 24 }}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
            />
        </ProModalForm>
    );
};

export default MeterForm;
