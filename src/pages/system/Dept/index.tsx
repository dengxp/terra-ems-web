import React, {useCallback, useEffect, useState} from 'react';
import {ProPageContainer} from "@/components/container";
import {Button, Space} from "antd";
import {
  NodeCollapseOutlined, NodeExpandOutlined, PlusCircleFilled,
  PlusOutlined,
} from "@ant-design/icons";
import {ProColumns, ProTable} from "@ant-design/pro-components";
import {findDeptTreeByCondition} from "@/apis";
import useCrud from "@/hooks/common/useCrud";
import {useAccess} from "@@/exports";
import {useModel} from "@umijs/max";
import {wrapperResult} from "@/utils";
import DeptDetailDialog from "@/pages/system/Dept/DeptDetailDialog";
import StatusIcon from "@/components/icons/StatusIcon";
import {DeleteButton, EditButton, IconButton} from "@/components/button";
import {SysDepartment} from "@/types";

const Index = () => {
  const [params, setParams] = useState<Record<string, any>>({});
  const [expand, setExpand] = useState(true);
  const [defaultExpandedRowKeys, setDefaultExpandedRowKeys] = useState<React.Key[]>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [tip, setTip] = useState('正在处理中，请稍等...');
  const {optionMap, mapMaps} = useModel('constantModel');

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
  } = useCrud<SysDepartment>({
    entityName: '部门',
    pathname: '/system/dept',
    baseUrl: '/api/system/dept'
  });

  const {hasPermission} = useAccess();
  // const dictMap = useDict('sys_normal_disable');
  const state = getState('/system/dept');

  const handleCreate = (parentId?: number) => {
    updateState('/system/dept', {
      editData: {parentId}
    });
    toCreate();
  }

  const getTreeKeys = (treeData: SysDepartment[]) => {
    const keys: React.Key[] = [];

    function traverse(nodes: SysDepartment[]) {
      nodes.forEach(node => {
        if (node.id) {
          keys.push(node.id);
        }
        if (node.children) {
          traverse(node.children)
        }
      })
    }

    traverse(treeData);
    return keys;
  };

  const fetchDeptTreeWithParams = useCallback(async (params: Record<string, any>) => {
    const result = await findDeptTreeByCondition(params);
    const data = result?.data?.content || [];
    const keys = getTreeKeys(data);
    setDefaultExpandedRowKeys(keys);
    setExpandedRowKeys(keys);
    return wrapperResult(result);
  }, [findDeptTreeByCondition]);

  const columns: ProColumns[] = [
    {
      title: '部门名称',
      dataIndex: 'name',
      key: 'name',
      fieldProps: {
        placeholder: '请输入部门名称'
      }
    },
    {
      title: '排序',
      dataIndex: 'ranking',
      key: 'ranking',
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
      render: (_: any, row: any) => {
        return <StatusIcon value={row.status}/>
      }
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
        return (
          <Space>
            <IconButton icon={<PlusCircleFilled/>} tooltip={'新增下级部门'}
                        onClick={() => handleCreate(row.id)}
            />
            <EditButton onClick={() => toEdit(row)}/>
            {
              (!row || !row.children || row.children.length === 0 || !row.memberCount) &&
              <DeleteButton onClick={async () => {
                await toDelete(row.id, true);
              }}/>
            }
          </Space>
        )
      }
    }
  ];

  const onExpandToggle = () => {
    const newExpanded = !expand;
    setExpandedRowKeys(newExpanded ? defaultExpandedRowKeys : []);
    setExpand(!expand);
  }

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
                  rowKey={'id'}
                  formRef={formRef}
                  actionRef={actionRef}
                  params={params}
                  tableAlertRender={false}
                  tableAlertOptionRender={false}
                  expandable={{
                    expandedRowKeys: expandedRowKeys,
                    onExpandedRowsChange: (rowKeys) => {
                      setExpandedRowKeys([...rowKeys])
                    }
                  }}
                  form={{span: 8}}
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
                          // hasPermission('system:role:add') &&
                          <Button color={'primary'}
                                  icon={<PlusOutlined/>}
                                  variant={'outlined'}
                                  size={'small'}
                                  onClick={() => handleCreate()}
                          >新建</Button>
                        }
                        {
                          // hasPermission('system:user:edit') &&
                          <Button color={"green"}
                                  icon={expand ? <NodeCollapseOutlined/> : <NodeExpandOutlined/>}
                                  size={'small'}
                                  variant={'outlined'}
                                  onClick={onExpandToggle}
                          >{expand ? '折叠' : '展开'}</Button>
                        }
                      </Space>
                  }}
                  request={
                    async (params = {}) => {
                      const {current, pageSize, ...rest} = params;
                      return fetchDeptTreeWithParams(rest);
                    }
                  }
        />
      </ProPageContainer>
      <DeptDetailDialog title={state?.dialogTitle} open={state?.dialogVisible} onOpenChange={setDialogVisible}/>
    </>
  )
}

export default Index;
