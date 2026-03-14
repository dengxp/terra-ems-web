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

import { SysDictData } from '@/apis/system/dict';
import { AddButton, DeleteButton, EditButton } from '@/components/button';
import useCrud from '@/hooks/common/useCrud';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Space } from 'antd';
import React from 'react';
import DictDataForm from './components/DictDataForm';

interface Props {
    typeCode: string;
}

const DictDataList: React.FC<Props> = ({ typeCode }) => {
    const pathname = `/system/dict/data/${typeCode}`;

    const {
        fetchPage,
        toCreate,
        toEdit,
        toDelete,
        actionRef,
        getState,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<SysDictData>({
        entityName: '字典项',
        pathname,
        baseUrl: '/api/system/dict/data',
    });

    const { dialogVisible, shouldRefresh } = getState(pathname);

    React.useEffect(() => {
        if (shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [shouldRefresh, actionRef, setShouldRefresh]);

    const columns: ProColumns<SysDictData>[] = [
        {
            title: '字典标签',
            dataIndex: 'label',
        },
        {
            title: '字典键值',
            dataIndex: 'value',
        },
        {
            title: '排序',
            dataIndex: 'sortOrder',
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            valueEnum: {
                '0': { text: '正常', status: 'Success' },
                '1': { text: '停用', status: 'Error' },
            },
        },
        {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onConfirm={() => toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProTable<SysDictData>
                headerTitle={false}
                actionRef={actionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                scroll={{ x: 'max-content' }}
                toolbar={{
                    title: (
                        <Space>
                            <AddButton onClick={() => toCreate()}>新增项</AddButton>
                        </Space>
                    )
                }}
                params={{ typeCode }}
                request={fetchPage}
                pagination={{
                    defaultPageSize: 5,
                    showSizeChanger: true,
                    pageSizeOptions: ['5', '10', '20', '50'],
                }}
                columns={columns}
            />

            {/* 新增/编辑字典项弹窗 */}
            <DictDataForm open={dialogVisible} onOpenChange={setDialogVisible} typeCode={typeCode} />
        </>
    );
};

export default DictDataList;
