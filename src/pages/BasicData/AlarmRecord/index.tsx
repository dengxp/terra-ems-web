import { AlarmRecord, getAlarmRecordPage, getAllAlarmLimitTypes, handleAlarmRecord } from '@/apis/alarm';
import { getAllMeterPoints } from '@/apis/meterPoint';
import { ProModalForm } from "@/components/container";
import { wrapperResult } from '@/utils';
import { CheckCircleFilled, EyeFilled } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProFormSelect, ProFormTextArea, ProTable } from '@ant-design/pro-components';
import { Button, Descriptions, message, Modal, Space, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import React, { useRef, useState } from 'react';

const { Text } = Typography;

/**
 * 报警历史记录页面
 */
const AlarmRecordPage: React.FC = () => {
    const actionRef = useRef<ActionType>();
    const [handleVisible, setHandleVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<AlarmRecord>();

    const columns: ProColumns<AlarmRecord>[] = [
        {
            title: '采集点位',
            dataIndex: ['alarmConfig', 'meterPoint', 'name'],
            key: 'meterPointId',
            request: async () => {
                const res = await getAllMeterPoints();
                return (res.data || []).map(item => ({
                    label: item.name,
                    value: item.id,
                }));
            },
            render: (_, record: AlarmRecord) => (
                <Tooltip title={record.alarmConfig?.meterPoint?.code}>
                    <Text strong>{record.alarmConfig?.meterPoint?.name}</Text>
                </Tooltip>
            ),
        },
        {
            title: '限值类型',
            dataIndex: ['alarmConfig', 'alarmLimitType', 'limitName'],
            key: 'alarmLimitTypeId',
            request: async () => {
                const res = await getAllAlarmLimitTypes();
                return (res.data || []).map(item => ({
                    label: (
                        <Space>
                            <div
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: item.colorNumber || '#ccc'
                                }}
                            />
                            {item.limitName}
                        </Space>
                    ),
                    value: item.id,
                }));
            },
            render: (_, record: AlarmRecord) => (
                <Space>
                    <div
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            backgroundColor: record.alarmConfig?.alarmLimitType?.colorNumber || '#ccc'
                        }}
                    />
                    {record.alarmConfig?.alarmLimitType?.limitName}
                </Space>
            )
        },
        {
            title: '触发数值',
            dataIndex: 'triggerValue',
            hideInSearch: true,
            render: (val, record: AlarmRecord) => (
                <Text type="danger">
                    {val} {record.alarmConfig?.alarmLimitType?.comparatorOperator} {record.alarmConfig?.limitValue}
                </Text>
            )
        },
        {
            title: '触发时间',
            dataIndex: 'triggerTime',
            valueType: 'dateTimeRange',
            sorter: true,
            fieldProps: {
                format: 'YYYY-MM-DD HH:mm',
                showTime: { format: 'HH:mm' },
            },
            search: {
                transform: (value: string[]) => ({
                    startTime: `${value[0]}:00`,
                    endTime: `${value[1]}:59`,
                }),
            },
            render: (_, record: AlarmRecord) => record.triggerTime ? dayjs(record.triggerTime).format('YYYY-MM-DD HH:mm:ss') : '-',
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueEnum: {
                0: { text: '未处理', status: 'Error' },
                1: { text: '已处理', status: 'Success' },
                2: { text: '忽略', status: 'Default' },
            },
        },
        {
            title: '处理时间',
            dataIndex: 'handleTime',
            valueType: 'dateTime',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 80,
            render: (_, record: AlarmRecord) => (
                <Space size={4}>
                    {record.status === 0 && (
                        <Tooltip title="处理">
                            <Button
                                variant="text"
                                color="default"
                                size="small"
                                icon={<CheckCircleFilled />}
                                onClick={() => {
                                    setCurrentRecord(record);
                                    setHandleVisible(true);
                                }}
                            />
                        </Tooltip>
                    )}
                    <Tooltip title="详情">
                        <Button
                            variant="text"
                            color="default"
                            size="small"
                            icon={<EyeFilled />}
                            onClick={() => {
                                setCurrentRecord(record);
                                setDetailVisible(true);
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleFormSubmit = async (values: any) => {
        if (!currentRecord) return;
        const res = await handleAlarmRecord(currentRecord.id, values.remark, values.status);
        if (res.success) {
            message.success('处理成功');
            actionRef.current?.reload();
            return true;
        }
        return false;
    };

    return (
        <PageContainer title={false}>
            <ProTable<AlarmRecord>
                headerTitle="报警历史记录"
                actionRef={actionRef}
                rowKey="id"
                columns={columns}
                request={async (params) => {
                    const res = await getAlarmRecordPage(params);
                    return wrapperResult(res);
                }}
                search={{
                    labelWidth: 'auto',
                }}
                pagination={{
                    showSizeChanger: true,
                    showQuickJumper: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    defaultPageSize: 20,
                }}
            />

            <ProModalForm
                title="处理报警"
                open={handleVisible}
                onOpenChange={setHandleVisible}
                onFinish={handleFormSubmit}
                layout="horizontal"
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 19 }}
                width={420}
                modalProps={{
                    destroyOnClose: true,
                    maskClosable: false,
                }}
            >
                <ProFormSelect
                    name="status"
                    label="处理方式"
                    initialValue={1}
                    options={[
                        { label: '已处理', value: 1 },
                        { label: '忽略', value: 2 },
                    ]}
                    rules={[{ required: true }]}
                />
                <ProFormTextArea
                    name="remark"
                    label="处理备注"
                    placeholder="请输入处理备注或原因"
                    rules={[{ required: true, message: '请输入处理备注' }]}
                />
            </ProModalForm>

            <Modal
                title="报警详情"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={null}
                width={500}
            >
                {currentRecord && (
                    <Descriptions column={1} bordered size="small">
                        <Descriptions.Item label="采集点位">
                            {currentRecord.alarmConfig?.meterPoint?.name}
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                                ({currentRecord.alarmConfig?.meterPoint?.code})
                            </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="限值类型">
                            <Space>
                                <div
                                    style={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        backgroundColor: currentRecord.alarmConfig?.alarmLimitType?.colorNumber || '#ccc'
                                    }}
                                />
                                {currentRecord.alarmConfig?.alarmLimitType?.limitName}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="触发规则">
                            {currentRecord.alarmConfig?.alarmLimitType?.comparatorOperator} {currentRecord.alarmConfig?.limitValue}
                        </Descriptions.Item>
                        <Descriptions.Item label="触发数值">
                            <Text type="danger">{currentRecord.triggerValue}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="触发时间">
                            {currentRecord.triggerTime ? dayjs(currentRecord.triggerTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="处理状态">
                            {currentRecord.status === 0 ? '未处理' : currentRecord.status === 1 ? '已处理' : '忽略'}
                        </Descriptions.Item>
                        {currentRecord.status !== 0 && (
                            <>
                                <Descriptions.Item label="处理时间">
                                    {currentRecord.handleTime ? dayjs(currentRecord.handleTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                                </Descriptions.Item>
                                <Descriptions.Item label="处理备注">{currentRecord.handleRemark || '-'}</Descriptions.Item>
                            </>
                        )}
                    </Descriptions>
                )}
            </Modal>
        </PageContainer >
    );
};

export default AlarmRecordPage;
