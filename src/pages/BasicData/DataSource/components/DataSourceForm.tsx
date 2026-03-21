import { DataSource } from '@/apis/dataSource';
import { getAllGateways, Gateway } from '@/apis/gateway';
import { ProModalForm } from "@/components/container";
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import { Form, Input } from 'antd';
import React, { useEffect, useState } from 'react';

interface Props { visible: boolean; onCancel: () => void; onSuccess: () => void; }

const PROTOCOL_OPTIONS = [
    { label: 'Modbus TCP', value: 'modbus-tcp' },
    { label: 'Modbus RTU', value: 'modbus-rtu' },
    { label: 'MQTT', value: 'mqtt' },
    { label: 'OPC UA', value: 'opc-ua' },
    { label: 'DL/T645', value: 'dlt645' },
    { label: 'BACnet/IP', value: 'bacnet-ip' },
    { label: 'HTTP', value: 'http' },
];

const DataSourceForm: React.FC<Props> = ({ visible, onCancel, onSuccess }) => {
    const [gateways, setGateways] = useState<Gateway[]>([]);
    const [protocol, setProtocol] = useState<string>('');

    const { form, handleSaveOrUpdate, getState } = useCrud<DataSource>({
        pathname: '/basic-data/data-source', entityName: '数据源', baseUrl: '/api/data-sources',
        onOpenChange: (open) => { if (!open) onCancel(); }
    });
    const state = getState('/basic-data/data-source');

    useEffect(() => {
        if (visible) {
            getAllGateways().then((res) => { if (res.success) setGateways(res.data || []); });
            if (state.operation === OperationEnum.EDIT && state.editData) {
                const editData = state.editData as any;
                // 解析 connection JSON 为各个字段
                let connObj: any = {};
                try {
                    if (editData.connection) {
                        connObj = typeof editData.connection === 'string' ? JSON.parse(editData.connection) : editData.connection;
                    }
                } catch (e) { /* ignore */ }

                form.setFieldsValue({
                    ...editData,
                    gatewayId: editData.gateway?.id,
                    conn_port: connObj.port,
                    conn_baudRate: connObj.baudRate,
                    conn_dataBits: connObj.dataBits,
                    conn_stopBits: connObj.stopBits,
                    conn_parity: connObj.parity,
                });
                setProtocol(editData.protocol || '');
            } else {
                form.resetFields();
                form.setFieldsValue({ pollIntervalSecs: 15, status: 0 });
                setProtocol('');
            }
        }
    }, [visible, state.operation, state.editData]);

    // 根据协议组装 connection JSON
    const buildConnection = (values: any): string | undefined => {
        const proto = values.protocol;
        const conn: any = {};

        if (proto === 'modbus-tcp') {
            if (values.conn_port) conn.port = values.conn_port;
        } else if (proto === 'modbus-rtu') {
            if (values.conn_baudRate) conn.baudRate = values.conn_baudRate;
            if (values.conn_dataBits) conn.dataBits = values.conn_dataBits;
            if (values.conn_stopBits) conn.stopBits = values.conn_stopBits;
            if (values.conn_parity) conn.parity = values.conn_parity;
        } else if (proto === 'mqtt') {
            if (values.conn_port) conn.port = values.conn_port;
        }

        return Object.keys(conn).length > 0 ? JSON.stringify(conn) : undefined;
    };

    return (
        <ProModalForm
            title={state.operation === OperationEnum.EDIT ? '编辑数据源' : '新增数据源'}
            open={visible}
            onOpenChange={(open) => { if (!open) onCancel(); }}
            form={form}
            onFinish={async (values) => {
                const submitData = {
                    ...values,
                    connection: buildConnection(values),
                };
                // 清理临时字段
                Object.keys(submitData).filter(k => k.startsWith('conn_')).forEach(k => delete submitData[k]);
                await handleSaveOrUpdate(submitData);
                onSuccess();
                return true;
            }}
            modalProps={{ destroyOnHidden: true, maskClosable: false, width: 800 }}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
            grid={true}
            colProps={{ span: 12 }}
            rowProps={{ gutter: [16, 0] }}
            loading={state.loading}
        >
            <ProFormText name="id" hidden />
            <ProFormText name="name" label="数据源名称" placeholder="请输入数据源名称" rules={[{ required: true, message: '请输入名称' }]} />
            <ProFormSelect name="gatewayId" label="所属网关" placeholder="请选择所属网关" rules={[{ required: true, message: '请选择网关' }]}
                options={gateways.map(g => ({ label: `${g.name} (${g.code})`, value: g.id }))} />
            <ProFormSelect name="protocol" label="采集协议" placeholder="请选择协议" rules={[{ required: true, message: '请选择协议' }]}
                options={PROTOCOL_OPTIONS}
                fieldProps={{ onChange: (val: string) => setProtocol(val) }} />
            <ProFormDigit name="pollIntervalSecs" label="采集周期(秒)" placeholder="采集间隔" min={1} />

            {/* 根据协议动态显示连接参数 */}
            {protocol === 'modbus-tcp' && (
                <ProFormDigit name="conn_port" label="端口号" placeholder="如 502" initialValue={502} />
            )}
            {protocol === 'modbus-rtu' && (
                <>
                    <ProFormDigit name="conn_baudRate" label="波特率" placeholder="如 9600" initialValue={9600} />
                    <ProFormSelect name="conn_dataBits" label="数据位" initialValue={8}
                        options={[{ label: '7', value: 7 }, { label: '8', value: 8 }]} />
                    <ProFormSelect name="conn_stopBits" label="停止位" initialValue={1}
                        options={[{ label: '1', value: 1 }, { label: '2', value: 2 }]} />
                    <ProFormSelect name="conn_parity" label="校验方式" initialValue="NONE"
                        options={[{ label: '无校验', value: 'NONE' }, { label: '奇校验', value: 'ODD' }, { label: '偶校验', value: 'EVEN' }]} />
                </>
            )}
            {protocol === 'mqtt' && (
                <ProFormDigit name="conn_port" label="端口号" placeholder="如 1883" initialValue={1883} />
            )}

            <ProFormSelect name="status" label="状态"
                options={[{ label: '启用', value: 0 }, { label: '停用', value: 1 }]}
                rules={[{ required: true }]} />
            <ProFormTextArea name="remark" label="备注" placeholder="请输入备注"
                colProps={{ span: 24 }} labelCol={{ span: 3 }} wrapperCol={{ span: 21 }} />
        </ProModalForm>
    );
};

export default DataSourceForm;
