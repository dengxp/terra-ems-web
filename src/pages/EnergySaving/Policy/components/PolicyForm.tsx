import React, { useEffect } from 'react';
import {
    ModalForm,
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    ProFormDatePicker,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import {
    Policy,
    PolicyTypeOptions,
    createPolicy,
    updatePolicy,
} from '@/apis/policy';

interface PolicyFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    isEdit: boolean;
    currentRecord?: Policy;
    onSuccess: () => void;
}

const PolicyForm: React.FC<PolicyFormProps> = (props) => {
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
                await updatePolicy(currentRecord.id, { ...currentRecord, ...values });
                message.success('更新成功');
            } else {
                await createPolicy(values);
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
            title={isEdit ? '编辑政策法规' : '新增政策法规'}
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
                width: 640,
            }}
        >
            <ProFormText
                name="title"
                label="政策标题"
                placeholder="请输入政策标题"
                rules={[{ required: true, message: '请输入政策标题' }]}
            />
            <ProFormSelect
                name="type"
                label="政策类型"
                options={PolicyTypeOptions}
                rules={[{ required: true, message: '请选择政策类型' }]}
            />
            <ProFormText
                name="department"
                label="印发部门"
                placeholder="请输入印发部门"
            />
            <ProFormDatePicker
                name="issuingDate"
                label="印发时间"
                width="md"
            />
            <ProFormText
                name="fileUrl"
                label="文件地址"
                placeholder="请输入文件URL地址"
            />
            <ProFormTextArea
                name="summary"
                label="政策摘要"
                placeholder="请输入政策内容摘要"
                fieldProps={{ rows: 4 }}
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

export default PolicyForm;
