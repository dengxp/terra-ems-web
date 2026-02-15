import { findDeptTree } from "@/apis";
import { IconButton } from "@/components/button";
import { ProPageContainer } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import { ReactComponent as MoveTo } from '@/icons/svg/move-to.svg';
import DepartmentPanel from "@/pages/system/Org/DepartmentPanel";
import DetailPanel from "@/pages/system/Org/DetailPanel";
import MoveDepartmentDialog from "@/pages/system/Org/MoveDepartmentDialog";
import { findNode, getTreeKeys } from "@/utils";
import Icon, { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Flex, message, Splitter, Tree } from "antd";
import React, { useEffect, useState } from 'react';

type Props = {}
const Index = (_props: Props) => {
  const [departmentId, setDepartmentId] = useState<number | undefined>();
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [deptTree, setDeptTree] = useState<SysDept[]>([]);
  const [department, setDepartment] = useState<Record<string, any> | undefined>();
  const [messageApi, contextHolder] = message.useMessage();
  const [moveVisible, setMoveVisible] = useState(false);

  const {
    getState,
    updateState,
    toCreate,
    toEdit,
    toDelete,
    setShouldRefresh
  } = useCrud<SysDept>({
    pathname: '/system/org',
    entityName: '部门',
    baseUrl: '/api/system/dept'
  });

  const state = getState('/system/org');

  const handleCreate = () => {
    updateState('/system/org', {
      editData: { id: departmentId }
    });
    toCreate();
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
      setDepartmentId(keys[0] as number);
      updateState('/system/org', {
        editData: { ...selectedNodes[0] }
      });
      setDepartment({ ...selectedNodes[0] });
    }
  }

  const loadDeptTree = () => {
    return new Promise((resolve, reject) => {
      findDeptTree()
        .then(res => {
          setDeptTree(res.data);
          const keys = getTreeKeys(res.data);
          setExpandedKeys(keys);
          if (selectedKeys && selectedKeys.length > 0 && departmentId) {
            const node = findNode(res.data, departmentId);
            if (node) {
              setSelectedKeys([node.key]);
              setDepartmentId(node.key);
              setDepartment({ ...node });
              resolve(undefined);
              return;
            }
          }
          if (res.data) {
            setSelectedKeys([res.data[0].id as React.Key]);
            setDepartmentId(res.data[0].id);
            setDepartment({ ...res.data[0] });
          }

          resolve(undefined);
        })
        .catch(err => {
          reject(err);
        })
    })
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
      <ProPageContainer className={'pt-1'}>
        {contextHolder}
        <Splitter style={{ height: 640, boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)' }}>
          <Splitter.Panel defaultSize="20%" min="12%" max="40%"
            style={{
              backgroundColor: '#fff',
              display: 'flex',
              flexGrow: 1,
              flexDirection: 'column',
              height: '100%'
            }}>
            <Tree.DirectoryTree selectedKeys={selectedKeys}
              expandedKeys={expandedKeys}
              defaultExpandAll={true}
              autoExpandParent={true}
              selectable
              showLine
              onExpand={(keys) => setExpandedKeys(keys)}
              treeData={deptTree as any}
              fieldNames={{ title: 'name', key: 'id', children: 'children' }}
              onSelect={onSelect}
              rootClassName={'overflow-y-auto flex-1 p-2'}
            />
            <Flex align={'center'} justify={'space-around'} rootClassName={'py-2 border-t bg-gray-100'}>
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
          <Splitter.Panel style={{ backgroundColor: '#fff' }}>
            <Flex vertical justify={'center'} rootClassName={'h-full'}>
              {
                state.dialogVisible && <DetailPanel /> ||
                <DepartmentPanel department={department as SysDept} />
              }
            </Flex>
          </Splitter.Panel>
        </Splitter>
      </ProPageContainer>
      {department &&
        <MoveDepartmentDialog department={department as any} treeData={deptTree as any}
          open={moveVisible} onOpenChange={setMoveVisible}
        />
      }
    </>
  )
}

export default Index;
