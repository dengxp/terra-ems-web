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

import { ProDrawerForm } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import { ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import ProFormDictRadioGroup from "@/components/radio/ProFormDictRadioGroup";
import React, { useEffect, useState } from 'react';
import { message } from "antd";
import { history } from "@umijs/max";
import { OperationEnum } from "@/enums";

/**
 * 角色详情抽屉 (Plus版 - 仅包含基本信息)
 */
const RoleDetailDrawer: React.FC<any> = (props) => {
    const [prefix, setPrefix] = useState<string | undefined>('role:');

    const {
        getState,
        saveOrUpdate,
        setLoading,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<SysRole>({
        pathname: '/security/role-plus',
        entityName: '角色',
        baseUrl: '/api/system/role',
    });

    const state = getState('/security/role-plus');

    const onFinish = async (values: Record<string, any>) => {
        try {
            setLoading(true);
            if (state.operation === OperationEnum.CREATE && prefix) {
                values.code = prefix + values.code;
            }

            const result = await saveOrUpdate(values);
            void message.success(result.message || '保存成功');

            setShouldRefresh(true);
            setDialogVisible(false);

            if (state.operation === OperationEnum.CREATE && result.data) {
                // 如果是新建，跳转到权限配置页面
                const id = (result.data as any).id;
                message.info('正在跳转到权限配置...');
                setTimeout(() => {
                    history.push(`/security/role-plus/permissions/${id}`);
                }, 500);
            }
            return true;
        } catch (error) {
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (props.open) {
            if (state.operation === OperationEnum.EDIT) {
                setPrefix(undefined);
            } else {
                setPrefix('role:');
            }
        }
    }, [props.open, state.operation]);

    return (
        <ProDrawerForm
            {...props}
            title={state?.dialogTitle}
            initialValues={state?.editData}
            onFinish={onFinish}
            loading={state?.loading}
            grid={true}
            rowProps={{ gutter: 0 }}
            width={640}
        >
            <ProFormText name="id" hidden />
            <ProFormText
                name="name"
                label="角色名称"
                placeholder="请输入角色名称"
                rules={[{ required: true, message: '角色名称不能为空' }]}
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
            />
            <ProFormText
                name="code"
                label="角色代码"
                placeholder="请输入角色代码"
                fieldProps={{ prefix }}
                rules={[{ required: true, message: '角色代码不能为空' }]}
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
            />
            <ProFormDictRadioGroup
                dictKey="status"
                label="状态"
                initialValue="0"
                name="status"
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                fieldProps={{ style: { width: '100%' } }}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注信息"
                colProps={{ span: 24 }}
                labelCol={{ span: 5 }}
                wrapperCol={{ span: 18 }}
                fieldProps={{ rows: 4, style: { width: '100%' } }}
            />
        </ProDrawerForm>
    );
};

export default RoleDetailDrawer;
