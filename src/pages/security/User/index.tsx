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

import { exportUser, findDeptTree, setSuperAdmin } from "@/apis";
import { DeleteButton, EditButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import { ReactComponent as RoleIcon } from "@/icons/svg/role.svg";
import PasswordDialog from "@/pages/security/User/PasswordDialog";
import RoleDialog from "@/pages/security/User/RoleDialog";
import UserDetailDialog from "@/pages/security/User/UserDetailDialog";
import UserImportDialog from "@/pages/security/User/UserImportDialog";
import { downloadFailed, downloadSuccess } from "@/utils/download";
import { generateList, getParentKey, getTreeKeys } from "@/utils/tree";
import Icon, {
  DeleteOutlined, EditOutlined, ExportOutlined,
  LockFilled,
  MoreOutlined,
  PlusOutlined, StarFilled, UploadOutlined
} from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { useAccess } from '@umijs/max';
import {
  Button,
  Dropdown,
  Flex,
  Input,
  MenuProps,
  message,
  Modal,
  Space,
  Splitter,
  Tag,
  Tree,
  TreeDataNode,
  TreeProps
} from "antd";
import { MenuInfo } from "rc-menu/lib/interface";
import React, { useEffect, useMemo, useState } from 'react';

import StatusIcon from "@/components/icons/StatusIcon";
import { useModel } from "@umijs/max";

const Index = () => {
  const [deptTree, setDeptTree] = useState<any[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [loading] = useState(false);
  const [params, setParams] = useState<Record<string, any>>({});
  const [tip] = useState('正在处理中，请稍等...');
  const [searchValue, setSearchValue] = useState('');
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [roleVisible, setRoleVisible] = useState(false);
  const [userImportVisible, setUserImportVisible] = useState(false);
  const { optionMap } = useModel('constantModel');

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
    updateState
  } = useCrud<SysUser>({

    pathname: '/system/user',
    entityName: '用户',
    baseUrl: '/api/system/user'
  });

  const { hasPermission } = useAccess();

  const state = getState('/system/user');

  const onMenuClick = ({ key }: MenuInfo, user: SysUser) => {
    if (!user.id) {
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
      case 'setSuper':
        handleSetSuper(user);
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
      title: '登录账号',
      dataIndex: 'keyword',
      key: 'keyword',
      fieldProps: {
        placeholder: '请输入登录账号'
      },
      hideInTable: true
    },
    {
      title: '登录账号',
      dataIndex: 'username',
      key: 'username',
      hideInSearch: true
    },
    {
      title: '用户姓名',
      dataIndex: 'realName',
      key: 'realName',
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
      dataIndex: 'phone',
      key: 'phone',
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
      title: '超级管理员',
      dataIndex: 'superAdmin',
      key: 'superAdmin',
      hideInSearch: true,
      render: (_, record) => {
        return record.superAdmin ? <Tag color="gold">是</Tag> : <Tag color="default">否</Tag>
      }
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
            icon: <LockFilled />,
            disabled: loading,
            permission: 'system:user:resetPwd'
          },
          {
            label: '分配角色',
            key: 'assignRole',
            icon: <Icon component={RoleIcon} />,
            disabled: loading,
            permission: 'system:user:assignRole'
          },
          {
            label: row.superAdmin ? '取消超级管理员' : '设为超级管理员',
            key: 'setSuper',
            icon: <StarFilled style={{ color: row.superAdmin ? '#ccc' : '#faad14' }} />,
            disabled: loading || row.username === 'admin',
            permission: 'system:user:setSuper'
          }
        ];

        const items: MenuProps['items'] = rawItems
          .filter((item: Record<string, any>) => !item.permission || hasPermission(item.permission));

        return (
          <Space>
            <EditButton onClick={() => toEdit(row)} />
            <DeleteButton onConfirm={async () => {
              await toDelete(row.id, true);
            }} />
            <Dropdown menu={{ items, onClick: (info) => onMenuClick(info, row) }}>
              <Button type={'text'} shape={'circle'} size={'small'}
                icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        )
      }
    }
  ];

  const dataList = useMemo(() => {
    return generateList(deptTree);
  }, [deptTree]);

  const onSelect: TreeProps['onSelect'] = (selectedKeys, _info) => {
    const key = selectedKeys?.[0];
    if (key === params.deptId || !key) {
      setParams(prevState => {
        const { deptId, ...rest } = prevState;
        return rest;
      });
      setSelectedRowKeys([]);
    } else {
      setParams(prevState => ({ ...prevState, deptId: key }));
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  };

  // 输入框变化时过滤树
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchValue(value);
    const newExpandedKeys = dataList
      .map((item) => {
        if (item.title && searchValue && item.title.indexOf(searchValue) > -1) {
          return getParentKey(item.key, deptTree);
        }
        return null;
      })
      .filter((item, i, self): item is React.Key => !!(item && self.indexOf(item) === i));

    setExpandedKeys(newExpandedKeys);
    setAutoExpandParent(true);
  };

  const onExpand = (keys: React.Key[]) => {
    setExpandedKeys(keys);
    setAutoExpandParent(false);
  };

  const toEditSelected = () => {
    if (editDisabled) return;
    if (!selectedRows || selectedRows.length !== 1) return;
    toEdit(selectedRows[0]);
  }

  const toDeleteBatch = () => {
    if (deleteDisabled) return;
    if (!selectedRowKeys || selectedRowKeys.length === 0) return;
    void toBatchDelete(selectedRowKeys as (string | number)[], true);
  }

  const toResetPassword = (user: SysUser) => {
    updateState('/system/user', {
      editData: { ...user }
    });
    setPasswordVisible(true);
  }

  const toAssignRole = (user: SysUser) => {
    updateState('/system/user', {
      editData: { ...user }
    });
    setRoleVisible(true);
  }

  const toImportUser = () => {
    setUserImportVisible(true);
  }

  const handleSetSuper = (user: SysUser) => {
    const isSuper = !user.superAdmin;
    Modal.confirm({
      title: '确认操作',
      content: `您确定要将用户 [${user.realName || user.username}] ${isSuper ? '设为' : '取消'}超级管理员吗？`,
      onOk: async () => {
        try {
          await setSuperAdmin(user.id!, isSuper);
          message.success('操作成功');
          actionRef.current?.reload();
        } catch (error) {
          // 错误由全局拦截器处理
        }
      }
    });
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
    const loop = (tree: any[]): any[] =>
      tree
        .map((item) => {
          const strTitle = item.name as string;
          const index = strTitle.indexOf(searchValue);
          const beforeStr = strTitle.substring(0, index);
          const afterStr = strTitle.slice(index + searchValue.length);
          const title =
            index > -1 ? (
              <span key={item.id}>
                {beforeStr}
                <span className="text-red-500">{searchValue}</span>
                {afterStr}
              </span>
            ) : (
              <span key={item.id}>{strTitle}</span>
            );
          if (item.children) {
            return { ...item, title, key: item.id, children: loop(item.children) };
          }
          return {
            ...item,
            title,
            key: item.id
          };
        });
    return loop(deptTree);
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
          // 预处理数据，确保 key 和 title 存在
          const processData = (data: any[]): any[] => {
            return data.map(item => ({
              ...item,
              key: item.id,
              title: item.name,
              children: item.children ? processData(item.children) : undefined
            }));
          };
          const normalizedData = processData(res.data);
          setDeptTree(normalizedData);
          const keys = getTreeKeys(normalizedData);
          setExpandedKeys(keys);
        }
      })
  }, []);

  useEffect(() => {
    if (state.shouldRefresh) {
      actionRef.current?.reload();
      setShouldRefresh(false); // 重置标志位
      setSelectedRowKeys([]);
      setSelectedRows([]);
    }
  }, [state.shouldRefresh]);

  return (
    <>
      <ProPageContainer className={'pt-1'}>
        <Splitter style={{ height: 800 }}>
          <Splitter.Panel defaultSize="20%" min="12%" max="40%">
            <Flex vertical className={'p-2 bg-white h-full'}>
              <Input.Search placeholder={'请输入部门搜索'}
                onChange={onChange}
              />
              <Tree
                defaultExpandAll
                autoExpandParent={autoExpandParent}
                expandedKeys={expandedKeys}
                className={'mt-2 overflow-y-auto flex-grow'}
                onSelect={onSelect}
                onExpand={onExpand}
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
              form={{ span: 8 }}
              cardProps={{ variant: 'borderless' } as any}
              search={{
                collapseRender: false, // 完全移除折叠按钮
                defaultCollapsed: false // 默认不折叠
              }}
              loading={{ spinning: loading, tip }}
              toolbar={{
                title:
                  <Space>
                    {
                      // hasPermission('system:user:add') &&
                      <Button color={'primary'}
                        icon={<PlusOutlined />}
                        variant={'outlined'}
                        size={'small'}
                        onClick={toCreate}
                      >新建</Button>
                    }
                    {
                      // hasPermission('system:user:edit') &&
                      <Button color={"green"}
                        icon={<EditOutlined />}
                        disabled={editDisabled}
                        size={'small'}
                        variant={'outlined'}
                        onClick={toEditSelected}
                      >修改</Button>
                    }
                    {
                      // hasPermission('system:user:remove') &&
                      <Button color={"danger"}
                        icon={<DeleteOutlined />}
                        disabled={deleteDisabled}
                        size={'small'}
                        variant={'outlined'}
                        onClick={toDeleteBatch}
                      >删除</Button>
                    }

                    {
                      // hasPermission('system:user:import') &&
                      <Button color={"purple"}
                        icon={<UploadOutlined />}
                        size={'small'}
                        variant={'outlined'}
                        onClick={toImportUser}
                      >导入</Button>
                    }
                    {
                      // hasPermission('system:user:export') &&
                      <Button color={"orange"}
                        icon={<ExportOutlined />}
                        size={'small'}
                        variant={'outlined'}
                        onClick={toExportUser}
                      >导出</Button>
                    }

                  </Space>
              }}
              request={
                async (params = {}) => {
                  const { createTimeRange, ...rest } = params;
                  if (createTimeRange) {
                    const [beginTime, endTime] = createTimeRange;
                    params = { ...rest, beginTime, endTime };
                  }
                  return fetchPage(params);
                }
              }
              pagination={{
                showSizeChanger: true,
                showQuickJumper: true,
                pageSizeOptions: ['10', '20', '50', '100'],
                defaultPageSize: 20,
              }}
            />
          </Splitter.Panel>
        </Splitter>
      </ProPageContainer>
      <UserDetailDialog title={state?.dialogTitle} open={state?.dialogVisible || false} onOpenChange={setDialogVisible} />
      <PasswordDialog title={'重置用户密码'} open={passwordVisible} onOpenChange={setPasswordVisible} />
      <RoleDialog title={'分配角色'} open={roleVisible} onOpenChange={setRoleVisible} />
      <UserImportDialog title={'用户导入'} open={userImportVisible} onOpenChange={setUserImportVisible} onReload={() => actionRef.current?.reload()} />
    </>
  )
}

export default Index;
