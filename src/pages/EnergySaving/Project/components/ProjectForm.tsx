import React, { useEffect } from 'react';
import {
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    ProFormDatePicker,
    ProFormDigit,
} from '@ant-design/pro-components';
import { ProModalForm } from '@/components/container';
import {
    EnergySavingProject,
    projectStatusOptions,
} from '@/apis/energySavingProject';
import useCrud from '@/hooks/common/useCrud';
import { OperationEnum } from '@/enums';

interface ProjectFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ visible, onVisibleChange, onSuccess }) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<EnergySavingProject>({
        pathname: '/energy-saving/project',
        entityName: '节能项目',
        baseUrl: '/api/ems/saving-projects',
        onOpenChange: onVisibleChange
    });

    const state = getState('/energy-saving/project');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue(state.editData);
            } else {
                form.resetFields();
                form.setFieldsValue({ status: 'PLANNING' });
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
                options={projectStatusOptions}
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
        </ProModalForm>
    );
};

export default ProjectForm;
