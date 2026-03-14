/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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

import { ProDescriptions } from "@ant-design/pro-components";
// import MemberPanel from "./MemberPanel";

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
        {/* MemberPanel moved to parent component */}
      </div>
    </div>
  );
}

export default DepartmentPanel;
