import React, { useEffect, useState } from 'react';
import { ModalForm, ProFormText, ProFormSelect, ProFormDatePicker, ProFormDigit, ProFormTextArea } from '@ant-design/pro-components';
import { message } from 'antd';
import { Meter, createMeter, updateMeter } from '@/apis/meter';
import { EnergyType, getEnabledEnergyTypes } from '@/apis/energyType';

interface MeterFormProps {
    visible: boolean;
    record?: Meter;
    onCancel: () => void;
    onSuccess: () => void;
}

/**
 * 计量器具表单弹窗
 */
const MeterForm: React.FC<MeterFormProps> = ({ visible, record, onCancel, onSuccess }) => {
    const [energyTypes, setEnergyTypes] = useState<EnergyType[]>([]);
    const [loading, setLoading] = useState(false);

    // 获取启用的能源类型
    useEffect(() => {
        if (visible) {
            getEnabledEnergyTypes().then((res) => {
                if (res.success) {
                    setEnergyTypes(res.data || []);
                }
            });
        }
    }, [visible]);

    const isEdit = !!record;

    return (
        <ModalForm
            title={isEdit ? '编辑计量器具' : '新建计量器具'}
            open={visible}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
            initialValues={record ? {
                ...record,
                energyTypeId: record.energyType?.id
            } : {
                status: 0,
                checkCycle: 365,
                reminderCycle: 30
            }}
            onFinish={async (values) => {
                setLoading(true);
                try {
                    // 构造传给后端的对象，后端实体要求 EnergyType 对象
                    const submitData = {
                        ...values,
                        energyType: { id: values.energyTypeId }
                    };
                    delete submitData.energyTypeId;

                    if (isEdit) {
                        await updateMeter(record.id, submitData);
                        message.success('更新成功');
                    } else {
                        await createMeter(submitData);
                        message.success('创建成功');
                    }
                    onSuccess();
                    return true;
                } catch (error: any) {
                    message.error(error.message || (isEdit ? '更新失败' : '创建失败'));
                    return false;
                } finally {
                    setLoading(false);
                }
            }}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                width: 800,
            }}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            grid={true}
            colProps={{ span: 12 }}
            rowProps={{
                gutter: [16, 0]
            }}
            submitter={{
                submitButtonProps: {
                    loading
                }
            }}
        >
            <ProFormText
                name="code"
                label="器具编码"
                placeholder="请输入器具编码"
                rules={[{ required: true, message: '请输入器具编码' }]}
                disabled={isEdit}
            />
            <ProFormText
                name="name"
                label="器具名称"
                placeholder="请输入器具名称"
                rules={[{ required: true, message: '请输入器具名称' }]}
            />
            <ProFormSelect
                name="energyTypeId"
                label="能源类型"
                placeholder="请选择能源类型"
                rules={[{ required: true, message: '请选择能源类型' }]}
                options={energyTypes.map(item => ({
                    label: item.name,
                    value: item.id
                }))}
            />
            <ProFormSelect
                name="type"
                label="器具类型"
                placeholder="请选择器具类型"
                rules={[{ required: true, message: '请选择器具类型' }]}
                options={[
                    { label: '电表', value: 'ELECTRIC_METER' },
                    { label: '水表', value: 'WATER_METER' },
                    { label: '气表', value: 'GAS_METER' },
                    { label: '热量表', value: 'HEAT_METER' },
                ]}
            />
            <ProFormText
                name="modelNumber"
                label="规格型号"
                placeholder="请输入规格型号"
            />
            <ProFormText
                name="measureRange"
                label="测量范围"
                placeholder="请输入测量范围"
            />
            <ProFormText
                name="manufacturer"
                label="生产厂商"
                placeholder="请输入生产厂商"
            />
            <ProFormText
                name="personCharge"
                label="负责人"
                placeholder="请输入负责人"
            />
            <ProFormText
                name="location"
                label="安装位置"
                placeholder="请输入安装位置"
            />
            <ProFormDatePicker
                name="startTime"
                label="起始时间"
            />
            <ProFormDatePicker
                name="putrunTime"
                label="投运时间"
            />
            <ProFormDigit
                name="checkCycle"
                label="检定周期(天)"
                placeholder="请输入检定周期"
            />
            <ProFormDigit
                name="reminderCycle"
                label="提醒周期(天)"
                placeholder="请输入提醒周期"
            />
            <ProFormSelect
                name="status"
                label="状态"
                options={[
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ]}
                rules={[{ required: true }]}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
                colProps={{ span: 24 }}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
            />
        </ModalForm>
    );
};

export default MeterForm;
