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

import { DeleteButton, EditButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import { useAccess, useModel } from "@@/exports";
import {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, Space } from "antd";
import React, { useEffect, useMemo, useState } from 'react';

import { exportPost } from "@/apis/post";
import { Permission } from "@/components";
import StatusIcon from "@/components/icons/StatusIcon";
import { PERMISSIONS } from "@/config/permissions";
import PostDetailDialog from "@/pages/system/Post/PostDetailDialog";
import { downloadFailed, downloadSuccess } from "@/utils/download";

const Index = () => {
  const [params] = useState<Record<string, any>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [tip] = useState('正在处理中，请稍等...');


  const {
    getState,
    formRef,
    actionRef,
    toCreate,
    toEdit,
    toDelete,
    toBatchDelete,
    fetchPage,
    setDialogVisible,
    setShouldRefresh,
  } = useCrud<SysPost>({
    entityName: '岗位',
    pathname: '/system/post',
    baseUrl: '/api/system/post'
  });

  const state = getState('/system/post');

  // const onStatusChange = (record: any) => {
  //   const action = record.status === '0' ? '禁用' : '启用';
  //   ModalConfirm({
  //     title: '启用/禁用',
  //     content: `您确定要${action}角色[${record.roleName}]么？`,
  //     onOk() {
  //       const status = record.status === '0' ? '1' : '0';
  //       changeUserStatus(record.userId, status)
  //         .then(res => {
  //           void message.success(res.msg || `${action}用户[${record.userName}]成功`);
  //           actionRef.current?.reload();
  //         })
  //         .catch(err => {
  //           void message.error(err.message || `${action}用户[${record.userName}]失败`);
  //         });
  //     }
  //   });
  // }

  const toDeleteBatch = () => {
    if (deleteDisabled) return;
    if (!selectedRowKeys || selectedRowKeys.length === 0) return;
    void toBatchDelete(selectedRowKeys as (string | number)[], true);
  }

  const columns: ProColumns[] = [
    {
      title: '岗位编号',
      dataIndex: 'id',
      key: 'id',
      hideInSearch: true,
      hideInTable: true
    },
    {
      title: '岗位名称',
      dataIndex: 'name',
      key: 'name',
      fieldProps: {
        placeholder: '请输入岗位名称'
      }
    },
    {
      title: '岗位代码',
      dataIndex: 'code',
      key: 'code',
      fieldProps: {
        placeholder: '请输入岗位代码'
      }
    },
    {
      title: '岗位排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      hideInSearch: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        0: { text: '正常', status: 'Success' },
        1: { text: '停用', status: 'Error' },
      },
      fieldProps: {
        placeholder: '请选择状态'
      },
      render: (_, record) => {
        return <StatusIcon value={record.status} />
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      hideInSearch: true
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      hideInSearch: true,
      render: (_: any, row: any) => {
        // 动态生成菜单项
        // const rawItems: Record<string, any> = [
        //   {
        //     label: '重置密码',
        //     key: 'resetPassword',
        //     icon: <LockFilled/>,
        //     disabled: state.loading,
        //     permission: 'system:user:resetPwd'
        //   },
        //   {
        //     label: '分配角色',
        //     key: 'assignRole',
        //     icon: <Icon component={RoleIcon}/>,
        //     disabled: loading,
        //     permission: 'system:user:edit'
        //   }
        // ];
        //
        // const items: MenuProps['items'] = rawItems
        //   .filter((item: Record<string, any>) => !item.permission || hasPermission(item.permission));

        return (
          <Space>
            <EditButton onClick={() => toEdit(row)} />
            <DeleteButton onConfirm={async () => {
              await toDelete(row.id, true);
            }} />
            {/*<Dropdown menu={{items, onClick: (info) => onMenuClick(info, row)}}>*/}
            {/*  <Button type={'text'} shape={'circle'} size={'small'}*/}
            {/*          icon={<MoreOutlined/>}/>*/}
            {/*</Dropdown>*/}
          </Space>
        )
      }
    }
  ];

  const toEditSelected = () => {
    if (editDisabled) return;
    if (!selectedRows || selectedRows.length !== 1) return;
    toEdit(selectedRows[0]);
  }

  const toExportPost = async () => {
    const values = formRef.current?.getFieldsValue();
    exportPost(values)
      .then(data => {
        downloadSuccess(data, `post_${new Date().getTime()}.xlsx`);
      })
      .catch(err => {
        downloadFailed(err);
      })
  }

  const editDisabled = useMemo(() => {
    return (!selectedRowKeys || selectedRowKeys.length !== 1);
  }, [selectedRowKeys]);

  const deleteDisabled = useMemo(() => {
    return (!selectedRowKeys || selectedRowKeys.length === 0);
  }, [selectedRowKeys]);

  useEffect(() => {
    if (state.shouldRefresh) {
      setSelectedRowKeys([]);
      setSelectedRows([]);
      actionRef.current?.reload();
      setShouldRefresh(false); // 重置标志位
    }
  }, [state.shouldRefresh]);

  return (
    <>
      <ProPageContainer className={'pt-1'}>
        <ProTable columns={columns}
          rowKey={'id'}
          formRef={formRef}
          actionRef={actionRef}
          params={params}
          tableAlertRender={false}
          tableAlertOptionRender={false}
          rowSelection={{
            selectedRowKeys,
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedRowKeys(selectedRowKeys);
              setSelectedRows(selectedRows);
            }
          }}
          form={{ span: 6 }}
          cardProps={{ variant: 'borderless' } as any}
          search={{
            collapseRender: false, // 完全移除折叠按钮
            defaultCollapsed: false // 默认不折叠
          }}
          loading={{ spinning: state.loading, tip }}
          toolbar={{
            title:
              <Space>
                <Permission code={PERMISSIONS.SYSTEM.POST.ADD}>
                  <Button color={'primary'}
                    icon={<PlusOutlined />}
                    variant={'outlined'}
                    size={'small'}
                    onClick={() => toCreate()}
                  >新建</Button>
                </Permission>

                <Permission code={PERMISSIONS.SYSTEM.POST.EDIT} mode={'disable'}>
                  <Button color={"green"}
                    icon={<EditOutlined />}
                    disabled={editDisabled}
                    size={'small'}
                    variant={'outlined'}
                    onClick={toEditSelected}
                  >修改</Button>
                </Permission>

                <Permission code={PERMISSIONS.SYSTEM.POST.REMOVE} mode={'disable'}>
                  <Button color={"danger"}
                    icon={<DeleteOutlined />}
                    disabled={deleteDisabled}
                    size={'small'}
                    variant={'outlined'}
                    onClick={toDeleteBatch}
                  >删除</Button>
                </Permission>

                <Permission code={PERMISSIONS.SYSTEM.POST.EXPORT}>
                  <Button color={"orange"}
                    icon={<ExportOutlined />}
                    size={'small'}
                    variant={'outlined'}
                    onClick={toExportPost}
                  >导出</Button>
                </Permission>
              </Space>
          }}
          request={
            async (params = {}) => {
              const { createTimeRange, ...rest } = params;
              if (createTimeRange) {
                const [beginTime, endTime] = createTimeRange;
                params = { ...rest, params: { beginTime, endTime } };
              }
              const result = await fetchPage(params);
              console.log("result: ", result);
              return result;
            }
          }
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 20,
          }}
        />
      </ProPageContainer>
      <PostDetailDialog title={state?.dialogTitle} open={state?.dialogVisible} onOpenChange={setDialogVisible} />
    </>
  )
}

export default Index;
