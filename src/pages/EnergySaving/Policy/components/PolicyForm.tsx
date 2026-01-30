import React, { useEffect } from 'react';
import {
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    ProFormDatePicker,
} from '@ant-design/pro-components';
import { ProModalForm } from '@/components/container';
import {
    Policy,
    PolicyTypeOptions,
} from '@/apis/policy';
import useCrud from '@/hooks/common/useCrud';
import { OperationEnum } from '@/enums';

interface PolicyFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const PolicyForm: React.FC<PolicyFormProps> = ({ visible, onVisibleChange, onSuccess }) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<Policy>({
        pathname: '/energy-saving/policy',
        entityName: '政策法规',
        baseUrl: '/api/policies',
        onOpenChange: onVisibleChange
    });

    const state = getState('/energy-saving/policy');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue(state.editData);
            } else {
                form.resetFields();
                form.setFieldsValue({ type: 'NATIONAL', status: 0 });
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
        </ProModalForm>
    );
};

export default PolicyForm;
