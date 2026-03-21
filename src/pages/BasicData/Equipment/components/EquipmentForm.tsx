import { Equipment } from '@/apis/equipment';
import { getEnabledEnergyUnitTree } from '@/apis/energyUnit';
import { ProModalForm } from "@/components/container";
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea, ProFormTreeSelect } from '@ant-design/pro-components';
import React, { useEffect } from 'react';

interface Props {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const EquipmentForm: React.FC<Props> = ({ visible, onCancel, onSuccess }) => {
    const { form, handleSaveOrUpdate, getState } = useCrud<Equipment>({
        pathname: '/basic-data/equipment',
        entityName: '用能设备',
        baseUrl: '/api/equipments',
        onOpenChange: (open) => { if (!open) onCancel(); }
    });
    const state = getState('/basic-data/equipment');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({
                    ...state.editData,
                    energyUnitId: state.editData?.energyUnit?.id,
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ status: 0 });
            }
        }
    }, [visible, state.operation, state.editData, form]);

    return (
        <ProModalForm
            title={state.dialogTitle}
            open={visible}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
            form={form}
            onFinish={async (values) => {
                await handleSaveOrUpdate({
                    ...state.editData,
                    ...values,
                });
                onSuccess();
                return true;
            }}
            modalProps={{
                destroyOnHidden: true,
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
            loading={state.loading}
        >
            <ProFormText
                name="id"
                hidden
                colProps={{ span: 0 }}
            />
            <ProFormText
                name="name"
                label="设备名称"
                placeholder="请输入设备名称"
                rules={[{ required: true, message: '请输入设备名称' }]}
            />
            <ProFormText
                name="code"
                label="设备编码"
                placeholder="请输入设备编码"
                rules={[{ required: true, message: '请输入设备编码' }]}
                disabled={state.operation === OperationEnum.EDIT}
            />
            <ProFormText
                name="type"
                label="设备类型"
                placeholder="请输入设备类型"
            />
            <ProFormText
                name="modelNumber"
                label="规格型号"
                placeholder="请输入规格型号"
            />
            <ProFormText
                name="manufacturer"
                label="生产厂商"
                placeholder="请输入生产厂商"
            />
            <ProFormDigit
                name="ratedPower"
                label="额定功率(kW)"
                placeholder="请输入额定功率"
                fieldProps={{ precision: 2 }}
            />
            <ProFormText
                name="location"
                label="安装位置"
                placeholder="请输入安装位置"
            />
            <ProFormTreeSelect
                name="energyUnitId"
                label="用能单元"
                request={async () => {
                    const res = await getEnabledEnergyUnitTree();
                    return res.data || [];
                }}
                fieldProps={{
                    fieldNames: { label: 'name', value: 'id', children: 'children' },
                    allowClear: true,
                    placeholder: '请选择所属用能单元',
                }}
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
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
            />
        </ProModalForm>
    );
};

export default EquipmentForm;
