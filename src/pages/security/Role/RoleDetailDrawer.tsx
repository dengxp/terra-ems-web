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

import { getRole } from "@/apis";
import { ProDrawerForm } from "@/components/container";
import ProFormDictRadioGroup from "@/components/radio/ProFormDictRadioGroup";
import { OperationEnum } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import PermissionTree from "./components/PermissionTree";
import { ProFormDigit, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { Form } from 'antd';
import { useEffect } from 'react';

const RoleDetailDrawer = (props: any) => {
    const {
        open,
        onOpenChange,
    } = props;

    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<SysRole>({
        pathname: '/system/role',
        entityName: '角色',
        baseUrl: '/api/system/role',
        onOpenChange
    });

    const state = getState('/system/role');
    const operation = state.operation;
    const record = state.editData as SysRole | null;

    const onFinish = async (values: Record<string, any>) => {
        const { permissionIds, ...rest } = values;
        let ids: any[] = [];
        if (Array.isArray(permissionIds)) {
            ids = permissionIds;
        } else if (permissionIds && typeof permissionIds === 'object') {
            ids = [...(permissionIds.checked || []), ...(permissionIds.halfChecked || [])];
        }

        const newValues = { ...rest, id: values.id || record?.id, permissionIds: ids };
        await handleSaveOrUpdate(newValues);
    }

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({ ...record });
                if (operation === OperationEnum.EDIT && record.id) {
                    getRole(record.id)
                        .then(res => {
                            if (res.data) {
                                form.setFieldsValue({ ...res.data });
                            }
                        })
                        .catch(err => {
                            console.error('获取角色详情失败', err);
                        });
                }
            } else if (operation === OperationEnum.CREATE) {
                form.resetFields();
            }
        }
    }, [open, operation, record, form]);

    return (
        <ProDrawerForm
            {...props}
            title={state.dialogTitle}
            form={form}
            width={640}
            loading={state.loading}
            onFinish={onFinish}
        >
            <ProFormText label={'ID'}
                name={'id'}
                hidden={true} />
            <ProFormText label={'角色名称'}
                name={'name'}
                placeholder={'请输入角色名称'}
                rules={[
                    {
                        required: true,
                        message: '角色名称不能为空'
                    }
                ]}
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                fieldProps={{ style: { width: '100%' } }}
            />
            <ProFormText name={'code'}
                label={'角色代码'}
                placeholder={'请输入角色代码'}
                tooltip={'控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole(\'admin\')`)'}
                rules={[
                    {
                        required: true,
                        message: '角色代码不能为空'
                    }
                ]}
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                fieldProps={{ style: { width: '100%' } }}
            />
            <ProFormDigit label={'显示顺序'}
                name={'sortOrder'}
                min={0}
                max={1000}
                fieldProps={{ precision: 0, style: { width: '100%' } }}
                initialValue={0}
                placeholder={'请输入显示顺序'}
                rules={[
                    {
                        required: true,
                        message: '显示顺序不能为空'
                    },
                ]}
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
            />
            <ProFormDictRadioGroup dictKey={'status'}
                label={'状态'}
                initialValue={'0'}
                name={'status'}
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                fieldProps={{ style: { width: '100%' } }}
            />
            <Form.Item label={'功能权限'} name={'permissionIds'}
                rules={[
                    {
                        required: true,
                        message: '请选择功能权限'
                    }
                ]}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
            >
                <PermissionTree />
            </Form.Item>
            <ProFormTextArea label={'备注'}
                name={'remark'}
                placeholder={'请输入备注信息'}
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                fieldProps={{ style: { width: '100%' } }}
            />
        </ProDrawerForm>
    )
}

export default RoleDetailDrawer;
