import { AlarmConfig, AlarmLimitType, getAllAlarmLimitTypes } from '@/apis/alarm';
import { MeterPoint } from '@/apis/meterPoint';
import { ProModalForm } from '@/components/container';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { ProFormDigit, ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';

interface AlarmConfigFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
    point: MeterPoint | null;
}

const AlarmConfigForm: React.FC<AlarmConfigFormProps> = ({
    visible,
    onVisibleChange,
    onSuccess,
    point,
}) => {
    const [limitTypes, setLimitTypes] = useState<AlarmLimitType[]>([]);

    const {
        form,
        getState,
        handleSaveOrUpdate
    } = useCrud<AlarmConfig>({
        pathname: '/basic-data/alarm-config',
        entityName: '报警配置',
        baseUrl: '/api/alarm/configs',
        onOpenChange: onVisibleChange
    });

    const state = getState('/basic-data/alarm-config');

    useEffect(() => {
        if (visible) {
            getAllAlarmLimitTypes().then((res) => {
                if (res.success && res.data) {
                    setLimitTypes(res.data);
                }
            });
        }
    }, [visible]);

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({
                    ...state.editData,
                    limitTypeId: state.editData?.alarmLimitType?.id,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ isEnabled: true });
            }
        }
    }, [visible, state.operation, state.editData, form]);

    return (
        <ProModalForm
            title={state?.dialogTitle}
            open={visible}
            onOpenChange={onVisibleChange}
            form={form}
            onFinish={async (values) => {
                if (!point) return false;
                const submitData = {
                    ...state.editData,
                    ...values,
                    meterPoint: { id: point.id },
                    alarmLimitType: { id: values.limitTypeId },
                };
                delete (submitData as any).limitTypeId;

                await handleSaveOrUpdate(submitData);
                onSuccess();
                return true;
            }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
                width: 500,
            }}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            loading={state.loading}
        >
            <ProFormText
                name="id"
                hidden
            />
            <ProFormSelect
                name="limitTypeId"
                label="限值类型"
                options={limitTypes.map((item) => ({
                    label: (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: item.colorNumber }} />
                            {item.limitName} ({item.alarmType === 'ALARM' ? '报警' : '预警'})
                        </div>
                    ),
                    value: item.id,
                }))}
                rules={[{ required: true, message: '请选择限值类型' }]}
                placeholder="请选择"
            />
            <ProFormDigit
                name="limitValue"
                label="报警设定值"
                placeholder="请输入设定值"
                rules={[{ required: true, message: '请输入设定值' }]}
                fieldProps={{
                    style: { width: '100%' }
                }}
            />
            <ProFormSwitch
                name="isEnabled"
                label="是否启用"
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
            />
        </ProModalForm>
    );
};

export default AlarmConfigForm;
