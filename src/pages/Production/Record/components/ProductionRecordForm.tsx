import React, { useEffect } from 'react';
import {
    ProFormText,
    ProFormDigit,
    ProFormDatePicker,
    ProFormSelect,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { ProModalForm } from '@/components/container';
import { ProductionRecord } from '@/apis/productionRecord';
import { getEnabledEnergyUnits } from '@/apis/energyUnit';
import useCrud from '@/hooks/common/useCrud';
import { OperationEnum } from '@/enums';
import dayjs from 'dayjs';

interface ProductionRecordFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const ProductionRecordForm: React.FC<ProductionRecordFormProps> = ({
    visible,
    onCancel,
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
        onOpenChange: (open) => !open && onCancel()
    });

    const state = getState('/production/record');

    useEffect(() => {
        if (visible) {
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
    }, [visible, state.operation, state.editData, form]);

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

    const labels = getLabels();

    return (
        <ProModalForm
            title={state.dialogTitle || (state.operation === OperationEnum.EDIT ? `编辑${labels.title}` : `新建${labels.title}`)}
            open={visible}
            onOpenChange={(open) => !open && onCancel()}
            form={form}
            onFinish={async (values) => {
                const submitData = {
                    ...state.editData,
                    ...values,
                    recordDate: values.recordDate ? dayjs(values.recordDate).format('YYYY-MM-DD') : undefined
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
            <ProFormText name="dataType" hidden />
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
            <ProFormDatePicker
                name="recordDate"
                label="记录日期"
                rules={[{ required: true, message: '请选择记录日期' }]}
                fieldProps={{
                    style: { width: '100%' }
                }}
            />
            <ProFormText
                name="productName"
                label={labels.name}
                rules={[{ required: true, message: `请输入${labels.name}` }]}
                placeholder={`请输入${labels.name}`}
            />
            <ProFormText
                name="productType"
                label="类型分类"
                placeholder="如：半成品、成品或自定义分类"
            />
            <ProFormDigit
                name="quantity"
                label={labels.value}
                rules={[{ required: true, message: `请输入${labels.value}` }]}
                min={0}
                fieldProps={{ precision: 4, style: { width: '100%' } }}
            />
            <ProFormText
                name="unit"
                label="计量单位"
                placeholder="如：吨、件、立方米等"
            />
            <ProFormSelect
                name="granularity"
                label="时间粒度"
                rules={[{ required: true, message: '请选择时间粒度' }]}
                options={[
                    { label: '小时', value: 'HOUR' },
                    { label: '日', value: 'DAY' },
                    { label: '月', value: 'MONTH' },
                    { label: '年', value: 'YEAR' },
                    { label: '自定义', value: 'CUSTOM' },
                ]}
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
