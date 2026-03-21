import { Gateway } from '@/apis/gateway';
import { getEnabledEnergyUnitTree } from '@/apis/energyUnit';
import { ProModalForm } from "@/components/container";
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { ProFormText, ProFormTextArea, ProFormTreeSelect } from '@ant-design/pro-components';
import React, { useEffect } from 'react';

interface Props { visible: boolean; onCancel: () => void; onSuccess: () => void; }

const GatewayForm: React.FC<Props> = ({ visible, onCancel, onSuccess }) => {
    const { form, handleSaveOrUpdate, getState } = useCrud<Gateway>({
        pathname: '/basic-data/gateway', entityName: '网关', baseUrl: '/api/gateways',
        onOpenChange: (open) => { if (!open) onCancel(); }
    });
    const state = getState('/basic-data/gateway');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({ ...state.editData, energyUnitId: state.editData?.energyUnit?.id });
            } else {
                form.resetFields();
            }
        }
    }, [visible, state.operation, state.editData]);

    return (
        <ProModalForm title={state.operation === OperationEnum.EDIT ? '编辑网关' : '新增网关'}
            open={visible} form={form} grid={true}
            onFinish={async (values) => { await handleSaveOrUpdate(values); onSuccess(); }}
            modalProps={{ onCancel, destroyOnClose: true, width: 600 }}>
            <ProFormText name="id" hidden />
            <ProFormText name="code" label="网关编码" rules={[{ required: true }]} colProps={{ span: 12 }} />
            <ProFormText name="name" label="网关名称" rules={[{ required: true }]} colProps={{ span: 12 }} />
            <ProFormText name="model" label="规格型号" colProps={{ span: 12 }} />
            <ProFormText name="manufacturer" label="生产厂商" colProps={{ span: 12 }} />
            <ProFormText name="ipAddress" label="IP 地址" colProps={{ span: 12 }} />
            <ProFormText name="installLocation" label="安装位置" colProps={{ span: 12 }} />
            <ProFormTreeSelect name="energyUnitId" label="所属用能单元" colProps={{ span: 12 }}
                request={async () => {
                    const res = await getEnabledEnergyUnitTree();
                    return res.data || [];
                }}
                fieldProps={{ fieldNames: { label: 'name', value: 'id', children: 'children' }, allowClear: true }} />
            <ProFormTextArea name="remark" label="备注" colProps={{ span: 24 }} />
        </ProModalForm>
    );
};

export default GatewayForm;
