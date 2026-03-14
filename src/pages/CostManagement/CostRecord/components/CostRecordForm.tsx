/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import { EnergyCostRecord } from '@/apis/energyCostRecord';
import { EnergyType, getEnabledEnergyTypes } from '@/apis/energyType';
import { EnergyUnit, getEnabledEnergyUnitTree } from '@/apis/energyUnit';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import {
  ModalForm, ProFormDatePicker,
  ProFormDigit, ProFormSelect,
  ProFormTextArea, ProFormTreeSelect
} from '@ant-design/pro-components';
import { Col, message, Row } from 'antd';
import React, { useEffect, useState } from 'react';

interface CostRecordFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CostRecordForm: React.FC<CostRecordFormProps> = ({ open, onOpenChange }) => {
    const pathname = '/cost-management/cost-record';
    const {
        form,
        getState,
        handleSaveOrUpdate,
    } = useCrud<EnergyCostRecord>({
        entityName: '成本记录',
        pathname,
        baseUrl: '/api/ems/energy-cost-records',
        onOpenChange,
    });

    const state = getState(pathname);
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
        if (open) {
            if (state.operation === OperationEnum.EDIT && state.editData) {
                form.setFieldsValue({
                    ...state.editData,
                    energyUnitId: state.editData.energyUnit?.id,
                    energyTypeId: state.editData.energyType?.id,
                });
            } else {
                form.resetFields();
            }
        }
    }, [open, state.operation, state.editData, form]);

    const onFinish = async (values: any) => {
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
            if (diff > 0.0001) {
                message.warning(
                    `尖峰平谷用量之和（${periodSum.toFixed(4)}）与总用量（${consumption.toFixed(4)}）不一致，差值：${diff.toFixed(4)}`
                );
                return false;
            }
        }

        const data = {
            ...state.editData, // 合并旧数据
            ...values,
            periodType: 'DAY',
            energyUnit: values.energyUnitId ? { id: values.energyUnitId } : null,
            energyType: values.energyTypeId ? { id: values.energyTypeId } : null,
        };

        await handleSaveOrUpdate(data);
        return true;
    };

    return (
        <ModalForm
            title={state.dialogTitle}
            open={open}
            onOpenChange={onOpenChange}
            form={form}
            onFinish={onFinish}
            layout="horizontal"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}
            modalProps={{
                destroyOnClose: true,
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
                <Col span={12}>
                    <ProFormDatePicker
                        name="recordDate"
                        label="记录日期"
                        width="md"
                        rules={[{ required: true, message: '请选择记录日期' }]}
                    />
                </Col>
                <Col span={12}>
                    <ProFormDigit name="consumption" label="用量" fieldProps={{ precision: 4 }} />
                </Col>
            </Row>
            <Row gutter={16}>
                <Col span={12}>
                    <ProFormDigit name="cost" label="成本(元)" fieldProps={{ precision: 2 }} />
                </Col>
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
