import React, { useEffect } from 'react';
import { ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Form, ColorPicker } from 'antd';
import { ProModalForm } from '@/components/container';
import { AlarmLimitType } from '@/apis/alarm';
import useCrud from '@/hooks/common/useCrud';
import { OperationEnum } from '@/enums';

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
