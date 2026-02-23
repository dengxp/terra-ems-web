import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button, Descriptions, message, Modal, Space, Tag } from 'antd';
import React, { useRef, useState } from 'react';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { loginLogApi, SysLoginLog } from '@/apis/monitor/loginLog';
import { IconButton } from '@/components/button';
import { wrapperResult } from '@/utils';
import useCrud from '@/hooks/common/useCrud';

const LoginLogTable: React.FC = () => {
    const access = useAccess();
    const actionRef = useRef<ActionType>();
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<SysLoginLog>();

    const {
        toBatchDelete,
    } = useCrud<SysLoginLog>({
        pathname: '/monitor/login-log',
        entityName: '登录日志',
        baseUrl: '/api/monitor/login-log',
    });

    const columns: ProColumns<SysLoginLog>[] = [
        {
            title: '访问编号',
            dataIndex: 'id',
            hideInSearch: true,
            width: 80,
        },
        {
            title: '用户名称',
            dataIndex: 'userName',
            copyable: true,
        },
        {
            title: '登录地址',
            dataIndex: 'ipaddr',
        },
        {
            title: '登录地点',
            dataIndex: 'loginLocation',
            hideInSearch: true,
        },
        {
            title: '浏览器',
            dataIndex: 'browser',
            hideInSearch: true,
        },
        {
            title: '操作系统',
            dataIndex: 'os',
            hideInSearch: true,
        },
        {
            title: '登录状态',
            dataIndex: 'status',
            valueEnum: {
                '0': { text: '成功', status: 'Success' },
                '1': { text: '失败', status: 'Error' },
            },
        },
        {
            title: '操作信息',
            dataIndex: 'msg',
            hideInSearch: true,
        },
        {
            title: '访问时间',
            dataIndex: 'loginTime',
            valueType: 'dateTime',
            hideInSearch: true,
        },
        {
            title: '访问时间',
            dataIndex: 'loginTimeRange',
            valueType: 'dateTimeRange',
            hideInTable: true,
            search: {
                transform: (value) => {
                    return {
                        'params[beginTime]': value[0],
                        'params[endTime]': value[1],
                    };
                },
            },
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            render: (_, record) => [
                <Access accessible={access.hasPermission('monitor:logininfor:query')} key="view">
                    <IconButton
                        icon={<EyeOutlined />}
                        title="详细"
                        onClick={() => {
                            setCurrentRow(record);
                            setDetailVisible(true);
                        }}
                    />
                </Access>,
            ],
        },
    ];

    const handleBatchDelete = async (selectedRowKeys: React.Key[]) => {
        await toBatchDelete(selectedRowKeys as number[]);
        actionRef.current?.reload();
        actionRef.current?.clearSelected?.();
    };

    const handleClean = () => {
        Modal.confirm({
            title: '是否确认清空所有登录日志数据项？',
            onOk: async () => {
                await loginLogApi.clean();
                message.success('清空成功');
                actionRef.current?.reload();
            }
        });
    };

    return (
        <PageContainer>
            <ProTable<SysLoginLog>
                headerTitle="登录日志列表"
                actionRef={actionRef}
                rowKey="id"
                search={{
                    labelWidth: 120,
                }}
                toolbar={{
                    title: (
                        <Space>
                            <Access accessible={access.hasPermission('monitor:logininfor:remove')} key="clean">
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    type="primary"
                                    ghost
                                    onClick={handleClean}
                                >
                                    清空
                                </Button>
                            </Access>
                        </Space>
                    )
                }}
                request={async (params) => {
                    const res = await loginLogApi.findByPage(params);
                    return wrapperResult(res);
                }}
                columns={columns}
                rowSelection={{
                    onChange: (_selectedKeys, _selectedRows) => {
                    },
                }}
                tableAlertOptionRender={({ selectedRowKeys, onCleanSelected }) => (
                    <Space size={16}>
                        <Access accessible={access.hasPermission('monitor:logininfor:remove')}>
                            <a onClick={() => handleBatchDelete(selectedRowKeys)}>批量删除</a>
                        </Access>
                        <a onClick={onCleanSelected}>取消选择</a>
                    </Space>
                )}
            />

            <Modal
                width={800}
                title="登录日志详情"
                open={detailVisible}
                onCancel={() => setDetailVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailVisible(false)}>
                        关闭
                    </Button>
                ]}
            >
                {currentRow && (
                    <Descriptions column={2} bordered>
                        <Descriptions.Item label="用户名称">{currentRow.userName}</Descriptions.Item>
                        <Descriptions.Item label="登录地址">{currentRow.ipaddr}</Descriptions.Item>
                        <Descriptions.Item label="登录地点">{currentRow.loginLocation}</Descriptions.Item>
                        <Descriptions.Item label="浏览器">{currentRow.browser}</Descriptions.Item>
                        <Descriptions.Item label="操作系统">{currentRow.os}</Descriptions.Item>
                        <Descriptions.Item label="登录状态">
                            <Tag color={currentRow.status === '0' ? 'success' : 'error'}>
                                {currentRow.status === '0' ? '成功' : '失败'}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="操作信息" span={2}>{currentRow.msg}</Descriptions.Item>
                        <Descriptions.Item label="访问时间" span={2}>
                            {currentRow.loginTime ? new Date(currentRow.loginTime).toLocaleString() : '-'}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </PageContainer>
    );
};

export default LoginLogTable;
