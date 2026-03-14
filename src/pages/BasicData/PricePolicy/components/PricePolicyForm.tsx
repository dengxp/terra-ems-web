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

import {
    periodTypeOptions, PricePolicy,
    PricePolicyItem, getPricePolicyById
} from '@/apis/pricePolicy';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
    ProForm, ProFormDateRangePicker, ProFormDigit,
    ProFormRadio, ProFormSwitch, ProFormText, ProFormTextArea
} from '@ant-design/pro-components';
import { Button, Drawer, Form, Input, InputNumber, message, Select, Space, Table } from 'antd';
import React, { useEffect, useState } from 'react';

interface PricePolicyFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const PricePolicyForm: React.FC<PricePolicyFormProps> = ({
    visible,
    onVisibleChange,
    onSuccess,
}) => {
    const [items, setItems] = useState<PricePolicyItem[]>([]);
    const [form] = Form.useForm();
    const [isMultiRate, setIsMultiRate] = useState(true);

    // 使用 useCrud hook
    const {
        handleSaveOrUpdate,
        getState,
    } = useCrud<PricePolicy>({
        pathname: '/basic-data/price-policy',
        entityName: '电价策略',
        baseUrl: '/api/price-policies',
        onOpenChange: onVisibleChange,
    });

    const state = getState('/basic-data/price-policy');
    const loading = state?.loading || false;

    useEffect(() => {
        if (visible) {
            form.resetFields();

            // 1. 初步回显：利用列表已有的数据
            if (state.editData) {
                const initialValues = { ...state.editData };
                if (state.editData.effectiveStartDate || state.editData.effectiveEndDate) {
                    initialValues.effectiveDateRange = [
                        state.editData.effectiveStartDate || '',
                        state.editData.effectiveEndDate || '',
                    ];
                }
                form.setFieldsValue(initialValues);
                setIsMultiRate(!!state.editData.isMultiRate);
                setItems(state.editData.items || []);
            }

            // 2. 深度加载：如果是编辑模式，拉取完整的详情数据（包含时段明细等）
            if (state.operation === OperationEnum.EDIT && state.editData?.id) {
                getPricePolicyById(state.editData.id).then((res) => {
                    if (res.success && res.data) {
                        const fullData = res.data;
                        const finalValues = { ...fullData };
                        if (fullData.effectiveStartDate || fullData.effectiveEndDate) {
                            finalValues.effectiveDateRange = [
                                fullData.effectiveStartDate || '',
                                fullData.effectiveEndDate || '',
                            ];
                        }
                        form.setFieldsValue(finalValues);
                        setIsMultiRate(!!fullData.isMultiRate);
                        setItems(fullData.items || []);
                    }
                });
            } else if (state.operation === OperationEnum.CREATE) {
                // 新建模式，初始化默认配置
                form.setFieldsValue({ isMultiRate: true });
                setIsMultiRate(true);
                setItems([
                    { periodType: 'DEEP', price: 0, startTime: '00:00', endTime: '07:00', sortOrder: 1 },
                    { periodType: 'FLAT', price: 0, startTime: '07:00', endTime: '09:00', sortOrder: 2 },
                    { periodType: 'PEAK', price: 0, startTime: '09:00', endTime: '11:00', sortOrder: 3 },
                    { periodType: 'SHARP', price: 0, startTime: '11:00', endTime: '13:00', sortOrder: 4 },
                    { periodType: 'FLAT', price: 0, startTime: '13:00', endTime: '17:00', sortOrder: 5 },
                    { periodType: 'PEAK', price: 0, startTime: '17:00', endTime: '19:00', sortOrder: 6 },
                    { periodType: 'SHARP', price: 0, startTime: '19:00', endTime: '21:00', sortOrder: 7 },
                    { periodType: 'FLAT', price: 0, startTime: '21:00', endTime: '23:00', sortOrder: 8 },
                    { periodType: 'VALLEY', price: 0, startTime: '23:00', endTime: '24:00', sortOrder: 9 },
                ]);
            }
        }
    }, [visible, state.operation, state.editData?.id]);

    const handleAddItem = () => {
        setItems([...items, { periodType: 'FLAT', price: 0, startTime: '', endTime: '', sortOrder: items.length + 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof PricePolicyItem, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleMultiRateChange = (checked: boolean) => {
        setIsMultiRate(checked);
        if (!checked) {
            // 关闭复费率时，只保留一个统一电价
            setItems([{ periodType: 'FLAT', price: 0, startTime: '00:00', endTime: '24:00', sortOrder: 1 }]);
        } else if (items.length <= 1) {
            // 开启复费率时，恢复默认时段配置
            setItems([
                { periodType: 'DEEP', price: 0, startTime: '00:00', endTime: '07:00', sortOrder: 1 },
                { periodType: 'FLAT', price: 0, startTime: '07:00', endTime: '09:00', sortOrder: 2 },
                { periodType: 'PEAK', price: 0, startTime: '09:00', endTime: '11:00', sortOrder: 3 },
                { periodType: 'SHARP', price: 0, startTime: '11:00', endTime: '13:00', sortOrder: 4 },
                { periodType: 'FLAT', price: 0, startTime: '13:00', endTime: '17:00', sortOrder: 5 },
                { periodType: 'PEAK', price: 0, startTime: '17:00', endTime: '19:00', sortOrder: 6 },
                { periodType: 'SHARP', price: 0, startTime: '19:00', endTime: '21:00', sortOrder: 7 },
                { periodType: 'FLAT', price: 0, startTime: '21:00', endTime: '23:00', sortOrder: 8 },
                { periodType: 'VALLEY', price: 0, startTime: '23:00', endTime: '24:00', sortOrder: 9 },
            ]);
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // 转换生效日期范围为开始和结束日期（使用字符串格式避免时区问题）
            const { effectiveDateRange, ...restValues } = values;
            const data = {
                ...state.editData, // 合并旧数据（编辑时会带上 id）
                ...restValues,
                effectiveStartDate: effectiveDateRange?.[0]
                    ? (typeof effectiveDateRange[0] === 'string'
                        ? effectiveDateRange[0]
                        : effectiveDateRange[0].format('YYYY-MM-DD'))
                    : null,
                effectiveEndDate: effectiveDateRange?.[1]
                    ? (typeof effectiveDateRange[1] === 'string'
                        ? effectiveDateRange[1]
                        : effectiveDateRange[1].format('YYYY-MM-DD'))
                    : null,
                items
            };

            // 统一使用 handleSaveOrUpdate，后端根据 id 判断是新增还是更新
            await handleSaveOrUpdate(data);
            onSuccess();
        } catch (error) {
            if ((error as any)?.errorFields) {
                message.error('请检查表单必填项');
            }
            // 其他错误由 useCrud 内部处理
        }
    };

    const handleCancel = () => {
        onVisibleChange(false);
    };

    const itemColumns = [
        {
            title: '时段类型',
            dataIndex: 'periodType',
            width: 100,
            render: (_: any, record: PricePolicyItem, index: number) => (
                <Select
                    value={record.periodType}
                    style={{ width: '100%' }}
                    options={periodTypeOptions.map(opt => ({ label: opt.label, value: opt.value }))}
                    onChange={(value) => handleItemChange(index, 'periodType', value)}
                    disabled={!isMultiRate}
                />
            ),
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            width: 100,
            render: (_: any, record: PricePolicyItem, index: number) => (
                <Input
                    value={record.startTime}
                    placeholder="HH:mm"
                    style={{ width: '100%' }}
                    onChange={(e) => handleItemChange(index, 'startTime', e.target.value)}
                    disabled={!isMultiRate}
                />
            ),
        },
        {
            title: '结束时间',
            dataIndex: 'endTime',
            width: 100,
            render: (_: any, record: PricePolicyItem, index: number) => (
                <Input
                    value={record.endTime}
                    placeholder="HH:mm"
                    style={{ width: '100%' }}
                    onChange={(e) => handleItemChange(index, 'endTime', e.target.value)}
                    disabled={!isMultiRate}
                />
            ),
        },
        {
            title: isMultiRate ? '单价（元）' : '统一电价（元）',
            dataIndex: 'price',
            width: 120,
            render: (_: any, record: PricePolicyItem, index: number) => (
                <InputNumber
                    value={record.price}
                    min={0}
                    precision={4}
                    style={{ width: '100%' }}
                    onChange={(value) => handleItemChange(index, 'price', value || 0)}
                />
            ),
        },
        ...(isMultiRate ? [{
            title: '操作',
            width: 60,
            render: (_: any, __: PricePolicyItem, index: number) => (
                <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveItem(index)}
                    disabled={items.length <= 1}
                />
            ),
        }] : []),
    ];

    return (
        <Drawer
            title={state?.dialogTitle}
            open={visible}
            onClose={handleCancel}
            size="large"
            destroyOnHidden
            footer={
                <div style={{ textAlign: 'right', paddingTop: 8 }}>
                    <Space>
                        <Button onClick={handleCancel}>取消</Button>
                        <Button type="primary" onClick={handleSubmit} loading={loading}>
                            确定
                        </Button>
                    </Space>
                </div>
            }
        >
            {/* 基本信息区域 */}
            <div style={{
                fontWeight: 500,
                fontSize: 14,
                color: '#333',
                marginBottom: 16,
                padding: '8px 12px',
                background: '#fafafa',
                borderLeft: '3px solid #1890ff',
                borderRadius: '0 4px 4px 0',
            }}>
                基本信息
            </div>
            <ProForm
                form={form}
                layout="horizontal"
                grid={true}
                rowProps={{ gutter: [24, 0] }}
                labelCol={{ span: 7 }}
                submitter={false}
            >
                <ProFormText
                    name="code"
                    label="策略编码"
                    colProps={{ span: 12 }}
                    placeholder="请输入策略编码"
                    rules={[
                        { required: true, message: '请输入策略编码' },
                        { max: 50, message: '编码最多50个字符' },
                    ]}
                />
                <ProFormText
                    name="name"
                    label="策略名称"
                    colProps={{ span: 12 }}
                    placeholder="请输入策略名称"
                    rules={[
                        { required: true, message: '请输入策略名称' },
                        { max: 100, message: '名称最多100个字符' },
                    ]}
                />
                <ProFormDateRangePicker
                    name="effectiveDateRange"
                    label="生效日期"
                    colProps={{ span: 12 }}
                    placeholder={['开始日期', '结束日期']}
                />
                <ProFormDigit
                    name="sortOrder"
                    label="排序"
                    colProps={{ span: 12 }}
                    placeholder="请输入排序号"
                    min={0}
                    fieldProps={{ precision: 0, style: { width: '100%' } }}
                />
                <ProFormSwitch
                    name="isMultiRate"
                    label="分时电价"
                    colProps={{ span: 12 }}
                    tooltip="开启表示使用尖峰平谷分时计价，关闭则使用统一电价"
                    fieldProps={{
                        onChange: handleMultiRateChange,
                    }}
                />
                <ProFormRadio.Group
                    name="status"
                    label="状态"
                    colProps={{ span: 12 }}
                    initialValue={0}
                    rules={[{ required: true, message: '请选择状态' }]}
                    options={[
                        { label: '启用', value: 0 },
                        { label: '停用', value: 1 },
                    ]}
                />
                <ProFormTextArea
                    name="remark"
                    label="备注"
                    colProps={{ span: 24 }}
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}
                    placeholder="请输入备注"
                    fieldProps={{ rows: 2 }}
                />
            </ProForm>

            {/* 时段配置区域 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 20,
                marginBottom: 16,
                padding: '8px 12px',
                background: '#fafafa',
                borderLeft: '3px solid #1890ff',
                borderRadius: '0 4px 4px 0',
            }}>
                <span style={{ fontWeight: 500, fontSize: 14, color: '#333' }}>
                    {isMultiRate ? '时段配置' : '电价配置'}
                </span>
                {isMultiRate && (
                    <Button
                        type="link"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={handleAddItem}
                    >
                        添加时段
                    </Button>
                )}
            </div>

            <Table
                dataSource={items}
                columns={itemColumns}
                rowKey={(_, index) => String(index)}
                pagination={false}
                size="small"
            />
        </Drawer>
    );
};

export default PricePolicyForm;
