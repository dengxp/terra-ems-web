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

import { findOptionsForDepartmentManager } from "@/apis";
import ProFormDeptSelect from "@/components/select/ProFormDeptSelect";
import ProFormDictSelect from "@/components/select/ProFormDictSelect";
import ProFormRemoteSearchSelect from "@/components/select/ProFormRemoteSearchSelect";
import { OperationEnum } from "@/enums";
import { ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import React from 'react';

/**
 * 部门表单公共字段组件
 */
const DeptFormFields: React.FC<{
    departmentId?: number;
    operation?: string;
    isSubDept?: boolean;
}> = ({ departmentId, operation, isSubDept }) => {

    const fetchOptionsForDepartmentManager = async (value: string) => {
        const result = await findOptionsForDepartmentManager(departmentId, value);
        return result.data || [];
    }

    const isEdit = operation === OperationEnum.EDIT;

    return (
        <>
            <ProFormText
                label={'部门名称'}
                name={'name'}
                placeholder={'请输入部门名称'}
                labelCol={{ span: 3 }}
                rules={[
                    {
                        required: true,
                        message: '部门名称不能为空'
                    }
                ]}
            />
            <ProFormDeptSelect
                label={'上级部门'}
                name={'parentId'}
                colProps={{ span: 12 }}
                excludeId={isEdit ? departmentId : undefined}
                disabled={isSubDept}
            />
            <ProFormRemoteSearchSelect
                label={'部门负责人'}
                name={'managerId'}
                colProps={{ span: 12 }}
                preload={true}
                fetchOptions={fetchOptionsForDepartmentManager}
            />
            <ProFormDictSelect
                label={'状态'}
                name={'status'}
                dickey={'status'}
                colProps={{ span: 12 }}
                placeholder={'请选择状态'}
            />
            <ProFormDigit
                label={'显示排序'}
                name={'sortOrder'}
                min={0}
                max={1000}
                colProps={{ span: 12 }}
            />
            <ProFormTextArea
                label={'部门介绍'}
                name={'description'}
                placeholder={'请输入部门介绍信息'}
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
            />
        </>
    );
};

export default DeptFormFields;
