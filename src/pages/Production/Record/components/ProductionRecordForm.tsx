import { getEnabledEnergyUnits } from '@/apis/energyUnit';
import { ProductionRecord } from '@/apis/productionRecord';
import { ProModalForm } from '@/components/container';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import {
  ProFormDatePicker,
  ProFormDateTimePicker, ProFormDependency, ProFormDigit, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea
} from '@ant-design/pro-components';
import dayjs from 'dayjs';
import React, { useEffect } from 'react';

interface ProductionRecordFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

const ProductionRecordForm: React.FC<ProductionRecordFormProps> = ({
    open,
    onOpenChange,
    onSuccess,
}) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<ProductionRecord>({
        pathname: '/production/record',
        entityName: '产量记录',
        baseUrl: '/api/ems/production-records',
        onOpenChange
    });

    const state = getState('/production/record');

    useEffect(() => {
        if (open) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({ ...state.editData });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    granularity: 'DAY',
                    ...state.editData
                });
            }
        }
    }, [open, state.operation, state.editData, form]);

    const getLabels = () => {
        const type = state.editData?.dataType || '1';
        switch (type) {
            case '2':
                return { title: '仪表数据', name: '仪表名称', value: '读数' };
            case '3':
                return { title: '能耗指标', name: '指标名称', value: '指标值' };
            default:
                return { title: '产量记录', name: '产品名称', value: '产量' };
        }
    };


    return (
        <ProModalForm
            title={state.dialogTitle || (state.operation === OperationEnum.EDIT ? '编辑记录' : '新建记录')}
            open={open}
            onOpenChange={onOpenChange}
            form={form}
            onFinish={async (values) => {
                const submitData = {
                    ...state.editData,
                    ...values,
                    recordDate: values.recordDate ? dayjs(values.recordDate).format('YYYY-MM-DD HH:mm:ss') : undefined
                };
                await handleSaveOrUpdate(submitData);
                onSuccess();
                return true;
            }}
            width={600}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
            }}
            loading={state.loading}
        >
            <ProFormText name="id" hidden />

            <ProFormSelect
                name="energyUnitId"
                label="用能单元"
                rules={[{ required: true, message: '请选择用能单元' }]}
                request={async () => {
                    const res = await getEnabledEnergyUnits();
                    return (res.data || []).map((item: any) => ({
                        label: item.name,
                        value: item.id,
                    }));
                }}
            />

            <ProFormRadio.Group
                name="dataType"
                label="数据类型"
                initialValue="1"
                options={[
                    { label: '产品产量', value: '1' },
                    { label: '仪表数据', value: '2' },
                    { label: '能耗指标', value: '3' },
                ]}
                rules={[{ required: true }]}
            />

            <ProFormSelect
                name="granularity"
                label="时间粒度"
                initialValue="DAY"
                rules={[{ required: true, message: '请选择时间粒度' }]}
                options={[
                    { label: '小时', value: 'HOUR' },
                    { label: '日', value: 'DAY' },
                    { label: '月', value: 'MONTH' },
                    { label: '年', value: 'YEAR' },
                    // { label: '自定义', value: 'CUSTOM' }, // 暂时隐藏自定义，因为 Picker 不好处理
                ]}
            />

            <ProFormDependency name={['granularity']}>
                {({ granularity }) => {
                    // 小时粒度使用 DateTimePicker
                    if (granularity === 'HOUR') {
                        return (
                            <ProFormDateTimePicker
                                name="recordDate"
                                label="记录时间"
                                rules={[{ required: true, message: '请选择记录时间' }]}
                                fieldProps={{
                                    style: { width: '100%' },
                                    format: 'YYYY-MM-DD HH:00',
                                    showTime: {
                                        format: 'HH',
                                        hideDisabledOptions: true,
                                    },
                                }}
                            />
                        );
                    }

                    // 其他粒度使用 DatePicker
                    let picker: 'date' | 'month' | 'year' = 'date';
                    let format = 'YYYY-MM-DD';

                    if (granularity === 'MONTH') {
                        picker = 'month';
                        format = 'YYYY-MM';
                    } else if (granularity === 'YEAR') {
                        picker = 'year';
                        format = 'YYYY';
                    }

                    return (
                        <ProFormDatePicker
                            name="recordDate"
                            label="记录时间"
                            rules={[{ required: true, message: '请选择记录时间' }]}
                            fieldProps={{
                                style: { width: '100%' },
                                picker: picker,
                                format: format,
                            }}
                        />
                    );
                }}
            </ProFormDependency>

            <ProFormDependency name={['dataType']}>
                {({ dataType }) => {
                    const type = dataType || '1';
                    let nameLabel = '产品名称';
                    let valueLabel = '产量';
                    let namePlaceholder = '请输入产品名称';

                    if (type === '2') {
                        nameLabel = '仪表名称';
                        valueLabel = '读数';
                        namePlaceholder = '请输入仪表名称';
                    } else if (type === '3') {
                        nameLabel = '指标名称';
                        valueLabel = '指标值';
                        namePlaceholder = '请输入指标名称';
                    }

                    return (
                        <>
                            <ProFormText
                                name="productName"
                                label={nameLabel}
                                rules={[{ required: true, message: namePlaceholder }]}
                                placeholder={namePlaceholder}
                            />
                            <ProFormDigit
                                name="quantity"
                                label={valueLabel}
                                rules={[{ required: true, message: `请输入${valueLabel}` }]}
                                min={0}
                                fieldProps={{
                                    precision: 4,
                                    style: { width: '100%' },
                                }}
                            />
                        </>
                    );
                }}
            </ProFormDependency>

            <ProFormText
                name="productType"
                label="类型分类"
                tooltip="可用于标记该记录的细分类型，如：半成品、成品、一号泵、二号泵等"
                placeholder="如：半成品、成品或自定义分类"
            />

            <ProFormText
                name="unit"
                label="计量单位"
                placeholder="如：吨、件、立方米等"
            />

            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
                fieldProps={{ rows: 3 }}
            />
        </ProModalForm>
    );
};

export default ProductionRecordForm;
