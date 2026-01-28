import React, { useEffect } from 'react';
import {
    ModalForm,
    ProFormText,
    ProFormSelect,
} from '@ant-design/pro-components';
import { Form, message, ColorPicker } from 'antd';
import { AlarmLimitType, createAlarmLimitType, updateAlarmLimitType } from '@/apis/alarm';

interface AlarmLimitTypeFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    isEdit: boolean;
    currentRecord?: AlarmLimitType;
    onSuccess: () => void;
}

const AlarmLimitTypeForm: React.FC<AlarmLimitTypeFormProps> = (props) => {
    const { visible, onVisibleChange, isEdit, currentRecord, onSuccess } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (isEdit && currentRecord) {
                form.setFieldsValue(currentRecord);
            } else {
                form.resetFields();
            }
        }
    }, [visible, isEdit, currentRecord, form]);

    const handleSubmit = async (values: any) => {
        try {
            if (isEdit && currentRecord) {
                await updateAlarmLimitType(currentRecord.id, { ...currentRecord, ...values });
                message.success('更新成功');
            } else {
                await createAlarmLimitType(values);
                message.success('创建成功');
            }
            onSuccess();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return (
        <ModalForm
            title={isEdit ? '编辑报警限值类型' : '新增报警限值类型'}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={handleSubmit}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
                width: 480,
            }}
        >
            <ProFormText
                name="limitName"
                label="限值类型名称"
                placeholder="请输入限值类型名称"
                rules={[{ required: true, message: '请输入限值类型名称' }]}
            />
            <ProFormText
                name="limitCode"
                label="限值类型编码"
                placeholder="请输入限值类型编码"
                disabled={isEdit}
                rules={[{ required: true, message: '请输入限值类型编码' }]}
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
        </ModalForm>
    );
};

export default AlarmLimitTypeForm;
