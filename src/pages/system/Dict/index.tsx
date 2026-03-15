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

import { SysDictType } from '@/apis/system/dict';
import { AddButton, DeleteButton, EditButton, IconButton } from '@/components/button';
import { ProPageContainer } from '@/components/container';
import useCrud from '@/hooks/common/useCrud';
import { SettingFilled } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Modal, Space, Tag } from 'antd';
import React, { useState } from 'react';
import DictTypeForm from './components/DictTypeForm';
import DictDataList from './DataList';

const DictTypeManager: React.FC = () => {
    const [dataListVisible, setDataListVisible] = useState(false);
    const [currentRow, setCurrentRow] = useState<SysDictType>();

    const {
        fetchPage,
        toCreate,
        toEdit,
        toDelete,
        actionRef,
        getState,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<SysDictType>({
        entityName: '字典类型',
        pathname: '/system/dict',
        baseUrl: '/api/system/dict/type',
    });

    const { dialogVisible, shouldRefresh } = getState('/system/dict');

    React.useEffect(() => {
        if (shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [shouldRefresh, actionRef, setShouldRefresh]);

    const columns: ProColumns<SysDictType>[] = [
        {
            title: '字典名称',
            dataIndex: 'name',
        },
        {
            title: '字典类型',
            dataIndex: 'type',
            render: (dom, record) => (
                <Tag
                    color="processing"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setCurrentRow(record);
                        setDataListVisible(true);
                    }}
                >
                    <SettingFilled style={{ marginRight: 4 }} />{dom}
                </Tag>
            ),
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
            title: '创建时间',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            hideInSearch: true,
        },
        {
            title: '操作',
            valueType: 'option',
            width: 120,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => toEdit(record)} />
                    <IconButton
                        tooltip="字典项"
                        icon={<SettingFilled />}
                        onClick={() => {
                            setCurrentRow(record);
                            setDataListVisible(true);
                        }}
                    />
                    <DeleteButton onConfirm={() => toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

    return (
        <ProPageContainer>
            <ProTable<SysDictType>
                actionRef={actionRef}
                rowKey="id"
                search={{ labelWidth: 'auto' }}
                scroll={{ x: 'max-content' }}
                toolbar={{
                    title: (
                        <Space>
                            <AddButton onClick={() => toCreate()}>新建</AddButton>
                        </Space>
                    )
                }}
                request={fetchPage}
                pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                }}
                columns={columns}
            />

            {/* 字典数据项管理弹窗 */}
            <Modal
                title={`字典项配置 - ${currentRow?.name || ''}`}
                open={dataListVisible}
                onCancel={() => setDataListVisible(false)}
                width={1000}
                footer={null}
                destroyOnClose
            >
                <DictDataList typeCode={currentRow?.type || ''} />
            </Modal>

            {/* 新增/编辑字典类型弹窗 */}
            <DictTypeForm open={dialogVisible} onOpenChange={setDialogVisible} />
        </ProPageContainer>
    );
};

export default DictTypeManager;
