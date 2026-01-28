import React, { useEffect } from 'react';
import {
    ModalForm,
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    ProFormDigit,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import {
    Benchmark,
    BenchmarkTypeOptions,
    createBenchmark,
    updateBenchmark,
} from '@/apis/benchmark';

interface BenchmarkFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    isEdit: boolean;
    currentRecord?: Benchmark;
    onSuccess: () => void;
}

const BenchmarkForm: React.FC<BenchmarkFormProps> = (props) => {
    const { visible, onVisibleChange, isEdit, currentRecord, onSuccess } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (isEdit && currentRecord) {
                form.setFieldsValue(currentRecord);
            } else {
                form.resetFields();
                form.setFieldsValue({ type: 'NATIONAL', status: 0 });
            }
        }
    }, [visible, isEdit, currentRecord, form]);

    const handleSubmit = async (values: any) => {
        try {
            if (isEdit && currentRecord) {
                await updateBenchmark(currentRecord.id, { ...currentRecord, ...values });
                message.success('更新成功');
            } else {
                await createBenchmark(values);
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
            title={isEdit ? '编辑对标值' : '新增对标值'}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={handleSubmit}
            layout="horizontal"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
                width: 560,
            }}
        >
            <ProFormText
                name="code"
                label="标杆编码"
                placeholder="请输入标杆编码"
                disabled={isEdit}
                rules={[{ required: true, message: '请输入标杆编码' }]}
            />
            <ProFormText
                name="name"
                label="标杆名称"
                placeholder="请输入标杆名称"
                rules={[{ required: true, message: '请输入标杆名称' }]}
            />
            <ProFormSelect
                name="type"
                label="标杆类型"
                options={BenchmarkTypeOptions}
                rules={[{ required: true, message: '请选择标杆类型' }]}
            />
            <ProFormText
                name="grade"
                label="标杆等级"
                placeholder="如：先进值、准入值、1级"
            />
            <ProFormDigit
                name="value"
                label="标杆值"
                placeholder="请输入标杆值"
                fieldProps={{
                    precision: 4,
                }}
            />
            <ProFormText
                name="unit"
                label="单位"
                placeholder="如：kWh/t、%"
            />
            <ProFormText
                name="nationalNum"
                label="国标编号"
                placeholder="如：GB 16780-2021"
            />
            <ProFormSelect
                name="status"
                label="状态"
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
        </ModalForm>
    );
};

export default BenchmarkForm;
