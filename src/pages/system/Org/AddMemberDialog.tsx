/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
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

import { addMembers, findUserPage } from "@/apis";
import GenderIcon from "@/components/icons/GenderIcon";
import { Button, Col, Input, message, Modal, ModalProps, PaginationProps, Row, Table } from "antd";
import { TableRowSelection } from "antd/es/table/interface";
import { AnyObject } from "antd/es/_util/type";
import React, { useEffect, useState } from 'react';


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
      dataIndex: 'realName',
      key: 'realName',
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
        setSelectedRowKeys([]);
        setSelectedRows([]);
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
      pageNumber: (pagination?.current || pageNumber) - 1, // Fix: Frontend 1-based to Backend 0-based
      pageSize: pagination?.pageSize || pageSize,
      keyword,
      excludeDeptId: departmentId
    }

    findUserPage(params)
      .then(res => {
        const data = res.data;
        setTotal(data?.totalElements || 0);
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

  const onCancel = (_e?: any) => {
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
      setKeyword('');
      setSelectedRowKeys([]);
      setSelectedRows([]);
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
