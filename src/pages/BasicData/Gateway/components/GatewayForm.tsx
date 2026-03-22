import { Gateway } from '@/apis/gateway';
import { getEnabledEnergyUnitTree } from '@/apis/energyUnit';
import { ProModalForm } from "@/components/container";
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { ProFormSelect, ProFormText, ProFormTextArea, ProFormTreeSelect } from '@ant-design/pro-components';
import React, { useEffect } from 'react';

interface Props {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const GatewayForm: React.FC<Props> = ({ visible, onCancel, onSuccess }) => {
    const { form, handleSaveOrUpdate, getState } = useCrud<Gateway>({
        pathname: '/basic-data/gateway',
        entityName: '网关',
        baseUrl: '/api/gateways',
        onOpenChange: (open) => { if (!open) onCancel(); }
    });
    const state = getState('/basic-data/gateway');

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
            onOpenChange={(open) => { if (!open) onCancel(); }}
            form={form}
            onFinish={async (values) => {
                await handleSaveOrUpdate({ ...state.editData, ...values });
                onSuccess();
                return true;
            }}
            modalProps={{ destroyOnHidden: true, maskClosable: false, width: 900 }}
            grid={true}
            rowProps={{ gutter: 0 }}
            labelCol={{ span: 6 }}
            loading={state.loading}
        >
            <ProFormText name="id" hidden={true} />
            <ProFormText
                label="网关名称"
                name="name"
                placeholder="请输入网关名称"
                colProps={{ span: 12 }}
                rules={[{ required: true, message: '请输入网关名称' }]}
            />
            <ProFormText
                label="网关编码"
                name="code"
                placeholder="请输入网关编码"
                colProps={{ span: 12 }}
                rules={[{ required: true, message: '请输入网关编码' }]}
                disabled={state.operation === OperationEnum.EDIT}
            />
            <ProFormText
                label="规格型号"
                name="model"
                placeholder="请输入规格型号"
                colProps={{ span: 12 }}
            />
            <ProFormText
                label="生产厂商"
                name="manufacturer"
                placeholder="请输入生产厂商"
                colProps={{ span: 12 }}
            />
            <ProFormText
                label="IP 地址"
                name="ipAddress"
                placeholder="请输入IP地址"
                colProps={{ span: 12 }}
            />
            <ProFormText
                label="安装位置"
                name="installLocation"
                placeholder="请输入安装位置"
                colProps={{ span: 12 }}
            />
            <ProFormTreeSelect
                label="用能单元"
                name="energyUnitId"
                colProps={{ span: 12 }}
                request={async () => {
                    const res = await getEnabledEnergyUnitTree();
                    return res.data || [];
                }}
                fieldProps={{
                    fieldNames: { label: 'name', value: 'id', children: 'children' },
                    allowClear: true,
                    placeholder: '请选择',
                }}
            />
            <ProFormSelect
                label="状态"
                name="status"
                colProps={{ span: 12 }}
                options={[
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ]}
                rules={[{ required: true }]}
            />
            <ProFormTextArea
                label="备注"
                name="remark"
                placeholder="请输入备注"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
            />
        </ProModalForm>
    );
};

export default GatewayForm;
