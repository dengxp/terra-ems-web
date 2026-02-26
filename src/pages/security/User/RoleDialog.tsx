import { findRoleList, findUserById, updateUserRoles } from "@/apis";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { DataItemStatus } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import { Badge, Empty, message, Space, Tag, Transfer, Typography } from "antd";
import type { TransferItem } from "antd/es/transfer";
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

type Props = ProModalFormProps;

interface RoleTransferItem extends TransferItem {
  code: string;
  status: DataItemStatus;
}

const RoleDialog = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<RoleTransferItem[]>([]);
  const [currentUser, setCurrentUser] = useState<SysUser | null>(null);

  const {
    form,
    getState,
    setShouldRefresh
  } = useCrud<SysUser>({
    pathname: '/system/user',
    entityName: '用户',
    baseUrl: '/api/system/user',
  });

  const state = getState('/system/user');

  const fetchData = async () => {
    if (!state.editData?.id) return;
    setLoading(true);
    try {
      const [roleRes, userRes] = await Promise.all([
        findRoleList(),
        findUserById(state.editData.id)
      ]);

      const allRoles = roleRes.data || [];
      const userRoleIds = userRes.data?.roleIds || [];

      const transferData: RoleTransferItem[] = allRoles.map(role => ({
        key: String(role.id),
        title: role.name || '',
        code: role.code || '',
        status: role.status as DataItemStatus,
        description: role.remark,
        disabled: role.status === DataItemStatus.FORBIDDEN
      }));

      setDataSource(transferData);
      setCurrentUser(userRes.data || null);
      setTargetKeys(userRoleIds.map(id => String(id)));
    } catch (err: any) {
      void message.error(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async () => {
    if (!state.editData?.id) return false;
    try {
      setLoading(true);
      const roleIds = targetKeys.map(key => Number(key));
      await updateUserRoles(state.editData.id, roleIds);
      void message.success('角色分配成功');
      setShouldRefresh(true);
      props.onOpenChange?.(false);
      return true;
    } catch (error: any) {
      void message.error(error.message || '分配失败');
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (props.open) {
      fetchData();
    }
  }, [props.open, state.editData?.id]);

  /**
   * 专业化标题设计：分层展示操作目标与关键审计信息
   */
  const modalTitle = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Space size={8}>
        <Text strong style={{ fontSize: 18 }}>分配角色</Text>
        {currentUser && (
          <>
            <Text type="secondary" style={{ fontSize: 18, fontWeight: 300 }}>·</Text>
            <Text strong style={{ fontSize: 18, color: '#1677ff' }}>{currentUser.realName}</Text>
          </>
        )}
      </Space>
      {currentUser && (
        <Space split={<Text type="secondary" style={{ opacity: 0.5 }}>|</Text>} style={{ fontSize: 12, opacity: 0.85 }}>
          <Text type="secondary">账号：<Text>{currentUser.username}</Text></Text>
          <Text type="secondary">部门：<Tag bordered={false} color="blue" style={{ margin: 0, fontSize: 11, verticalAlign: 'middle', lineHeight: '18px' }}>{currentUser.departmentName || '无'}</Tag></Text>
        </Space>
      )}
    </div>
  );

  return (
    <ProModalForm
      {...props}
      form={form}
      title={modalTitle}
      onFinish={onFinish}
      width={820}
      modalProps={{
        destroyOnClose: true,
        centered: true,
        bodyStyle: { padding: '24px 32px 32px' }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Transfer
          dataSource={dataSource}
          titles={['可分配角色', '已分配角色']}
          targetKeys={targetKeys}
          onChange={(nextTargetKeys) => setTargetKeys(nextTargetKeys)}
          render={(item) => (
            <Space size={4}>
              <Text strong={targetKeys.includes(item.key)} style={{ color: targetKeys.includes(item.key) ? '#1677ff' : 'inherit' }}>
                {item.title}
              </Text>
              <Text type="secondary" style={{ fontSize: 11, opacity: 0.6 }}>[{item.code}]</Text>
              {item.status === DataItemStatus.FORBIDDEN && (
                <Badge status="error" title="角色已禁用" />
              )}
            </Space>
          )}
          listStyle={{
            width: 340,
            height: 480,
            borderRadius: 8,
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            background: '#ffffff'
          }}
          operations={['', '']} // 精简箭头模式
          showSearch
          filterOption={(inputValue, item) =>
            (item.title || '').indexOf(inputValue) !== -1 || (item.code || '').indexOf(inputValue) !== -1
          }
          locale={{
            itemUnit: '项',
            itemsUnit: '项',
            searchPlaceholder: '快速搜索名称/编码',
            notFoundContent: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无角色数据" />
          }}
        />
      </div>
    </ProModalForm>
  );
};

export default RoleDialog;
