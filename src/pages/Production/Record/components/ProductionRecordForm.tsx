import React, { useEffect } from 'react';
import {
    ModalForm,
    ProFormText,
    ProFormDigit,
    ProFormDatePicker,
    ProFormSelect,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { message } from 'antd';
import {
    ProductionRecord,
    createProductionRecord,
    updateProductionRecord,
} from '@/apis/productionRecord';
import { getEnabledEnergyUnits } from '@/apis/energyUnit';

interface ProductionRecordFormProps {
    visible: boolean;
    record?: ProductionRecord;
    defaultUnitId?: number | null;
    defaultDataType?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

const ProductionRecordForm: React.FC<ProductionRecordFormProps> = ({
    visible,
    record,
    defaultUnitId,
    defaultDataType,
    onCancel,
    onSuccess,
}) => {
    const isEdit = !!record?.id;

    const handleSubmit = async (values: ProductionRecord) => {
        try {
            if (isEdit && record?.id) {
                await updateProductionRecord(record.id, { ...record, ...values });
                message.success('更新成功');
            } else {
                await createProductionRecord(values);
                message.success('创建成功');
            }
            onSuccess();
            return true;
        } catch (error) {
            message.error(isEdit ? '更新失败' : '创建失败');
            return false;
        }
    };

    const getLabels = () => {
        const type = record?.dataType || defaultDataType || '1';
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
        <ModalForm<ProductionRecord>
            title={isEdit ? `编辑${labels.title}` : `新建${labels.title}`}
            open={visible}
            modalProps={{
                destroyOnHidden: true,
                onCancel,
            }}
            initialValues={record || {
                granularity: 'DAY',
                energyUnitId: defaultUnitId,
                dataType: defaultDataType || '1'
            }}
            onFinish={handleSubmit}
            width={600}
        >
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
                width="md"
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
                fieldProps={{ precision: 4 }}
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
                ]}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
                fieldProps={{ rows: 3 }}
            />
        </ModalForm>
    );
};

export default ProductionRecordForm;
