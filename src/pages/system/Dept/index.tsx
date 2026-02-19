import { DeleteButton, EditButton, IconButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import StatusIcon from "@/components/icons/StatusIcon";
import useCrud from "@/hooks/common/useCrud";
import DeptDetailDialog from "@/pages/system/Dept/DeptDetailDialog";
import { useAccess } from "@@/exports";
import {
  NodeCollapseOutlined, NodeExpandOutlined, PlusCircleFilled,
  PlusOutlined,
  UserOutlined
} from "@ant-design/icons";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { useModel } from "@umijs/max";
import { Button, Space, message } from "antd";
import React, { useEffect, useState, useRef } from 'react';
import { getDeptTree, SysDept } from "@/apis/dept";
import DeptMemberDialog from "./DeptMemberDialog";

const Index = () => {
  const [params] = useState<Record<string, any>>({});
  const [expand, setExpand] = useState(true);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const { optionMap } = useModel('constantModel');
  const [memberDialogVisible, setMemberDialogVisible] = useState(false);
  const [currentDept, setCurrentDept] = useState<SysDept>();

  const {
    getState,
    formRef,
    actionRef,
    toCreate,
    toEdit,
    toDelete,
    setDialogVisible,
    setShouldRefresh,
    updateState
  } = useCrud<SysDept>({
    entityName: '部门',
    pathname: '/system/dept',
    baseUrl: '/api/system/dept'
  });

  const state = getState('/system/dept');

  const handleCreate = (parentId?: number) => {
    toCreate({ parentId });
  }

  const handleMemberManage = (record: SysDept) => {
    setCurrentDept(record);
    setMemberDialogVisible(true);
  }

  // 递归获取所有 Key
  const getTreeKeys = (treeData: SysDept[]) => {
    const keys: React.Key[] = [];
    function traverse(nodes: SysDept[]) {
      nodes.forEach(node => {
        if (node.id) keys.push(node.id);
        if (node.children) traverse(node.children);
      })
    }
    traverse(treeData);
    return keys;
  };

  const columns: ProColumns<SysDept>[] = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      fieldProps: {
        placeholder: '请输入部门名称'
      }
    },
    {
      title: '成员数量',
      dataIndex: 'memberCount',
      key: 'memberCount',
      hideInSearch: true,
      width: 100,
      align: 'center',
      render: (count, row) => (
        <span
          style={{ fontWeight: 'bold', color: '#1890ff', cursor: 'pointer' }}
          onClick={() => handleMemberManage(row)}
        >
          {count || 0}
        </span>
      )
    },
    {
      title: '负责人',
      dataIndex: 'managerName',
      key: 'managerName',
      hideInSearch: true,
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      valueType: 'select',
      fieldProps: {
        placeholder: '请选择状态',
        options: optionMap.status
      },
      render: (_: any, row: any) => {
        return <StatusIcon value={row.status} />
      }
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      hideInSearch: true,
      width: 160,
    },
    {
      title: '操作',
      dataIndex: 'actions',
      key: 'actions',
      hideInSearch: true,
      fixed: 'right',
      width: 180,
      render: (_: any, row: any) => {
        return (
          <Space>
            <IconButton icon={<UserOutlined />} tooltip={'成员管理'}
              onClick={() => handleMemberManage(row)}
            />
            <IconButton icon={<PlusCircleFilled />} tooltip={'新增下级部门'}
              onClick={() => handleCreate(row.id)}
            />
            <EditButton onClick={() => toEdit(row)} />
            {
              (!row.children || row.children.length === 0) &&
              <DeleteButton onConfirm={async () => {
                await toDelete(row.id, true);
              }} />
            }
          </Space>
        )
      }
    }
  ];

  const onExpandToggle = () => {
    // 这种全量树的展开/折叠，通常需要操作 expandedRowKeys
    // 但 ProTable 的 defaultExpandAllRows 只在初始化有效
    // 我们可以通过 ref 或者 data 重新计算 keys
    if (expand) {
      // 收起
      setExpandedRowKeys([]);
    } else {
      // 展开 - 由于 TreeData 在闭包外或者 ref 中较难获取，这里简化为只 toggle 状态
      // 更好的做法是保存 tableData Ref
      // 暂时先触发 reload 来重置（如果 defaultExpandAll 开启）
      // 或者不处理，因为全量加载后 ProTable 自带的展开/收起按钮已经够用
      // 但这里我们实现一个简单的 "全部展开" 逻辑: 获取当前 table 数据
      // 由于 API 每次都返回 tree，我们可以 setExpandedRowKeys 为所有 keys
      actionRef.current?.reload();
    }
    setExpand(!expand);
  }

  useEffect(() => {
    if (state.shouldRefresh) {
      actionRef.current?.reload();
      setShouldRefresh(false);
    }
  }, [state.shouldRefresh]);

  return (
    <>
      <ProPageContainer className={'pt-1'}>
        <ProTable<SysDept>
          columns={columns}
          rowKey={'id'}
          formRef={formRef}
          actionRef={actionRef}
          params={params}
          pagination={false} // 关闭分页
          form={{ span: 8 }}
          cardProps={{ variant: 'borderless' } as any}
          search={{
            defaultCollapsed: false
          }}
          loading={state.loading}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
          }}
          toolbar={{
            title:
              <Space>
                <Button color={'primary'}
                  icon={<PlusOutlined />}
                  variant={'outlined'}
                  size={'small'}
                  onClick={() => handleCreate()}
                >新建</Button>

                <Button color={"green"}
                  icon={expand ? <NodeCollapseOutlined /> : <NodeExpandOutlined />}
                  size={'small'}
                  variant={'outlined'}
                  onClick={() => {
                    // 简单的逻辑：如果是展开状态，就清空 key；如果是折叠状态，重新加载(配合 onLoad 自动展开) 或者需要遍历数据
                    // 鉴于 TreeData 这里没有直接暴露，最简单是清空。
                    // 若要全部展开，需要在 request 回调里处理。
                    if (expand) {
                      setExpandedRowKeys([]);
                    } else {
                      // 触发表格刷新，request 中会重新计算并设置 keys
                      actionRef.current?.reload();
                    }
                    setExpand(!expand);
                  }}
                >{expand ? '折叠' : '展开'}</Button>
              </Space>
          }}
          request={async (params) => {
            const res = await getDeptTree();
            let data = res.data || [];

            const filterTreeByParams = (nodes: SysDept[], name?: string, status?: any): SysDept[] => {
              return nodes.map(node => {
                const nameMatch = name ? node.name.includes(name) : true;
                const statusMatch = status !== undefined && status !== null ? node.status === status : true;
                const children = node.children ? filterTreeByParams(node.children, name, status) : [];

                if ((nameMatch && statusMatch) || children.length > 0) {
                  return { ...node, children };
                }
                return null;
              }).filter(n => n !== null) as SysDept[];
            }

            if (params.name || params.status !== undefined) {
              data = filterTreeByParams(data, params.name, params.status);
            }

            if (expand) {
              setExpandedRowKeys(getTreeKeys(data));
            }

            return {
              data: data,
              success: true,
            };
          }}
        />
      </ProPageContainer>
      <DeptDetailDialog title={state?.dialogTitle} open={state?.dialogVisible} onOpenChange={setDialogVisible} />
      <DeptMemberDialog
        open={memberDialogVisible}
        onOpenChange={setMemberDialogVisible}
        departmentId={currentDept?.id}
        departmentName={currentDept?.name}
        onRefresh={() => actionRef.current?.reload()}
      />
    </>
  )
}

export default Index;
