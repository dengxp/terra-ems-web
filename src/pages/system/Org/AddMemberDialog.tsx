import React, { useEffect, useState } from 'react';
import { Button, Col, Input, Modal, ModalProps, PaginationProps, Row, message, Table } from "antd";
import GenderIcon from "@/components/icons/GenderIcon";
import { TableRowSelection } from "antd/es/table/interface";
import { AnyObject } from "antd/es/_util/type";
import { addMembers, findUsersWithoutDepartment } from "@/apis";


type Props = Omit<ModalProps, 'onCancel'> & {
  departmentId: number;
  onAddMembers?: (members: AnyObject[]) => void;
  onOpenChange?: (visible: boolean) => void;
}

function AddMemberDialog(props: Props) {
  const [users, setUsers] = useState<SysUser[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<AnyObject[]>([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [tip, setTip] = useState('正在加载数据...');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);

  const { departmentId, ...rest } = props;

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '用户姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      render: (value: any) => <GenderIcon value={value} />
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    }
  ];

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRows: AnyObject[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  const rowSelection: TableRowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onFinish = async () => {
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      // messageApi.success('您未选择任何用户');
      message.error('您未选择任何用户');
      return;
    }

    setLoading(true);
    setTip('正在添加成员...');
    addMembers(departmentId, selectedRowKeys as number[])
      .then(res => {
        message.success(res.message);
        props.onAddMembers?.(selectedRows);
        props.onOpenChange?.(false);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }

  const handleSearch = () => {
    setPageNumber(1);
    handleTableChange();
  }

  const handleTableChange = (pagination?: PaginationProps) => {
    setLoading(true);
    setTip('正在加载数据...');
    const params = {
      pageNumber: pagination?.current || pageNumber,
      pageSize: pagination?.pageSize || pageSize,
      keyword
    }

    findUsersWithoutDepartment(params)
      .then(res => {
        const data = res.data;
        setTotal(data?.totalElement || 0);
        setUsers(data?.content || []);
        setPageNumber(pagination?.current || pageNumber);
        setPageSize(pagination?.pageSize || pageSize);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      })
  }

  const onCancel = (e?: any) => {
    setKeyword('');
    setSelectedRows([]);
    setSelectedRowKeys([]);
    props?.onOpenChange?.(false);
  }

  const onChange = (value: string) => {
    setKeyword(value);
  }; // 1000毫秒的防抖时间

  useEffect(() => {
    if (props.open) {
      handleTableChange();
    }
  }, [props.open]);

  useEffect(() => {
    handleSearch();
  }, [keyword]);

  return (
    <Modal {...rest} title={'添加成员'} centered width={800}
      onCancel={(e) => onCancel(e)}
      onOk={onFinish}
    >
      <div className={'pt-2'}>
        <Row gutter={8}>
          <Col flex={1}>
            <Input placeholder={'输入关键字搜索'} className={'w-full'} value={keyword}
              onChange={(e) => onChange(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Button type={'primary'} onClick={() => handleSearch()}>查询</Button>
          </Col>
        </Row>
        <Table columns={columns} size={'small'}
          rowKey={'id'}
          rowSelection={rowSelection}
          dataSource={users}
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
          scroll={{ y: 440 }}
          className={'h-full'}
          onChange={handleTableChange}
          loading={{ spinning: loading, tip }}
        />
      </div>
    </Modal>
  )
    ;
}

export default AddMemberDialog;
