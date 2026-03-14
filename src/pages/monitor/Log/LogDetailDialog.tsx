/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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

import { SysLog } from "@/apis/system/log";
import { ProDescriptions } from "@ant-design/pro-components";
import { Drawer } from "antd";
import React from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    currentRow?: SysLog;
}

const LogDetailDialog: React.FC<Props> = (props) => {
    const { open, onClose, currentRow } = props;

    return (
        <Drawer
            width={600}
            open={open}
            onClose={onClose}
            closable={false}
        >
            {currentRow?.title && (
                <ProDescriptions<SysLog>
                    column={1}
                    title={currentRow?.title}
                    request={async () => ({
                        data: currentRow || {},
                    })}
                    params={{
                        id: currentRow?.title,
                    }}
                    columns={[
                        {
                            title: '模块标题',
                            dataIndex: 'title',
                        },
                        {
                            title: '业务类型',
                            dataIndex: 'businessType',
                            valueEnum: {
                                0: { text: '其它' },
                                1: { text: '新增' },
                                2: { text: '修改' },
                                3: { text: '删除' },
                            },
                        },
                        {
                            title: '操作人员',
                            dataIndex: 'username',
                        },
                        {
                            title: '操作地址',
                            dataIndex: 'ip',
                        },
                        {
                            title: '操作地点',
                            dataIndex: 'location',
                        },
                        {
                            title: '操作状态',
                            dataIndex: 'status',
                            valueEnum: {
                                0: { text: '正常', status: 'Success' },
                                1: { text: '异常', status: 'Error' },
                            },
                        },
                        {
                            title: '操作时间',
                            dataIndex: 'createdAt',
                            valueType: 'dateTime',
                        },
                        {
                            title: '消耗时间',
                            dataIndex: 'costTime',
                            render: (_dom, entity) => `${entity.costTime}ms`,
                        },
                        {
                            title: '请求方法',
                            dataIndex: 'method',
                        },
                        {
                            title: '请求方式',
                            dataIndex: 'requestMethod',
                        },
                        {
                            title: '请求URL',
                            dataIndex: 'url',
                        },
                        {
                            title: '请求参数',
                            dataIndex: 'param',
                            valueType: 'jsonCode',
                        },
                        {
                            title: '返回参数',
                            dataIndex: 'result',
                            valueType: 'jsonCode',
                        },
                        {
                            title: '错误消息',
                            dataIndex: 'errorMsg',
                            valueType: 'code',
                        },
                    ]}
                />
            )}
        </Drawer>
    );
};

export default LogDetailDialog;
