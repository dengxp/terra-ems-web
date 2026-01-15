import React, { useEffect, useState } from 'react';
import { ProTable } from "@ant-design/pro-components";
import GenderIcon from "@/components/icons/GenderIcon";
import { IconButton } from "@/components/button";
import { Button, message, Space } from "antd";
import useCrud from "@/hooks/common/useCrud";
import { findMembers, removeMembers } from "@/apis";
import { DeleteFilled, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import AddMemberDialog from "./AddMemberDialog";
import { TableRowSelection } from "antd/es/table/interface";
import ModalConfirm from "@/components/ModalConfirm";
import { wrapperResult } from "@/utils";

type Props = {
  departmentId: number;
}

function MemberPanel({ departmentId }: Props) {
  const [params, setParams] = useState<Record<string, any>>({});
  const [addVisible, setAddVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);

  const {
    formRef,
    actionRef,
  } = useCrud<SysDept>({
    entityName: '部门',
    pathname: '/system/org',
    baseUrl: '/api/system/department'
  });

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '用户昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (value: any) => <GenderIcon value={value} />
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
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
        cardProps={{ bordered: false }}
        search={false}
        pagination={{ pageSize: 10 }}
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
          const result = await findMembers(departmentId, { pageNumber: current, pageSize, ...rest });
          return wrapperResult(result);
        }}
      />
      {/*<div className={'-mt-10'}>*/}
      {/*  <Space>*/}
      {/*    <Button type={'primary'} variant={'solid'}*/}
      {/*            size={'small'} icon={<PlusOutlined/>}*/}
      {/*            onClick={() => setAddVisible(true)}*/}
      {/*    >增加成员</Button>*/}
      {/*    <Button variant={'outlined'} size={'small'} icon={<DeleteOutlined/>}*/}
      {/*            disabled={!selectedRowKeys || selectedRowKeys.length === 0}*/}
      {/*            onClick={() => handleRemove()}*/}
      {/*    >移除成员</Button>*/}
      {/*  </Space>*/}
      {/*</div>*/}
      <AddMemberDialog departmentId={departmentId} open={addVisible}
        onAddMembers={() => onAddMembers()}
        onOpenChange={(setAddVisible)} />
    </>
  );
}

export default MemberPanel;
