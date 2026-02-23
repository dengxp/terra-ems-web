import { findUserById, updateUserRoles, findRoleList } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormText } from "@ant-design/pro-components";
import { message, PaginationProps, Table, TableColumnProps } from "antd";
import React, { useEffect, useState } from 'react';


type Props = ProModalFormProps;

const RoleDialog = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [tip] = useState('正在加载数据...');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [total] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10000);

  const [messageApi, contextHolder] = message.useMessage();
  const {
    form,
    getState
  } = useCrud<SysUser>({
    pathname: '/system/user',
    entityName: '用户',
    baseUrl: '/api/system/user',
  });

  const state = getState('/system/user');

  const column: TableColumnProps[] = [
    {
      title: '角色编号',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName'
    },
    {
      title: '权限字符',
      dataIndex: 'roleKey',
      key: 'roleKey'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    }
  ];

  const handleTableChange = (pagination?: PaginationProps) => {
    setLoading(true);
    if (pagination) {
      setPageNumber(prevState => (pagination?.current || prevState));
      setPageSize(prevState => (pagination?.pageSize || prevState));
    }

    // 1. 获取所有可选角色
    const fetchRoles = findRoleList();
    // 2. 获取当前用户已拥有的角色
    const fetchUser = findUserById(state.editData?.id);

    Promise.all([fetchRoles, fetchUser])
      .then(([roleRes, userRes]) => {
        const allRoles = roleRes.data || [];
        const userRoleIds = userRes.data?.roleIds || [];

        setDataSource(allRoles);
        setSelectedRowKeys(userRoleIds);
        setLoading(false);
      })
      .catch(err => {
        message.error(err.message || '加载失败');
        setLoading(false);
      });
  }

  const onSelectChange = (keys: React.Key[]) => {
    setSelectedRowKeys(keys);
  }

  const onFinish = async (values: Record<string, any>) => {
    try {
      setLoading(true);
      const userId = values.id;
      const roleIds = selectedRowKeys;
      const result = await updateUserRoles(userId, roleIds as number[]);
      void messageApi.success(result.message || '操作成功');
      props.onOpenChange?.(false);
    } catch (error: any) {
      void messageApi.error(error.message || '操作失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  }

  useEffect(() => {
    if (props.open) {
      form.setFieldsValue({ ...state.editData });
      if (state.editData?.id) {
        handleTableChange();
      }
    }
  }, [props.open, state.editData]);

  return (
    <ProModalForm {...props}
      form={form}
      title={'分配角色'}
      onFinish={onFinish}
    >
      {contextHolder}
      <ProFormText label={'id'} name={'id'} hidden />
      <ProFormText label={'登录账号'} name={'username'}
        fieldProps={{ disabled: true }}
      />
      <ProFormText label={'用户姓名'} name={'realName'}
        fieldProps={{ disabled: true }}
      />
      <Table columns={column}
        rowKey={(record) => record.id || record.roleId}
        rowSelection={rowSelection}
        dataSource={dataSource}
        loading={{ spinning: loading, tip }}
        onChange={handleTableChange}
        pagination={{
          current: pageNumber,
          pageSize,
          total,
          onChange: (page, pageSize) => {
            setPageNumber(page);
            setPageSize(pageSize);
          },
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            setPageNumber(current);
          }
        }}
      />
    </ProModalForm>
  )
    ;
}

export default RoleDialog;
