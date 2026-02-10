import React, { useEffect, useState } from 'react';
import {
    ModalForm,
    ProFormSelect,
    ProFormTextArea,
    ProFormDatePicker,
    ProFormDigit,
    ProFormTreeSelect,
} from '@ant-design/pro-components';
import { Form, message, Row, Col } from 'antd';
import {
    EnergyCostRecord,
    createEnergyCostRecord,
    updateEnergyCostRecord,
} from '@/apis/energyCostRecord';
import { getEnabledEnergyUnitTree, EnergyUnit } from '@/apis/energyUnit';
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
                getEnabledEnergyUnitTree(),
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
            }
        }
    }, [visible, isEdit, currentRecord, form]);

    const handleSubmit = async (values: any) => {
        try {
            // 数据一致性校验：尖峰平谷用量之和应等于总用量
            const consumption = values.consumption || 0;
            const sharpConsumption = values.sharpConsumption || 0;
            const peakConsumption = values.peakConsumption || 0;
            const flatConsumption = values.flatConsumption || 0;
            const valleyConsumption = values.valleyConsumption || 0;

            const periodSum = sharpConsumption + peakConsumption + flatConsumption + valleyConsumption;

            // 如果填写了分时段用量，检查总和是否匹配
            if (periodSum > 0 && consumption > 0) {
                const diff = Math.abs(periodSum - consumption);
                // 允许小数精度误差（0.0001）
                if (diff > 0.0001) {
                    message.warning(
                        `尖峰平谷用量之和（${periodSum.toFixed(4)}）与总用量（${consumption.toFixed(4)}）不一致，差值：${diff.toFixed(4)}`
                    );
                    return false;
                }
            }

            const data = {
                ...currentRecord, // 重点：合并旧数据
                ...values,
                periodType: 'DAY', // 强制设置为日粒度
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
                    <ProFormTreeSelect
                        name="energyUnitId"
                        label="用能单元"
                        fieldProps={{
                            treeData: energyUnits,
                            fieldNames: { label: 'name', value: 'id', children: 'children' },
                            showSearch: true,
                            treeDefaultExpandAll: true,
                            filterTreeNode: (input: string, node: any) =>
                                (node?.name as string)?.toLowerCase().includes(input.toLowerCase()),
                        }}
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
                <Col span={24}>
                    <ProFormDatePicker
                        name="recordDate"
                        label="记录日期"
                        fieldProps={{ style: { width: '100%' } }}
                        rules={[{ required: true, message: '请选择记录日期' }]}
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
                    <ProFormDigit name="powerFactor" label="功率因数" fieldProps={{ precision: 2, max: 1, min: 0 }} />
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
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="备注信息"
                labelCol={{ span: 4 }}
                wrapperCol={{ span: 20 }}
                fieldProps={{ rows: 2 }}
            />
        </ModalForm>
    );
};

export default CostRecordForm;
