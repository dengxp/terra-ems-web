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
