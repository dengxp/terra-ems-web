import React, { useEffect } from 'react';
import {
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    ProFormDigit,
} from '@ant-design/pro-components';
import { ProModalForm } from '@/components/container';
import {
    Benchmark,
    benchmarkTypeOptions,
} from '@/apis/benchmark';
import useCrud from '@/hooks/common/useCrud';
import { OperationEnum } from '@/enums';

interface BenchmarkFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const BenchmarkForm: React.FC<BenchmarkFormProps> = ({ visible, onVisibleChange, onSuccess }) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<Benchmark>({
        pathname: '/energy-saving/benchmark',
        entityName: '对标值',
        baseUrl: '/api/ems/benchmarks',
        onOpenChange: onVisibleChange
    });

    const state = getState('/energy-saving/benchmark');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue(state.editData);
            } else {
                form.resetFields();
                form.setFieldsValue({ type: 'NATIONAL', status: 0 });
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
                await handleSaveOrUpdate(values);
                onSuccess();
                return true;
            }}
            layout="horizontal"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
            }}
            width={560}
            loading={state.loading}
        >
            <ProFormText name="id" hidden />
            <ProFormText
                name="code"
                label="标杆编码"
                placeholder="请输入标杆编码"
                disabled={state.operation === OperationEnum.EDIT}
                rules={[{ required: true, message: '请输入标杆编码' }]}
            />
            <ProFormText
                name="name"
                label="标杆名称"
                placeholder="请输入标杆名称"
                rules={[{ required: true, message: '请输入标杆名称' }]}
            />
            <ProFormSelect
                name="type"
                label="标杆类型"
                options={benchmarkTypeOptions}
                rules={[{ required: true, message: '请选择标杆类型' }]}
            />
            <ProFormText
                name="grade"
                label="标杆等级"
                placeholder="如：先进值、准入值、1级"
            />
            <ProFormDigit
                name="value"
                label="标杆值"
                placeholder="请输入标杆值"
                fieldProps={{
                    precision: 4,
                }}
            />
            <ProFormText
                name="unit"
                label="单位"
                placeholder="如：kWh/t、%"
            />
            <ProFormText
                name="nationalNum"
                label="国标编号"
                placeholder="如：GB 16780-2021"
            />
            <ProFormSelect
                name="status"
                label="状态"
                options={[
                    { label: '启用', value: 0 },
                    { label: '禁用', value: 1 },
                ]}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="备注信息"
                fieldProps={{ rows: 2 }}
            />
        </ProModalForm>
    );
};

export default BenchmarkForm;
