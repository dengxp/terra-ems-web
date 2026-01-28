import React, { useEffect, useState } from 'react';
import useCrud from "@/hooks/common/useCrud";
import { message, PaginationProps, Table, TableColumnProps } from "antd";
import { getAuthRole, updateAuthRole } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { ProFormText } from "@ant-design/pro-components";


type Props = ProModalFormProps;

const RoleDialog = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState('正在加载数据...');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
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
      dataIndex: 'roleId',
      key: 'roleId'
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
    getAuthRole(state.editData?.id)
      .then(res => {
        const roles = res.data.roles;
        setDataSource(roles);
        const selectedKeys = roles
          .filter((item: Record<string, any>) => item.flag)
          .map((item: Record<string, any>) => item.roleId);
        setSelectedRowKeys(selectedKeys);
        setLoading(false);
      })
  }

  const onSelectChange = (keys: React.Key[]) => {
    setSelectedRowKeys(keys);
  }

  const onFinish = async (values: Record<string, any>) => {
    try {
      setLoading(true);
      const userId = values.id;
      const roleIds = selectedRowKeys.join(',');
      const result = await updateAuthRole(userId, roleIds);
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
      <ProFormText label={'用户昵称'} name={'nickname'}
        fieldProps={{ disabled: true }}
      />
      <Table columns={column}
        rowKey={'roleId'}
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
