import React, { useEffect } from 'react';
import {
    ModalForm,
    ProFormSelect,
    ProFormTextArea,
    ProFormDatePicker,
} from '@ant-design/pro-components';
import { Form, message } from 'antd';
import {
    CostPolicyBinding,
    createCostPolicyBinding,
    updateCostPolicyBinding,
} from '@/apis/costPolicyBinding';
import { EnergyUnit } from '@/apis/energyUnit';
import { PricePolicy } from '@/apis/pricePolicy';

interface BindingFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    isEdit: boolean;
    currentRecord?: CostPolicyBinding;
    energyUnits: EnergyUnit[];
    pricePolicies: PricePolicy[];
    onSuccess: () => void;
}

const BindingForm: React.FC<BindingFormProps> = (props) => {
    const { visible, onVisibleChange, isEdit, currentRecord, energyUnits, pricePolicies, onSuccess } = props;
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (isEdit && currentRecord) {
                form.setFieldsValue({
                    energyUnitId: currentRecord.energyUnit?.id,
                    pricePolicyId: currentRecord.pricePolicy?.id,
                    startDate: currentRecord.effectiveStartDate,
                    endDate: currentRecord.effectiveEndDate,
                    remark: currentRecord.remark,
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, isEdit, currentRecord, form]);

    const handleSubmit = async (values: any) => {
        try {
            if (isEdit && currentRecord) {
                await updateCostPolicyBinding(currentRecord.id, {
                    pricePolicyId: values.pricePolicyId,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    remark: values.remark,
                });
                message.success('更新成功');
            } else {
                await createCostPolicyBinding({
                    energyUnitId: values.energyUnitId,
                    pricePolicyId: values.pricePolicyId,
                    startDate: values.startDate,
                    endDate: values.endDate,
                    remark: values.remark,
                });
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
            title={isEdit ? '编辑策略绑定' : '新增策略绑定'}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={handleSubmit}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                width: 520,
            }}
        >
            <ProFormSelect
                name="energyUnitId"
                label="用能单元"
                options={energyUnits.map((u) => ({ label: u.name, value: u.id }))}
                disabled={isEdit}
                rules={[{ required: true, message: '请选择用能单元' }]}
            />
            <ProFormSelect
                name="pricePolicyId"
                label="电价策略"
                options={pricePolicies.map((p) => ({ label: p.name, value: p.id }))}
                rules={[{ required: true, message: '请选择电价策略' }]}
            />
            <ProFormDatePicker
                name="startDate"
                label="生效开始日期"
                width="md"
                rules={[{ required: true, message: '请选择生效开始日期' }]}
            />
            <ProFormDatePicker
                name="endDate"
                label="生效结束日期"
                width="md"
                tooltip="为空表示长期有效"
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

export default BindingForm;
