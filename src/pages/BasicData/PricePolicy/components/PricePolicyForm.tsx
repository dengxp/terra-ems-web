import React, { useEffect, useState } from 'react';
import {
    ProFormText,
    ProFormDigit,
    ProFormRadio,
    ProFormTextArea,
    ProFormSwitch,
    ProFormDateRangePicker,
    ProForm,
} from '@ant-design/pro-components';
import { Button, Drawer, Form, Input, InputNumber, Select, Space, Table, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
    PricePolicy,
    PricePolicyItem,
    PeriodTypeOptions,
} from '@/apis/pricePolicy';
import useCrud from '@/hooks/common/useCrud';

interface PricePolicyFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
    currentRecord?: PricePolicy;
}

const PricePolicyForm: React.FC<PricePolicyFormProps> = ({
    visible,
    onVisibleChange,
    onSuccess,
    currentRecord,
}) => {
    const isEdit = !!currentRecord;
    const title = isEdit ? '编辑电价策略' : '新增电价策略';
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
            if (currentRecord) {
                // 编辑模式：处理生效日期回显
                const initialValues = { ...currentRecord };
                if (currentRecord.effectiveStartDate || currentRecord.effectiveEndDate) {
                    initialValues.effectiveDateRange = [
                        currentRecord.effectiveStartDate || '',
                        currentRecord.effectiveEndDate || '',
                    ];
                }
                form.setFieldsValue(initialValues);
                setIsMultiRate(currentRecord.isMultiRate);
                setItems(currentRecord.items || []);
            } else {
                form.resetFields();
                form.setFieldsValue({ isMultiRate: true }); // 默认开启分时电价
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
    }, [visible, isEdit, currentRecord, form]);

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
                ...currentRecord, // 合并旧数据（编辑时会带上 id）
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
                    options={PeriodTypeOptions.map(opt => ({ label: opt.label, value: opt.value }))}
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
            title={title}
            open={visible}
            onClose={handleCancel}
            width={800}
            destroyOnClose
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
