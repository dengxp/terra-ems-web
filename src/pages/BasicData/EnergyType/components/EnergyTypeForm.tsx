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
  EnergyCategory,
  EnergyCategoryLabel, EnergyType
} from '@/apis/energyType';
import { ProModalForm } from '@/components/container';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import {
  ProFormDigit, ProFormRadio, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea
} from '@ant-design/pro-components';
import { Col, ColorPicker, Form } from 'antd';
import type { Color } from 'antd/es/color-picker';
import React, { useEffect } from 'react';

interface EnergyTypeFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

/**
 * 能源类型新增/编辑表单
 */
const EnergyTypeForm: React.FC<EnergyTypeFormProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<EnergyType>({
        pathname: '/basic-data/energy-type',
        entityName: '能源类型',
        baseUrl: '/api/energy-types',
        onOpenChange: (open) => {
            if (!open) onCancel();
        }
    });

    const state = getState('/basic-data/energy-type');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({ ...state.editData });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    storable: false,
                    sortOrder: 0,
                    status: 0,
                });
            }
        }
    }, [visible, state.operation, state.editData, form]);

    const onFinish = async (values: any) => {
        const payload = state.operation === OperationEnum.EDIT ? { ...state.editData, ...values } : values;
        await handleSaveOrUpdate(payload);
        onSuccess();
        return true;
    };

    return (
        <ProModalForm
            title={state.dialogTitle}
            open={visible}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
            form={form}
            onFinish={onFinish}
            grid={true}
            rowProps={{
                gutter: 0,
            }}
            labelCol={{ span: 6 }}
            modalProps={{
                destroyOnHidden: true,
                width: 800,
            }}
        >
            <ProFormText
                name="id"
                hidden
            />
            <ProFormText
                name="name"
                label="名称"
                colProps={{ span: 12 }}
                placeholder="如：电力、天然气"
                rules={[{ required: true, message: '请输入名称' }]}
            />
            <ProFormText
                name="code"
                label="编码"
                colProps={{ span: 12 }}
                placeholder="如：ELECTRIC、NATURAL_GAS"
                disabled={state.operation === OperationEnum.EDIT}
                rules={[
                    { required: true, message: '请输入编码' },
                    { pattern: /^[A-Z_]+$/, message: '编码只能包含大写字母和下划线' },
                ]}
            />

            <ProFormText
                name="unit"
                label="计量单位"
                colProps={{ span: 12 }}
                placeholder="如：kWh、m³、t"
                rules={[{ required: true, message: '请输入计量单位' }]}
            />

            <ProFormSelect
                name="category"
                label="类别"
                colProps={{ span: 12 }}
                options={Object.values(EnergyCategory).map((value) => ({
                    label: EnergyCategoryLabel[value],
                    value,
                }))}
                placeholder="请选择类别"
            />

            <ProFormDigit
                name="coefficient"
                label="折标系数"
                colProps={{ span: 12 }}
                fieldProps={{
                    min: 0,
                    step: 0.0001,
                    precision: 4,
                    addonAfter: 'kgce/单位',
                    style: { width: '100%' },
                }}
            />

            <ProFormDigit
                name="emissionFactor"
                label="碳排放因子"
                colProps={{ span: 12 }}
                fieldProps={{
                    min: 0,
                    step: 0.0001,
                    precision: 4,
                    addonAfter: 'kgCO2/单位',
                    style: { width: '100%' },
                }}
            />

            <ProFormDigit
                name="defaultPrice"
                label="默认单价"
                colProps={{ span: 12 }}
                fieldProps={{
                    min: 0,
                    step: 0.01,
                    precision: 4,
                    prefix: '¥',
                    style: { width: '100%' },
                }}
            />

            <Col span={12}>
                <Form.Item
                    name="color"
                    label="展示颜色"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    getValueFromEvent={(color: Color) => color?.toHexString()}
                    getValueProps={(value: string) => ({ value: value || undefined })}
                >
                    <ColorPicker
                        showText
                        allowClear
                        presets={[
                            {
                                label: '推荐颜色',
                                colors: [
                                    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
                                    '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb',
                                ],
                            },
                        ]}
                    />
                </Form.Item>
            </Col>

            <ProFormDigit
                name="sortOrder"
                label="排序"
                colProps={{ span: 12 }}
                fieldProps={{
                    min: 0,
                    style: { width: '100%' },
                }}
            />

            <ProFormSwitch
                name="storable"
                label="是否可存储"
                colProps={{ span: 12 }}
            />

            <ProFormRadio.Group
                name="status"
                label="状态"
                colProps={{ span: 12 }}
                options={[
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ]}
            />

            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="备注信息"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                fieldProps={{
                    autoSize: {minRows: 3, maxRows: 6}
                }}
            />
        </ProModalForm>
    );
};

export default EnergyTypeForm;
