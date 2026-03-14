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

import React from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { useRequest, history } from '@umijs/max';
import { message, List } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { updateUserPassword } from '@/apis/user';
import { removeToken } from '@/utils/auth';

const SecurityView: React.FC = () => {
    const { run: handleUpdate, loading } = useRequest(updateUserPassword, {
        manual: true,
        onSuccess: () => {
            message.success('密码修改成功，请重新登录');
            removeToken();
            history.push('/user/login');
        },
    });

    return (
        <div style={{ maxWidth: '400px' }}>
            <ProForm
                layout="vertical"
                onFinish={async (values) => {
                    await handleUpdate(values);
                }}
                submitter={{
                    searchConfig: {
                        submitText: '提交修改',
                    },
                    render: (_, dom) => dom[1],
                }}
            >
                <ProFormText.Password
                    name="oldPassword"
                    label="旧密码"
                    placeholder="请输入旧密码"
                    rules={[{ required: true, message: '请输入旧密码' }]}
                    fieldProps={{
                        prefix: <LockOutlined />,
                        autoComplete: 'new-password',
                    }}
                />
                <ProFormText.Password
                    name="newPassword"
                    label="新密码"
                    placeholder="请输入新密码"
                    rules={[
                        { required: true, message: '请输入新密码' },
                        { min: 6, message: '密码长度不能小于6位' },
                    ]}
                    fieldProps={{
                        prefix: <LockOutlined />,
                        autoComplete: 'new-password',
                    }}
                />
                <ProFormText.Password
                    name="confirmPassword"
                    label="确认新密码"
                    placeholder="请再次输入新密码"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: '请确认新密码' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两次输入的密码不一致'));
                            },
                        }),
                    ]}
                    fieldProps={{
                        prefix: <LockOutlined />,
                        autoComplete: 'new-password',
                    }}
                />
            </ProForm>
        </div>
    );
};

export default SecurityView;
