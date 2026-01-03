import React, {useEffect, useMemo, useState} from 'react';
import {ProPageContainer} from "@/components/container";
import {Button, Dropdown, MenuProps, message, Space, Switch} from "antd";
import Icon, {
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  LockFilled, MoreOutlined,
  PlusOutlined,
  UploadOutlined
} from "@ant-design/icons";
import {ProColumns, ProTable} from "@ant-design/pro-components";
import {useDict} from "@/hooks/common/useDict";
import ModalConfirm from "@/components/ModalConfirm";
import {changeUserStatus} from "@/apis";
import useCrud from "@/hooks/common/useCrud";
import {DeleteButton, EditButton} from "@/components/button";
import {useAccess} from "@@/exports";
import RoleDetailDialog from "@/pages/system/Role/RoleDetailDialog";

const Index = () => {
  const [params, setParams] = useState<Record<string, any>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [tip, setTip] = useState('正在处理中，请稍等...');

  const {
    getState,
    formRef,
    actionRef,
    toCreate,
    toEdit,
    toDelete,
    fetchPageWithParams,
    setDialogVisible,
    setShouldRefresh,
    updateState
  } = useCrud<Role>({
    entityName: '角色',
    pathname: '/system/role',
    baseUrl: '/api/system/role'
  });

  const {hasPermission} = useAccess();
  const dictMap = useDict('sys_normal_disable');
  const state = getState('/system/role');

  const onStatusChange = (record: any) => {
    const action = record.status === '0' ? '禁用' : '启用';
    ModalConfirm({
      title: '启用/禁用',
      content: `您确定要${action}角色[${record.roleName}]么？`,
      onOk() {
        const status = record.status === '0' ? '1' : '0';
        changeUserStatus(record.userId, status)
          .then(res => {
            void message.success(res.msg || `${action}用户[${record.userName}]成功`);
            actionRef.current?.reload();
          })
          .catch(err => {
            void message.error(err.message || `${action}用户[${record.userName}]失败`);
          });
      }
    });
  }

  const columns: ProColumns[] = [
    {
      title: '角色编号',
      dataIndex: 'roleId',
      key: 'roleId',
      hideInSearch: true
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
      fieldProps: {
        placeholder: '请输入角色名称'
      }
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      key: 'roleKey',
    },
    {
      title: '显示顺序',
      dataIndex: 'roleSort',
      key: 'roleSort',
      hideInSearch: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      fieldProps: {
        placeholder: '请选择状态',
        options: dictMap.sys_normal_disable
      },
      render: (_, record) => {
        const value = record.status === '0';
        return <Switch size={'small'} value={value} onChange={() => onStatusChange(record)}/>
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createTimeRange',
      key: 'createTimeRange',
      valueType: 'dateRange',
      hideInTable: true
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      hideInSearch: true
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      hideInSearch: true,
      render: (_: any, row: any) => {
        return '';
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
        //
        // return (
        //   <Space>
        //     <EditButton onClick={() => toEdit(row)}/>
        //     <DeleteButton onClick={async () => {
        //       await toDelete(row.userId, true);
        //     }}/>
        //     <Dropdown menu={{items, onClick: (info) => onMenuClick(info, row)}}>
        //       <Button type={'text'} shape={'circle'} size={'small'}
        //               icon={<MoreOutlined/>}/>
        //     </Dropdown>
        //   </Space>
        // )
      }
    }
  ];

  const toEditSelected = () => {
    if (editDisabled) return;
    if (!selectedRows || selectedRows.length !== 1) return;
    toEdit(selectedRows[0]);
  }

  const editDisabled = useMemo(() => {
    return (!selectedRowKeys || selectedRowKeys.length !== 1);
  }, [selectedRowKeys]);

  const deleteDisabled = useMemo(() => {
    return (!selectedRowKeys || selectedRowKeys.length === 0);
  }, [selectedRowKeys]);

  useEffect(() => {
    if (state.shouldRefresh) {
      actionRef.current?.reload();
      setShouldRefresh(false); // 重置标志位
    }
  }, [state.shouldRefresh]);

  return (
    <>
      <ProPageContainer className={'pt-1'}>
        <ProTable columns={columns}
                  rowKey={'roleId'}
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
                  form={{span: 6}}
                  cardProps={{bordered: false}}
                  search={{
                    collapseRender: false, // 完全移除折叠按钮
                    defaultCollapsed: false // 默认不折叠
                  }}
                  loading={{spinning: state.loading, tip}}
                  toolbar={{
                    title:
                      <Space>
                        {
                          hasPermission('system:role:add') &&
                          <Button color={'primary'}
                                  icon={<PlusOutlined/>}
                                  variant={'outlined'}
                                  size={'small'}
                                  onClick={toCreate}
                          >新建</Button>
                        }
                        {
                          hasPermission('system:user:edit') &&
                          <Button color={"green"}
                                  icon={<EditOutlined/>}
                                  disabled={editDisabled}
                                  size={'small'}
                                  variant={'outlined'}
                                  onClick={toEditSelected}
                          >修改</Button>
                        }
                        {
                          hasPermission('system:user:remove') &&
                          <Button color={"danger"}
                                  icon={<DeleteOutlined/>}
                            // disabled={deleteDisabled}
                                  size={'small'}
                                  variant={'outlined'}
                            // onClick={toDeleteBatch}
                          >删除</Button>
                        }
                        {
                          hasPermission('system:user:export') &&
                          <Button color={"orange"}
                                  icon={<ExportOutlined/>}
                                  size={'small'}
                                  variant={'outlined'}
                            // onClick={toExportUser}
                          >导出</Button>
                        }

                      </Space>
                  }}
                  request={
                    async (params = {}) => {
                      const {createTimeRange, ...rest} = params;
                      if (createTimeRange) {
                        const [beginTime, endTime] = createTimeRange;
                        params = {...rest, params: {beginTime, endTime}};
                      }
                      const result = await fetchPageWithParams(params);
                      console.log("result: ", result);
                      return result;
                    }
                  }
        />
      </ProPageContainer>
      <RoleDetailDialog title={state?.dialogTitle} open={state?.dialogVisible} onOpenChange={setDialogVisible}/>
    </>
  )
}

export default Index;
