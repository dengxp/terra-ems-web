import React, { useEffect, useState } from 'react';
import {
    ProFormText,
    ProFormDigit,
    ProFormRadio,
    ProFormTextArea,
    ProFormSelect,
} from '@ant-design/pro-components';
import { ProModalForm } from '@/components/container';
import { message } from 'antd';
import { MeterPoint, createMeterPoint, updateMeterPoint } from '@/apis/meterPoint';
import { getEnabledEnergyTypes } from '@/apis/energyType';
import { getMeters, Meter } from '@/apis/meter';

interface MeterPointFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
    currentRecord?: MeterPoint;
}

const pointTypeOptions = [
    { label: '采集类', value: 'COLLECT' },
    { label: '计算类', value: 'CALC' },
];

const categoryOptions = [
    { label: '能源类', value: 'ENERGY' },
    { label: '产品类', value: 'PRODUCT' },
    { label: '能效类', value: 'EFFICIENCY' },
    { label: '经营类', value: 'OPERATION' },
    { label: '其他', value: 'OTHER' },
];

const MeterPointForm: React.FC<MeterPointFormProps> = ({
    visible,
    onVisibleChange,
    onSuccess,
    currentRecord,
}) => {
    const isEdit = !!currentRecord;
    const title = isEdit ? '编辑采集点位' : '新增采集点位';
    const [meterOptions, setMeterOptions] = useState<{ label: string; value: number }[]>([]);
    const [energyTypeOptions, setEnergyTypeOptions] = useState<{ label: string; value: number }[]>([]);

    useEffect(() => {
        // 加载计量器具选项
        getMeters({ page: 0, size: 1000 }).then((res) => {
            if (res.success && res.data?.content) {
                setMeterOptions(
                    res.data.content.map((item: Meter) => ({
                        label: `${item.name} (${item.code})`,
                        value: item.id,
                    }))
                );
            }
        });

        // 加载能源类型选项
        getEnabledEnergyTypes().then((res) => {
            if (res.success && res.data) {
                setEnergyTypeOptions(
                    res.data.map((item) => ({
                        label: item.name,
                        value: item.id,
                    }))
                );
            }
        });
    }, []);

    return (
        <ProModalForm
            title={title}
            open={visible}
            onOpenChange={onVisibleChange}
            grid={true}
            rowProps={{ gutter: 0 }}
            labelCol={{ span: 6 }}
            initialValues={
                isEdit && currentRecord
                    ? {
                        ...currentRecord,
                        meterId: currentRecord.meter?.id,
                        energyTypeId: currentRecord.energyType?.id,
                    }
                    : { status: 0, sortOrder: 0, pointType: 'COLLECT', category: 'ENERGY' }
            }
            onFinish={async (values) => {
                try {
                    const { meterId, energyTypeId, ...data } = values;
                    if (isEdit && currentRecord) {
                        await updateMeterPoint(currentRecord.id, data, meterId, energyTypeId);
                        message.success('更新成功');
                    } else {
                        await createMeterPoint(data, meterId, energyTypeId);
                        message.success('创建成功');
                    }
                    onSuccess();
                    return true;
                } catch (error) {
                    message.error('操作失败');
                    return false;
                }
            }}
            modalProps={{
                destroyOnClose: true,
                width: 800,
            }}
        >
            <ProFormText
                name="code"
                label="点位编码"
                colProps={{ span: 12 }}
                placeholder="请输入点位编码"
                rules={[
                    { required: true, message: '请输入点位编码' },
                    { max: 50, message: '编码最多50个字符' },
                ]}
            />
            <ProFormText
                name="name"
                label="点位名称"
                colProps={{ span: 12 }}
                placeholder="请输入点位名称"
                rules={[
                    { required: true, message: '请输入点位名称' },
                    { max: 100, message: '名称最多100个字符' },
                ]}
            />
            <ProFormRadio.Group
                name="pointType"
                label="点位类型"
                colProps={{ span: 12 }}
                options={pointTypeOptions}
                rules={[{ required: true, message: '请选择点位类型' }]}
            />
            <ProFormSelect
                name="category"
                label="分类"
                colProps={{ span: 12 }}
                options={categoryOptions}
            />
            <ProFormSelect
                name="meterId"
                label="计量器具"
                colProps={{ span: 12 }}
                options={meterOptions}
                placeholder="请选择计量器具"
                showSearch
                fieldProps={{
                    filterOption: (input, option) =>
                        ((option?.label as string) ?? '').toLowerCase().includes(input.toLowerCase()),
                }}
            />
            <ProFormSelect
                name="energyTypeId"
                label="能源类型"
                colProps={{ span: 12 }}
                options={energyTypeOptions}
                placeholder="请选择能源类型"
            />
            <ProFormText
                name="unit"
                label="计量单位"
                colProps={{ span: 12 }}
                placeholder="如：kWh, m³"
            />
            <ProFormDigit
                name="initialValue"
                label="初始表底值"
                colProps={{ span: 12 }}
                placeholder="请输入初始表底值"
                fieldProps={{ precision: 4, style: { width: '100%' } }}
            />
            <ProFormDigit
                name="minValue"
                label="最小值限制"
                colProps={{ span: 12 }}
                placeholder="请输入最小值"
                fieldProps={{ precision: 4, style: { width: '100%' } }}
            />
            <ProFormDigit
                name="maxValue"
                label="最大值限制"
                colProps={{ span: 12 }}
                placeholder="请输入最大值"
                fieldProps={{ precision: 4, style: { width: '100%' } }}
            />
            <ProFormDigit
                name="sortOrder"
                label="排序"
                colProps={{ span: 12 }}
                placeholder="请输入排序号"
                min={0}
                fieldProps={{ precision: 0, style: { width: '100%' } }}
            />
            <ProFormRadio.Group
                name="status"
                label="状态"
                colProps={{ span: 12 }}
                options={[
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ]}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                fieldProps={{ rows: 2 }}
            />
        </ProModalForm>
    );
};

export default MeterPointForm;
