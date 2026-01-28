import React, { useEffect, useState } from 'react';
import {
    ModalForm,
    ProFormSelect,
    ProFormTextArea,
    ProFormDatePicker,
    ProFormDigit,
} from '@ant-design/pro-components';
import { Form, message, Row, Col } from 'antd';
import {
    EnergyCostRecord,
    RecordPeriodTypeOptions,
    createEnergyCostRecord,
    updateEnergyCostRecord,
} from '@/apis/energyCostRecord';
import { getEnabledEnergyUnits, EnergyUnit } from '@/apis/energyUnit';
import { getEnabledEnergyTypes, EnergyType } from '@/apis/energyType';

interface CostRecordFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    isEdit: boolean;
    currentRecord?: EnergyCostRecord;
    onSuccess: () => void;
}

const CostRecordForm: React.FC<CostRecordFormProps> = (props) => {
    const { visible, onVisibleChange, isEdit, currentRecord, onSuccess } = props;
    const [form] = Form.useForm();
    const [energyUnits, setEnergyUnits] = useState<EnergyUnit[]>([]);
    const [energyTypes, setEnergyTypes] = useState<EnergyType[]>([]);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            const [unitRes, typeRes] = await Promise.all([
                getEnabledEnergyUnits(),
                getEnabledEnergyTypes(),
            ]);
            setEnergyUnits(unitRes.data || []);
            setEnergyTypes(typeRes.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (visible) {
            if (isEdit && currentRecord) {
                form.setFieldsValue({
                    ...currentRecord,
                    energyUnitId: currentRecord.energyUnit?.id,
                    energyTypeId: currentRecord.energyType?.id,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ periodType: 'DAY' });
            }
        }
    }, [visible, isEdit, currentRecord, form]);

    const handleSubmit = async (values: any) => {
        try {
            const data = {
                ...currentRecord, // 重点：合并旧数据
                ...values,
                energyUnit: values.energyUnitId ? { id: values.energyUnitId } : null,
                energyType: values.energyTypeId ? { id: values.energyTypeId } : null,
            };
            if (isEdit && currentRecord) {
                await updateEnergyCostRecord(currentRecord.id, data);
                message.success('更新成功');
            } else {
                await createEnergyCostRecord(data);
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
            title={isEdit ? '编辑成本记录' : '新增成本记录'}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={handleSubmit}
            layout="horizontal"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
                width: 680,
            }}
        >
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormSelect
                        name="energyUnitId"
                        label="用能单元"
                        options={energyUnits.map((u) => ({ label: u.name, value: u.id }))}
                    />
                </Col>
                <Col span={12}>
                    <ProFormSelect
                        name="energyTypeId"
                        label="能源类型"
                        options={energyTypes.map((t) => ({ label: t.name, value: t.id }))}
                    />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormDatePicker
                        name="recordDate"
                        label="记录日期"
                        width="md"
                        rules={[{ required: true, message: '请选择记录日期' }]}
                    />
                </Col>
                <Col span={12}>
                    <ProFormSelect
                        name="periodType"
                        label="周期类型"
                        options={RecordPeriodTypeOptions}
                        rules={[{ required: true }]}
                    />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormDigit name="consumption" label="用量" fieldProps={{ precision: 4 }} />
                </Col>
                <Col span={12}>
                    <ProFormDigit name="cost" label="成本(元)" fieldProps={{ precision: 2 }} />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormDigit name="sharpConsumption" label="尖时段用量" fieldProps={{ precision: 4 }} />
                </Col>
                <Col span={12}>
                    <ProFormDigit name="peakConsumption" label="峰时段用量" fieldProps={{ precision: 4 }} />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormDigit name="flatConsumption" label="平时段用量" fieldProps={{ precision: 4 }} />
                </Col>
                <Col span={12}>
                    <ProFormDigit name="valleyConsumption" label="谷时段用量" fieldProps={{ precision: 4 }} />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormDigit name="powerFactor" label="功率因数" fieldProps={{ precision: 2, max: 1, min: 0 }} />
                </Col>
            </Row>
            <ProFormTextArea name="remark" label="备注" placeholder="备注信息" fieldProps={{ rows: 2 }} />
        </ModalForm>
    );
};

export default CostRecordForm;
