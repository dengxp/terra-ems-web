import { DataSource } from '@/apis/dataSource';
import { getAllGateways, Gateway } from '@/apis/gateway';
import { ProModalForm } from "@/components/container";
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';

interface Props { visible: boolean; onCancel: () => void; onSuccess: () => void; }

const DataSourceForm: React.FC<Props> = ({ visible, onCancel, onSuccess }) => {
    const [gateways, setGateways] = useState<Gateway[]>([]);

    const { form, handleSaveOrUpdate, getState } = useCrud<DataSource>({
        pathname: '/basic-data/data-source', entityName: '数据源', baseUrl: '/api/data-sources',
        onOpenChange: (open) => { if (!open) onCancel(); }
    });
    const state = getState('/basic-data/data-source');

    useEffect(() => {
        if (visible) {
            getAllGateways().then((res) => { if (res.success) setGateways(res.data || []); });
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({ ...state.editData, gatewayId: state.editData?.gateway?.id });
            } else {
                form.resetFields();
                form.setFieldsValue({ pollIntervalSecs: 15 });
            }
        }
    }, [visible, state.operation, state.editData]);

    return (
        <ProModalForm title={state.operation === OperationEnum.EDIT ? '编辑数据源' : '新增数据源'}
            open={visible} form={form} grid={true}
            onFinish={async (values) => { await handleSaveOrUpdate(values); onSuccess(); }}
            modalProps={{ onCancel, destroyOnClose: true, width: 600 }}>
            <ProFormText name="id" hidden />
            <ProFormText name="name" label="数据源名称" rules={[{ required: true }]} colProps={{ span: 12 }} />
            <ProFormSelect name="gatewayId" label="所属网关" rules={[{ required: true }]} colProps={{ span: 12 }}
                options={gateways.map(g => ({ label: `${g.name} (${g.code})`, value: g.id }))} />
            <ProFormSelect name="protocol" label="采集协议" rules={[{ required: true }]} colProps={{ span: 12 }}
                options={[
                    { label: 'Modbus TCP', value: 'modbus-tcp' },
                    { label: 'Modbus RTU', value: 'modbus-rtu' },
                    { label: 'MQTT', value: 'mqtt' },
                    { label: 'OPC UA', value: 'opc-ua' },
                    { label: 'DL/T645', value: 'dlt645' },
                    { label: 'BACnet/IP', value: 'bacnet-ip' },
                    { label: 'HTTP', value: 'http' },
                ]} />
            <ProFormDigit name="pollIntervalSecs" label="采集周期(秒)" colProps={{ span: 12 }} min={1} />
            <ProFormTextArea name="connection" label="连接参数 (JSON)" colProps={{ span: 24 }}
                placeholder='如: {"port": 502, "baudRate": 9600}'
                fieldProps={{ rows: 3 }} />
            <ProFormTextArea name="remark" label="备注" colProps={{ span: 24 }} />
        </ProModalForm>
    );
};

export default DataSourceForm;
