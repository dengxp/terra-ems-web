import React, {useEffect, useMemo, useState} from 'react';
import {ProPageContainer} from "@/components/container";
import {
  Button,
  Dropdown,
  Flex,
  Input,
  MenuProps,
  message,
  Space,
  Splitter,
  Tree,
  TreeDataNode,
  TreeProps
} from "antd";
import Icon, {
  DeleteOutlined, EditOutlined, ExportOutlined,
  LockFilled,
  MoreOutlined,
  PlusOutlined, UploadOutlined,
} from "@ant-design/icons";
import {changeUserStatus, exportUser, findDeptTree} from "@/apis";
import {generateList, getParentKey, getTreeKeys} from "@/utils/tree";
import {ProColumns, ProTable} from "@ant-design/pro-components";
import useCrud from "@/hooks/common/useCrud";
import {DeleteButton, EditButton} from "@/components/button";
import {MenuInfo} from "rc-menu/lib/interface";
import ModalConfirm from "@/components/ModalConfirm";
import UserDetailDialog from "@/pages/system/User/UserDetailDialog";
import {useAccess} from '@umijs/max';
import PasswordDialog from "@/pages/system/User/PasswordDialog";
import {ReactComponent as RoleIcon} from "@/icons/svg/role.svg";
import RoleDialog from "@/pages/system/User/RoleDialog";
import UserImportDialog from "@/pages/system/User/UserImportDialog";
import {downloadFailed, downloadSuccess} from "@/utils/download";
import {SysUser} from "@/types";
import {useModel} from "@umijs/max";
import StatusIcon from "@/components/icons/StatusIcon";

const Index = () => {
  const [deptTree, setDeptTree] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState<Record<string, any>>({});
  const [tip, setTip] = useState('正在处理中，请稍等...');
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [roleVisible, setRoleVisible] = useState(false);
  const [userImportVisible, setUserImportVisible] = useState(false);
  const {optionMap} = useModel('constantModel');

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
  } = useCrud<SysUser>({
    pathname: '/system/user',
    entityName: '用户',
    baseUrl: '/api/system/user'
  });

  const {hasPermission} = useAccess();

  const state = getState('/system/user');

  const onMenuClick = ({key}: MenuInfo, user: SysUser) => {
    if (!user.userId) {
      void message.error('未获取到用户信息');
      return;
    }

    switch (key) {
      case 'resetPassword':
        toResetPassword(user)
        break;
      case 'assignRole':
        toAssignRole(user);
        break;
      // case 'disable':
      //   toChangeStatus(user?.id, 0);
      //   break;
      // case 'enable':
      //   toChangeStatus(user.id, 1);
      //   break;
      default:
        void message.error('操作未能识别');
        return;
    }
  }

  // const onStatusChange = (record: any) => {
  //   const action = record.status === '0' ? '禁用' : '启用';
  //   ModalConfirm({
  //     title: '启用/禁用',
  //     content: `您确定要${action}用户[${record.userName}]么？`,
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

  const columns: ProColumns[] = [
    {
      title: '用户编号',
      dataIndex: 'id',
      key: 'id',
      hideInSearch: true
    },
    {
      title: '用户名称',
      dataIndex: 'keyword',
      key: 'keyword',
      fieldProps: {
        placeholder: '请输入用户名称'
      },
      hideInTable: true
    },
    {
      title: '用户名称',
      dataIndex: 'username',
      key: 'username',
      hideInSearch: true
    },
    {
      title: '用户昵称',
      dataIndex: 'nickname',
      key: 'nickname',
      hideInSearch: true
    },
    {
      title: '部门',
      dataIndex: 'departmentName',
      key: 'departmentName',
      hideInSearch: true
    },
    {
      title: '手机号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      fieldProps: {
        placeholder: '请输入手机号码'
      }
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      hideInSearch: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      fieldProps: {
        placeholder: '请选择状态',
        options: optionMap.status
      },
      render: (_, record) => {
        return <StatusIcon value={record.status} />
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
      dataIndex: 'createdAt',
      key: 'createdAt',
      hideInSearch: true
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      hideInSearch: true,
      render: (_: any, row: any) => {

        // 动态生成菜单项
        const rawItems: Record<string, any> = [
          // row.status === 1
          //   ? {
          //     label: '禁用',
          //     key: 'disable',
          //     icon: <CloseCircleFilled/>,
          //     disabled: loading
          //   }
          //   : {
          //     label: '启用',
          //     key: 'enable',
          //     icon: <CheckCircleFilled style={{color: 'green'}}/>,
          //     disabled: loading
          //   },
          {
            label: '重置密码',
            key: 'resetPassword',
            icon: <LockFilled/>,
            disabled: loading,
            permission: 'system:user:resetPwd'
          },
          {
            label: '分配角色',
            key: 'assignRole',
            icon: <Icon component={RoleIcon}/>,
            disabled: loading,
            permission: 'system:user:edit'
          }
        ];

        const items: MenuProps['items'] = rawItems
          .filter((item: Record<string, any>) => !item.permission || hasPermission(item.permission));

        return (
          <Space>
            <EditButton onClick={() => toEdit(row)}/>
            <DeleteButton onClick={async () => {
              await toDelete(row.userId, true);
            }}/>
            <Dropdown menu={{items, onClick: (info) => onMenuClick(info, row)}}>
              <Button type={'text'} shape={'circle'} size={'small'}
                      icon={<MoreOutlined/>}/>
            </Dropdown>
          </Space>
        )
      }
    }
  ];

  const dataList = useMemo(() => {
    return generateList(deptTree);
  }, [deptTree]);

  const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    const deptId = selectedKeys?.[0];
    setParams(prevState => ({...prevState, deptId}));
  };

  // 输入框变化时过滤树
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {value} = e.target;
    setSearchValue(value);
    const newExpandedKeys = dataList
      .map((item) => {
        console.log("item: ", item);
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, deptTree);
        }
        return null;
      })
      .filter((item, i, self): item is React.Key => !!(item && self.indexOf(item) === i));
    if (newExpandedKeys && newExpandedKeys.length > 0) {
      setExpandedKeys(newExpandedKeys);
      setAutoExpandParent(true);
    }
  };

  const toEditSelected = () => {
    if (editDisabled) return;
    if (!selectedRows || selectedRows.length !== 1) return;
    toEdit(selectedRows[0]);
  }

  const toDeleteBatch = () => {
    if (deleteDisabled) return;
    if (!selectedRowKeys || selectedRowKeys.length === 0) return;
    void toDelete(selectedRowKeys, true);
  }

  const toResetPassword = (user: SysUser) => {
    updateState('/system/user', {
      editData: {...user}
    });
    setPasswordVisible(true);
  }

  const toAssignRole = (user: SysUser) => {
    updateState('/system/user', {
      editData: {...user}
    });
    setRoleVisible(true);
  }

  const toImportUser = () => {
    setUserImportVisible(true);
  }

  const toExportUser = async () => {
    exportUser()
      .then(data => {
        downloadSuccess(data, `user_${new Date().getTime()}.xlsx`);
      })
      .catch(err => {
        downloadFailed(err);
      })
  }

  const treeData = useMemo(() => {
    const loop = (tree: TreeDataNode[]): TreeDataNode[] =>
      tree
        .map((item) => {
          const strTitle = item.title as string;
          const index = strTitle.indexOf(searchValue);

          // 只有当前节点标题匹配时，才处理其子节点
          const beforeStr = strTitle.substring(0, index);
          const afterStr = strTitle.slice(index + searchValue.length);

          const title =
            index > -1 ? (
              <span key={item.key}>
              {beforeStr}
                <span className="text-red-500">{searchValue}</span>
                {afterStr}
            </span>
            ) : (
              <span key={item.key}>{strTitle}</span>
            );

          // 递归处理子节点
          let children = item.children ? loop(item.children) : [];

          // 如果当前节点包含搜索值，或者子节点中有符合条件的节点，则保留当前节点
          if (index > -1 || children.length > 0) {
            return {
              title,
              key: item.key,
              children,
            };
          }

          // 如果没有匹配，则返回 null，进行过滤
          return null;
        })
        .filter(item => item !== null) as TreeDataNode[]; // 强制类型转换为 TreeDataNode[]

    return searchValue ? loop(deptTree) : deptTree;
  }, [searchValue, deptTree]);

  const editDisabled = useMemo(() => {
    return (!selectedRowKeys || selectedRowKeys.length !== 1);
  }, [selectedRowKeys]);

  const deleteDisabled = useMemo(() => {
    return (!selectedRowKeys || selectedRowKeys.length === 0);
  }, [selectedRowKeys]);

  useEffect(() => {
    findDeptTree()
      .then(res => {
        if (res.success && res.data) {
          setDeptTree(res.data);
          const keys = getTreeKeys(res.data);
          setExpandedKeys(keys);
        }
      })
  }, []);

  useEffect(() => {
    if (state.shouldRefresh) {
      actionRef.current?.reload();
      setShouldRefresh(false); // 重置标志位
    }
  }, [state.shouldRefresh]);

  return (
    <>
      <ProPageContainer className={'pt-1'}>
        <Splitter style={{height: 800, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'}}>
          <Splitter.Panel defaultSize="20%" min="12%" max="40%">
            <Flex vertical className={'p-2 bg-white h-full'}>
              <Input.Search placeholder={'请输入部门搜索'}
                            onChange={onChange}
              />
              <Tree defaultExpandAll
                    defaultExpandParent
                    // autoExpandParent={autoExpandParent}
                    expandedKeys={expandedKeys}
                    className={'mt-2 overflow-y-auto flex-grow'}
                    onSelect={onSelect}
                    treeData={treeData}
              />
            </Flex>
          </Splitter.Panel>
          <Splitter.Panel>
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
                      form={{span: 8}}
                      cardProps={{bordered: false}}
                      search={{
                        collapseRender: false, // 完全移除折叠按钮
                        defaultCollapsed: false // 默认不折叠
                      }}
                      loading={{spinning: loading, tip}}
                      toolbar={{
                        title:
                          <Space>
                            {
                              // hasPermission('system:user:add') &&
                              <Button color={'primary'}
                                      icon={<PlusOutlined/>}
                                      variant={'outlined'}
                                      size={'small'}
                                      onClick={toCreate}
                              >新建</Button>
                            }
                            {
                              // hasPermission('system:user:edit') &&
                              <Button color={"green"}
                                      icon={<EditOutlined/>}
                                      disabled={editDisabled}
                                      size={'small'}
                                      variant={'outlined'}
                                      onClick={toEditSelected}
                              >修改</Button>
                            }
                            {
                              // hasPermission('system:user:remove') &&
                              <Button color={"danger"}
                                      icon={<DeleteOutlined/>}
                                      disabled={deleteDisabled}
                                      size={'small'}
                                      variant={'outlined'}
                                      onClick={toDeleteBatch}
                              >删除</Button>
                            }

                            {
                              // hasPermission('system:user:import') &&
                              <Button color={"purple"}
                                      icon={<UploadOutlined/>}
                                      size={'small'}
                                      variant={'outlined'}
                                      onClick={toImportUser}
                              >导入</Button>
                            }
                            {
                              // hasPermission('system:user:export') &&
                              <Button color={"orange"}
                                      icon={<ExportOutlined/>}
                                      size={'small'}
                                      variant={'outlined'}
                                      onClick={toExportUser}
                              >导出</Button>
                            }

                          </Space>
                      }}
                      request={
                        async (params = {}) => {
                          const {createTimeRange, ...rest} = params;
                          if (createTimeRange) {
                            const [beginTime, endTime] = createTimeRange;
                            params = {...rest, beginTime, endTime};
                          }
                          return fetchPageWithParams(params);
                        }
                      }
            />
          </Splitter.Panel>
        </Splitter>
      </ProPageContainer>
      <UserDetailDialog title={state?.dialogTitle} open={state?.dialogVisible} onOpenChange={setDialogVisible}/>
      <PasswordDialog title={'重置用户密码'} open={passwordVisible} onOpenChange={setPasswordVisible}/>
      <RoleDialog title={'分配角色'} open={roleVisible} onOpenChange={setRoleVisible}/>
      <UserImportDialog title={'用户导入'} open={userImportVisible} onOpenChange={setUserImportVisible}/>
    </>
  )
}

export default Index;
