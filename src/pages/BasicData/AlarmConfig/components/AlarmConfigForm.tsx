import React, { useEffect, useState } from 'react';
import { ModalForm, ProFormSelect, ProFormDigit, ProFormSwitch, ProFormTextArea } from '@ant-design/pro-components';
import { Form, message } from 'antd';
import { AlarmConfig, AlarmLimitType, getAllAlarmLimitTypes, saveOrUpdateAlarmConfig } from '@/apis/alarm';
import { MeterPoint } from '@/apis/meterPoint';

interface AlarmConfigFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
    isEdit: boolean;
    currentRecord?: AlarmConfig;
    point: MeterPoint | null;
}

const AlarmConfigForm: React.FC<AlarmConfigFormProps> = (props) => {
    const { visible, onVisibleChange, onSuccess, isEdit, currentRecord, point } = props;
    const [form] = Form.useForm();
    const [limitTypes, setLimitTypes] = useState<AlarmLimitType[]>([]);

    useEffect(() => {
        if (visible) {
            getAllAlarmLimitTypes().then((res) => {
                if (res.success) setLimitTypes(res.data || []);
            });

            if (isEdit && currentRecord) {
                form.setFieldsValue({
                    ...currentRecord,
                    limitTypeId: currentRecord.alarmLimitType?.id,
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, isEdit, currentRecord, form]);

    const handleSubmit = async (values: any) => {
        if (!point) return false;

        const data: Partial<AlarmConfig> = {
            ...currentRecord,
            ...values,
            id: isEdit ? currentRecord?.id : undefined,
            meterPoint: { id: point.id } as any,
            alarmLimitType: { id: values.limitTypeId } as any,
        };

        try {
            const res = await saveOrUpdateAlarmConfig(data);
            if (res.success) {
                message.success(isEdit ? '更新成功' : '创建成功');
                onSuccess();
                return true;
            }
            message.error(res.message || '操作失败');
            return false;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    return (
        <ModalForm
            title={isEdit ? '编辑报警配置' : '添加报警配置'}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={handleSubmit}
            autoFocusFirstInput
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
                width: 480,
            }}
        >
            <ProFormSelect
                name="limitTypeId"
                label="报警限值类型"
                options={limitTypes.map((item) => ({
                    label: (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.colorNumber }} />
                            {item.limitName} ({item.alarmType === 'ALARM' ? '报警' : '预警'})
                        </span>
                    ),
                    value: item.id,
                }))}
                rules={[{ required: true, message: '请选择报警限值类型' }]}
                placeholder="请选择"
            />
            <ProFormDigit
                name="limitValue"
                label="报警设定值"
                placeholder="请输入"
                rules={[{ required: true, message: '请输入设定值' }]}
                fieldProps={{
                    style: { width: '100%' }
                }}
            />
            <ProFormSwitch
                name="isEnabled"
                label="是否启用"
                initialValue={true}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
            />
        </ModalForm>
    );
};

export default AlarmConfigForm;
