/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */


import { clean, exportOperlog, list, OperationLog } from '@/apis/monitor/operationLog';
import { IconButton } from '@/components/button';
import useCrud from '@/hooks/common/useCrud';
import { wrapperResult } from '@/utils';
import { DeleteOutlined, ExportOutlined, EyeOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { Access, useAccess } from '@umijs/max';
import { Button, Descriptions, message, Modal, Space } from 'antd';
import React, { useRef, useState } from 'react';

const OperLogTable: React.FC = () => {
    const access = useAccess();
    const actionRef = useRef<ActionType>();
    const [detailVisible, setDetailVisible] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<OperationLog>();

    const {
        toBatchDelete,
        toDelete
    } = useCrud<OperationLog>({
        pathname: '/monitor/operationLog',
        entityName: '操作日志',
        baseUrl: '/api/monitor/operation-log',
    });

    const columns: ProColumns<OperationLog>[] = [
        {
            title: '日志编号',
            dataIndex: 'id',
            hideInSearch: true,
            hideInTable: true,
        },
        {
            title: '系统模块',
            dataIndex: 'title',
        },
        {
            title: '业务类型',
            dataIndex: 'businessType',
            valueEnum: {
                0: { text: '其它', status: 'Default' },
                1: { text: '新增', status: 'Success' },
                2: { text: '修改', status: 'Warning' },
                3: { text: '删除', status: 'Error' },
                4: { text: '授权', status: 'Success' },
                5: { text: '导出', status: 'Warning' },
                6: { text: '导入', status: 'Warning' },
                7: { text: '强退', status: 'Error' },
                8: { text: '生成代码', status: 'Default' },
                9: { text: '清空数据', status: 'Error' },
            },
        },
        {
            title: '请求方式',
            dataIndex: 'requestMethod',
        },
        {
            title: '操作人员',
            dataIndex: 'operationName',
        },
        {
            title: '主机',
            dataIndex: 'operationIp',
            hideInSearch: true,
        },
        {
            title: '操作地点',
            dataIndex: 'operationLocation',
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueEnum: {
                0: { text: '正常', status: 'Success' },
                1: { text: '异常', status: 'Error' },
            },
        },
        {
            title: '操作时间',
            dataIndex: 'operationTime',
            valueType: 'dateTime',
            sorter: true,
            hideInSearch: true,
        },
        {
            title: '操作时间',
            dataIndex: 'operationTimeRange',
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
            title: '消耗时间',
            dataIndex: 'costTime',
            hideInSearch: true,
            render: (_, record) => <span>{record.costTime}毫秒</span>
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            render: (_, record) => [
                <Access accessible={access.hasPermission('monitor:operlog:query')} key="view">
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
        await toBatchDelete(selectedRowKeys as (string | number)[]);
        actionRef.current?.reload();
        actionRef.current?.clearSelected?.();
    };

    const handleClean = () => {
        Modal.confirm({
            title: '是否确认清空所有操作日志数据项？',
            onOk: async () => {
                await clean();
                message.success('清空成功');
                actionRef.current?.reload();
            }
        });
    };

    const handleExport = async () => {
        const hide = message.loading('正在导出...');
        try {
            await exportOperlog({}); // Add params if needed
            hide();
            message.success('导出成功');
        } catch (error) {
            hide();
            message.error('导出失败');
        }
    };

    return (
        <PageContainer>
            <ProTable<OperationLog>
                headerTitle="操作日志列表"
                actionRef={actionRef}
                rowKey="id"
                search={{
                    labelWidth: 120,
                }}
                toolbar={{
                    title: (
                        <Space>
                            <Access accessible={access.hasPermission('monitor:operlog:remove')} key="clean">
                                <Button
                                    color="danger"
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    variant="outlined"
                                    onClick={handleClean}
                                >
                                    清空
                                </Button>
                            </Access>
                            <Access accessible={access.hasPermission('monitor:operlog:export')} key="export">
                                <Button
                                    color="orange"
                                    icon={<ExportOutlined />}
                                    size="small"
                                    variant="outlined"
                                    onClick={handleExport}
                                >
                                    导出
                                </Button>
                            </Access>
                        </Space>
                    )
                }}
                request={async (params) => {
                    const res = await list(params);
                    return wrapperResult(res);
                }}
                columns={columns}
                rowSelection={{
                    onChange: (_selectedKeys, _selectedRows) => {
                        // console.log(selectedRows);
                    },
                }}
                tableAlertOptionRender={({ selectedRowKeys, selectedRows: _sr, onCleanSelected }) => (
                    <Space size={16}>
                        <Access accessible={access.hasPermission('monitor:operlog:remove')}>
                            <a onClick={() => handleBatchDelete(selectedRowKeys)}>批量删除</a>
                        </Access>
                        <a onClick={onCleanSelected}>取消选择</a>
                    </Space>
                )}
            />

            <Modal
                width={800}
                title="操作日志详情"
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
                        <Descriptions.Item label="操作模块">{currentRow.title} / {
                            {
                                0: '其它', 1: '新增', 2: '修改', 3: '删除', 4: '授权',
                                5: '导出', 6: '导入', 7: '强退', 8: '生成代码', 9: '清空数据'
                            }[currentRow.businessType]
                        }</Descriptions.Item>
                        <Descriptions.Item label="请求方式">{currentRow.requestMethod}</Descriptions.Item>
                        <Descriptions.Item label="登录信息">{currentRow.operationName} / {currentRow.operationIp} / {currentRow.operationLocation}</Descriptions.Item>
                        <Descriptions.Item label="操作方法">{currentRow.method}</Descriptions.Item>
                        <Descriptions.Item label="操作时间">{currentRow.operationTime ? new Date(currentRow.operationTime).toLocaleString() : '-'}</Descriptions.Item>
                        <Descriptions.Item label="操作状态">
                            {currentRow.status === 0 ? '正常' : '失败'}
                        </Descriptions.Item>
                        <Descriptions.Item label="请求地址" span={2}>{currentRow.operationUrl}</Descriptions.Item>

                        <Descriptions.Item label="请求参数" span={2}>
                            <div style={{ wordBreak: 'break-all', maxHeight: '200px', overflowY: 'auto' }}>
                                {currentRow.operationParam}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="返回参数" span={2}>
                            <div style={{ wordBreak: 'break-all', maxHeight: '200px', overflowY: 'auto' }}>
                                {currentRow.jsonResult}
                            </div>
                        </Descriptions.Item>
                        <Descriptions.Item label="错误消息" span={2}>
                            <div style={{ wordBreak: 'break-all', color: 'red' }}>
                                {currentRow.errorMsg}
                            </div>
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </PageContainer>
    );
};

export default OperLogTable;
