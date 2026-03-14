import { findDeptById, findDeptTree } from "@/apis";
import { IconButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import { ReactComponent as MoveTo } from '@/icons/svg/move-to.svg';
import DepartmentPanel from "@/pages/system/Org/DepartmentPanel";
import DetailPanel from "@/pages/system/Org/DetailPanel";
import MoveDepartmentDialog from "@/pages/system/Org/MoveDepartmentDialog";
import MemberPanel from "@/pages/system/Org/MemberPanel";
import { findNode, getTreeKeys } from "@/utils";
import Icon, { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { ConfigProvider, Flex, Input, message, Splitter, Tree } from "antd";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from "@umijs/max";

type Props = {}
const Index = (_props: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [departmentId, setDepartmentId] = useState<number | undefined>(
    searchParams.get('id') ? Number(searchParams.get('id')) : undefined
  );
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [deptTree, setDeptTree] = useState<SysDept[]>([]);
  const [department, setDepartment] = useState<Record<string, any> | undefined>();
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [moveVisible, setMoveVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const {
    getState,
    updateState,
    toCreate,
    toEdit,
    toDelete,
    setShouldRefresh,
    handleSaveOrUpdate,
    form,
    setDialogVisible
  } = useCrud<SysDept>({
    pathname: '/system/org',
    entityName: '部门',
    baseUrl: '/api/system/dept'
  });

  const state = getState('/system/org');

  const filteredTreeData = React.useMemo(() => {
    if (!searchValue) return deptTree;
    const filter = (data: SysDept[]): SysDept[] => {
      const result: SysDept[] = [];
      data.forEach(item => {
        const match = item.name?.toLowerCase().includes(searchValue.toLowerCase());
        const children = item.children ? filter(item.children) : [];
        if (match || children.length > 0) {
          result.push({ ...item, children });
        }
      });
      return result;
    };
    return filter(deptTree);
  }, [deptTree, searchValue]);

  const loadDeptTree = () => {
    return new Promise((resolve, reject) => {
      findDeptTree()
        .then(res => {
          setDeptTree(res.data);
          const keys = getTreeKeys(res.data, 'id');
          setExpandedKeys(keys);
          setAutoExpandParent(true);

          // Priority 1: ID from URL (initialized in state) or current state
          if (departmentId) {
            const node = findNode(res.data, departmentId);
            if (node) {
              setSelectedKeys([node.id]);
              setDepartmentId(node.id);
              setDepartment({ ...node });
              resolve(undefined);
              return;
            }
          }

          // Priority 2: Default to first node if no ID or ID not found
          if (res.data && res.data.length > 0) {
            const firstNode = res.data[0];
            if (firstNode.id) {
              setSelectedKeys([firstNode.id as React.Key]);
              setDepartmentId(firstNode.id);
              setSearchParams({ id: firstNode.id.toString() });
              setDepartment({ ...firstNode });
            }
          }

          resolve(undefined);
        })
        .catch(err => {
          reject(err);
        })
    })
  }

  const handleCreate = () => {
    toCreate({ id: departmentId });
  }

  const handleMove = () => {
    setMoveVisible(true);
  }

  const handleDelete = async () => {
    if (department && department.children?.length > 0) {
      messageApi.error('该部门下存在下级部门，无法删除');
      return;
    }

    toDelete(departmentId)
      .then(() => {
        // 删除成功后，更新 treeData，移除对应节点
        // setDeptTree((prevTreeData) => {
        //   return filterTree(prevTreeData, department?.id);
        // });
        loadDeptTree();
      })
  }

  const onSelect = (keys: React.Key[], { selectedNodes }: any) => {
    setSelectedKeys(keys);
    if (keys && keys.length > 0) {
      const id = keys[0] as number;
      setDepartmentId(id);
      setSearchParams({ id: id.toString() });
      updateState('/system/org', {
        editData: { ...selectedNodes[0] }
      });
      setDepartment({ ...selectedNodes[0] });
    }
  }

  useEffect(() => {
    if (state.shouldRefresh) {
      loadDeptTree()
        .finally(() => {
          setShouldRefresh(false);
        })
    }
  }, [state.shouldRefresh]);

  useEffect(() => {
    void loadDeptTree();
  }, []);

  return (
    <>
      <ProPageContainer>
        {contextHolder}
        <Splitter style={{
          height: '100%',
          backgroundColor: '#fff'
        }}>
          <Splitter.Panel defaultSize="20%" min="12%" max="40%"
            style={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderRight: '1px solid #f0f0f0'
            }}>
            <div style={{ padding: '8px 8px 0 8px' }}>
              <Input.Search
                placeholder="搜索部门"
                allowClear
                onSearch={setSearchValue}
                onChange={e => setSearchValue(e.target.value)}
                size="small"
              />
            </div>
            <div style={{ height: 'calc(100vh - 284px)', overflowY: 'auto', padding: '8px' }}>
              <ConfigProvider theme={{
                token: {
                  colorPrimary: '#1e40af', // 核心主色：采购蓝
                },
                components: {
                  Tree: {
                    nodeSelectedBg: '#1e40af', // 选中背景色
                    colorTextLightSolid: '#fff', // 确保反色文字为白色
                    controlItemBgActive: '#1e40af', // 选中态激活背景
                  }
                }
              }}>
                <Tree
                  selectedKeys={selectedKeys}
                  expandedKeys={expandedKeys}
                  autoExpandParent={autoExpandParent}
                  selectable
                  showLine={{ showLeafIcon: false }}
                  onExpand={(keys) => {
                    setExpandedKeys(keys);
                    setAutoExpandParent(false);
                  }}
                  treeData={filteredTreeData as any}
                  fieldNames={{ title: 'name', key: 'id', children: 'children' }}
                  onSelect={onSelect}
                />
              </ConfigProvider>
            </div>
            <Flex align={'center'} justify={'space-around'} style={{ height: 54, borderTop: '1px solid #f0f0f0', background: '#fff' }}>
              <IconButton color={'primary'} variant={'solid'}
                shape={'circle'} icon={<PlusOutlined />}
                disabled={state.dialogVisible}
                size={'middle'}
                onClick={handleCreate}
                tooltip={'新增'} />
              <IconButton color={'primary'} variant={'solid'}
                shape={'circle'} icon={<EditOutlined />}
                size={'middle'}
                onClick={() => toEdit(department as SysDept)}
                disabled={state.dialogVisible || !departmentId}
                tooltip={'编辑'} />
              <IconButton color={'primary'} variant={'solid'}
                shape={'circle'} icon={<Icon component={MoveTo} />}
                size={'middle'}
                disabled={state.dialogVisible || !departmentId}
                onClick={handleMove}
                tooltip={'移动到...'} />
              <IconButton color={'danger'} variant={'solid'}
                shape={'circle'} icon={<DeleteOutlined />}
                size={'middle'}
                onClick={handleDelete}
                tooltip={'删除'} />
            </Flex>
          </Splitter.Panel>
          <Splitter.Panel style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ height: 'calc(100vh - 198px)' }}>
              <div style={{ flexShrink: 0 }}>
                {
                  state.dialogVisible ?
                    <DetailPanel
                      form={form}
                      sysDept={state.editData as SysDept}
                      title={state.dialogTitle}
                      operation={state.operation}
                      loading={state.loading}
                      onFinish={async (values) => {
                        const data = values.id ? { ...state.editData, ...values } : { ...values };
                        await handleSaveOrUpdate(data);
                      }}
                      onCancel={() => setDialogVisible(false)}
                    /> :
                    <DepartmentPanel department={department as SysDept} />
                }
              </div>
              {!state.dialogVisible && departmentId && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <MemberPanel departmentId={departmentId}
                    onRefresh={() => {
                      loadDeptTree();
                    }}
                  />
                </div>
              )}
            </div>
          </Splitter.Panel>
        </Splitter>
      </ProPageContainer >
      {department &&
        <MoveDepartmentDialog department={department as any} treeData={deptTree as any}
          open={moveVisible} onOpenChange={setMoveVisible}
        />
      }
    </>
  );
}

export default Index;
