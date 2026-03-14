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

import { findMembers, removeMembers } from "@/apis";
import { IconButton } from "@/components/button";
import GenderIcon from "@/components/icons/GenderIcon";
import ModalConfirm from "@/components/ModalConfirm";
import { wrapperResult } from "@/utils";
import { DeleteFilled, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { ActionType, ProFormInstance, ProTable } from "@ant-design/pro-components";
import { Button, message, Space } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import React, { useEffect, useRef, useState } from 'react';
import AddMemberDialog from "./AddMemberDialog";

type Props = {
  departmentId: number;
  onRefresh?: () => void;
}

function MemberPanel({ departmentId, onRefresh }: Props) {
  const [params, setParams] = useState<Record<string, any>>({});
  const [addVisible, setAddVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [, setSelectedRows] = useState<any[]>([]);

  const actionRef = useRef<ActionType>();
  const formRef = useRef<ProFormInstance>();

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '用户姓名',
      dataIndex: 'realName',
      key: 'realName',
    },

    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (value: any) => <GenderIcon value={value} />
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      render: (_: any, row: any) => {
        return (
          <Space>
            <IconButton icon={<DeleteFilled />} tooltip={'移除'} onClick={() => handleRemove([row.id])} />
          </Space>
        )
      }
    }
  ];

  const onSelectChange = (keys: React.Key[], rows: any[]) => {
    setSelectedRowKeys(keys);
    setSelectedRows(rows);
  };

  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onAddMembers = () => {
    actionRef.current?.reload();
    onRefresh?.();
  }

  const handleRemove = (ids?: number[]) => {
    let memberIds = (ids && ids.length > 0)
      ? ids
      : selectedRowKeys;

    if (!memberIds || memberIds.length === 0) {
      void message.error('您未选择部门成员');
      return;
    }

    ModalConfirm({
      title: '移除成员',
      content: '是否从部门中移除选择的成员？',
      onOk() {
        removeMembers(departmentId, memberIds as number[])
          .then(() => {
            void message.success('移除成功');
            actionRef.current?.reload();
            setSelectedRowKeys([]);
            setSelectedRows([]);
            onRefresh?.();
          });
      }
    });
  }

  useEffect(() => {
    actionRef.current?.reload();
  }, [departmentId]);

  return (
    <>
      <div className={'text-[1.2em] font-bold mt-2 mx-2 pb-2 border-b'}>成员列表</div>
      <ProTable columns={columns}
        className={'custom px-2'}
        rowKey={'id'}
        formRef={formRef}
        actionRef={actionRef}
        params={params}
        form={{ span: 4 }}
        cardProps={{ variant: 'borderless' } as any}
        search={false}
        pagination={{
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          defaultPageSize: 10,
        }}
        rowSelection={rowSelection}
        tableAlertRender={false}
        tableAlertOptionRender={false}
        scroll={{ y: 400 }}
        toolbar={{
          title:
            <Space size={8}>
              <Button color={'primary'} variant={'outlined'}
                size={'small'}
                icon={<PlusOutlined />}
                onClick={() => setAddVisible(true)}
              >增加成员</Button>
              <Button color={'danger'} variant={'outlined'} icon={<DeleteOutlined />}
                size={'small'}
                disabled={!selectedRowKeys || selectedRowKeys.length === 0}
                onClick={() => handleRemove()}
              >移除成员</Button>
            </Space>,
          search: {
            allowClear: true,
            placeholder: '请输入关键字搜索...',
            size: 'small',
            style: { width: 320 },
            onSearch: (value: string) => {
              setParams({ ...params, keyword: value });
            },
          },
        }}
        request={async (params) => {
          const { current, pageSize, ...rest } = params;
          const result = await findMembers(departmentId, { pageNumber: (current || 1) - 1, pageSize, ...rest });
          return wrapperResult(result);
        }}
      />
      <AddMemberDialog departmentId={departmentId} open={addVisible}
        onAddMembers={() => onAddMembers()}
        onOpenChange={(setAddVisible)} />
    </>
  );
}

export default MemberPanel;
