import React from 'react';
import MemberPanel from "./MemberPanel";
import { ProDescriptions } from "@ant-design/pro-components";

type Props = {
  department?: SysDept
}

function DepartmentPanel({ department }: Props) {
  return (
    <div className={'h-full'}>
      <ProDescriptions column={2} title={<div className={'pb-2 border-b'}>部门信息</div>} className={'px-2 py-4'}>
        <ProDescriptions.Item valueType={'text'} label={'部门名称'}>{department?.name}</ProDescriptions.Item>
        <ProDescriptions.Item valueType={'text'} label={'负责人'}>{department?.managerName}</ProDescriptions.Item>
        <ProDescriptions.Item valueType={'text'} label={'成员数量'}>{department?.memberCount}</ProDescriptions.Item>
        <ProDescriptions.Item valueType={'text'} label={'上级部门'}>{department?.parentName}</ProDescriptions.Item>
        <ProDescriptions.Item valueType={'text'} label={'部门介绍'} span={2}>
          {department?.description}
        </ProDescriptions.Item>
      </ProDescriptions>

      <div className={'mt-4'}>
        {
          department?.id &&
          <MemberPanel departmentId={department.id} />
        }
      </div>
    </div>
  );
}

export default DepartmentPanel;
