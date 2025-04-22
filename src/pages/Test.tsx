import React, { useState } from 'react';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Button, Table } from 'antd';

const dataSource = [
  { key: '1', name: '张三', age: 32 },
  { key: '2', name: '李四', age: 28 },
];

const columns = [
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '年龄', dataIndex: 'age', key: 'age' },
];

export default () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setModalOpen(true)}>
        打开弹窗
      </Button>

      <ModalForm
        title="带表格的表单"
        open={modalOpen}
        onOpenChange={setModalOpen}
        onFinish={async (values) => {
          console.log('表单提交:', values);
          return true;
        }}
      >
        <ProFormText
          name="title"
          label="标题"
          placeholder="请输入标题"
          rules={[{ required: true, message: '标题是必填项' }]}
        />

        {/* 这里就是嵌入的 Table */}
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          size="small"
          style={{ marginTop: 16 }}
        />
      </ModalForm>
    </>
  );
};
