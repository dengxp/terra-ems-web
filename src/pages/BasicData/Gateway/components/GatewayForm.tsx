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
            labelCol={{ span: 7 }}
            wrapperCol={{ span: 17 }}
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
                label="网关名称"
                placeholder="请输入网关名称"
                rules={[{ required: true, message: '请输入网关名称' }]}
            />
            <ProFormText
                name="code"
                label="网关编码"
                placeholder="请输入网关编码"
                rules={[{ required: true, message: '请输入网关编码' }]}
                disabled={state.operation === OperationEnum.EDIT}
            />
            <ProFormText
                name="model"
                label="规格型号"
                placeholder="请输入规格型号"
            />
            <ProFormText
                name="manufacturer"
                label="生产厂商"
                placeholder="请输入生产厂商"
            />
            <ProFormText
                name="ipAddress"
                label="IP 地址"
                placeholder="请输入IP地址"
            />
            <ProFormText
                name="installLocation"
                label="安装位置"
                placeholder="请输入安装位置"
            />
            <ProFormTreeSelect
                name="energyUnitId"
                label="所属用能单元"
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
                colProps={{ span: 24 }}
                labelCol={{ style: { width: 'calc(7 / 24 * 50% + 8px)' } }}
                wrapperCol={{ style: { flex: 1 } }}
            />
        </ProModalForm>
    );
};

export default GatewayForm;
