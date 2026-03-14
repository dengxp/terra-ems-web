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

import { AlarmLimitType } from '@/apis/alarm';
import { ProModalForm } from '@/components/container';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { ColorPicker, Form } from 'antd';
import React, { useEffect } from 'react';

interface AlarmLimitTypeFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const AlarmLimitTypeForm: React.FC<AlarmLimitTypeFormProps> = ({
    visible,
    onVisibleChange,
    onSuccess,
}) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<AlarmLimitType>({
        pathname: '/basic-data/alarm-limit-type',
        entityName: '报警限值类型',
        baseUrl: '/api/alarm/limit-types',
        onOpenChange: onVisibleChange
    });

    const state = getState('/basic-data/alarm-limit-type');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({ ...state.editData });
            } else {
                form.resetFields();
            }
        }
    }, [visible, state.operation, state.editData, form]);

    return (
        <ProModalForm
            title={state.dialogTitle}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={async (values) => {
                const submitData = {
                    ...state.editData,
                    ...values
                };
                await handleSaveOrUpdate(submitData);
                onSuccess();
                return true;
            }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
                width: 500,
            }}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            loading={state.loading}
        >
            <ProFormText
                name="id"
                hidden
            />
            <ProFormText
                name="limitName"
                label="限值名称"
                placeholder="请输入限值名称"
                rules={[{ required: true, message: '请输入限值名称' }]}
            />
            <ProFormText
                name="limitCode"
                label="限值编码"
                placeholder="请输入限值编码"
                disabled={state.operation === OperationEnum.EDIT}
                rules={[{ required: true, message: '请输入限值编码' }]}
            />
            <Form.Item
                name="colorNumber"
                label="色号"
                getValueFromEvent={(color) => color.toHexString()}
                initialValue="#1677ff"
            >
                <ColorPicker showText />
            </Form.Item>
            <ProFormSelect
                name="comparatorOperator"
                label="比较运算符"
                options={[
                    { label: '大于 (>)', value: '>' },
                    { label: '大于等于 (>=)', value: '>=' },
                    { label: '小于 (<)', value: '<' },
                    { label: '小于等于 (<=)', value: '<=' },
                    { label: '等于 (=)', value: '=' },
                ]}
                rules={[{ required: true, message: '请选择比较运算符' }]}
            />
            <ProFormSelect
                name="alarmType"
                label="报警级别"
                options={[
                    { label: '预警 (WARNING)', value: 'WARNING' },
                    { label: '报警 (ALARM)', value: 'ALARM' },
                ]}
                rules={[{ required: true, message: '请选择报警级别' }]}
            />
        </ProModalForm>
    );
};

export default AlarmLimitTypeForm;
