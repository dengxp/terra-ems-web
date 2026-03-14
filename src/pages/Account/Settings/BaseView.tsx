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

import React, { useState } from 'react';
import { ProForm, ProFormText, ProFormRadio } from '@ant-design/pro-components';
import { useModel, useRequest } from '@umijs/max';
import { message, Card, Avatar, Typography, Space, Divider, Upload, Button } from 'antd';
import { UploadOutlined, RestOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { updateUserProfile } from '@/apis/user';
import { generateAvatar } from '@/utils/avatar';
import type { RcFile } from 'antd/es/upload';

const { Title, Text } = Typography;

const BaseView: React.FC = () => {
    const { initialState, setInitialState } = useModel('@@initialState');
    const { currentUser } = initialState || {};
    const [tempAvatar, setTempAvatar] = useState<string | undefined>(currentUser?.avatar);

    const { run: handleUpdate, loading } = useRequest(updateUserProfile, {
        manual: true,
        onSuccess: () => {
            message.success('更新个人资料成功');
            // 刷新全局状态
            initialState?.fetchUserInfo?.().then((userInfo) => {
                setInitialState((s) => ({ ...s, currentUser: userInfo }));
            });
        },
    });

    const getBase64 = (file: File | RcFile): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const onFileChange = async (file: RcFile) => {
        const base64 = await getBase64(file);
        setTempAvatar(base64);
        return false;
    };

    if (!currentUser) return null;

    return (
        <div style={{ display: 'flex', gap: '32px' }}>
            <div style={{ flex: 1 }}>
                <ProForm
                    layout="vertical"
                    initialValues={{
                        realName: currentUser.realName,
                        email: currentUser.email,
                        phone: currentUser.phone,
                        gender: currentUser.gender?.toString() || '2',
                    }}
                    onFinish={async (values) => {
                        await handleUpdate({
                            ...values,
                            gender: parseInt(values.gender),
                            avatar: tempAvatar,
                        });
                    }}
                    submitter={{
                        searchConfig: {
                            submitText: '更新基本信息',
                        },
                        render: (_, dom) => dom[1],
                    }}
                >
                    <ProFormText
                        width="md"
                        name="realName"
                        label="真实姓名"
                        placeholder="请输入您的真实姓名"
                        rules={[{ required: true, message: '请输入真实姓名' }]}
                    />
                    <ProFormText
                        width="md"
                        name="email"
                        label="邮箱"
                        placeholder="请输入您的邮箱"
                        rules={[{ type: 'email', message: '邮箱格式不正确' }]}
                    />
                    <ProFormText
                        width="md"
                        name="phone"
                        label="联系电话"
                        placeholder="请输入您的手机号"
                    />
                    <ProFormRadio.Group
                        name="gender"
                        label="性别"
                        options={[
                            { label: '男', value: '0' },
                            { label: '女', value: '1' },
                            { label: '未知', value: '2' },
                        ]}
                    />
                </ProForm>
            </div>

            <Divider type="vertical" style={{ height: 'auto' }} />

            <div style={{ width: '300px' }}>
                <Card bordered={false} styles={{ body: { textAlign: 'center', paddingTop: 0 } }}>
                    <Title level={5}>个人视觉资产</Title>
                    <div style={{ margin: '24px 0' }}>
                        <Avatar
                            size={120}
                            src={tempAvatar || currentUser.avatar}
                            style={{
                                border: '4px solid #f0f2f5',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.08)'
                            }}
                        />
                    </div>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <ImgCrop rotationSlider aspect={1} cropShape="round" showReset>
                            <Upload
                                name="avatar"
                                showUploadList={false}
                                beforeUpload={onFileChange}
                                accept="image/*"
                            >
                                <Button icon={<UploadOutlined />} loading={loading}>更换头像照片</Button>
                            </Upload>
                        </ImgCrop>
                        <Button
                            type="link"
                            size="small"
                            icon={<RestOutlined />}
                            onClick={() => setTempAvatar(generateAvatar(currentUser.id?.toString() || currentUser.name || ''))}
                        >
                            重置为默认绘画
                        </Button>
                        <Divider style={{ margin: '8px 0' }} />
                        <Space direction="vertical" size="small">
                            <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>
                                泰若智能管理系统采用特殊的 <b>Digital Identity</b> 算法，
                                根据您的唯一账号 ID 生成专属艺术头像。
                            </Text>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                建议上传正方形照片，系统将自动进行圆形裁剪以适配全站视觉。
                            </Text>
                        </Space>
                    </Space>
                </Card>
            </div>
        </div>
    );
};

export default BaseView;
