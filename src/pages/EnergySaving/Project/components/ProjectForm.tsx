import React, { useEffect } from 'react';
import {
    ModalForm,
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    ProFormDatePicker,
    ProFormDigit,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import {
    EnergySavingProject,
    ProjectStatusOptions,
    createProject,
    updateProject,
} from '@/apis/energySavingProject';

interface ProjectFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    isEdit: boolean;
    currentRecord?: EnergySavingProject;
    onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = (props) => {
    const { visible, onVisibleChange, isEdit, currentRecord, onSuccess } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (isEdit && currentRecord) {
                form.setFieldsValue(currentRecord);
            } else {
                form.resetFields();
                form.setFieldsValue({ status: 'PLANNING' });
            }
        }
    }, [visible, isEdit, currentRecord, form]);

    const handleSubmit = async (values: any) => {
        try {
            if (isEdit && currentRecord) {
                await updateProject(currentRecord.id, { ...currentRecord, ...values });
                message.success('更新成功');
            } else {
                await createProject(values);
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
            title={isEdit ? '编辑节能项目' : '新增节能项目'}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={handleSubmit}
            layout="horizontal"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                width: 640,
            }}
        >
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
                options={ProjectStatusOptions}
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
        </ModalForm>
    );
};

export default ProjectForm;
