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

/**
 * Terra EMS - 极光登录页 (LoginV2)
 * 采用高端玻璃拟态 (Glass morphism) 与动态极光背景设计
 */

import { createCaptcha, loginBySms, sendSmsCode } from '@/apis/login';
import { CAPTCHA_CATEGORY } from '@/config/constants';
import useAuth from '@/hooks/useAuth';
import { generateUUID } from '@/utils';
import { getSessionId, isUserLoggedIn, setSessionId } from '@/utils/auth';
import { LockOutlined, MobileOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Helmet, useModel } from '@umijs/max';
import { Button, Checkbox, Form, Input, message, Tabs } from 'antd';
import Cookie from 'js-cookie';
import React, { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import defaultSettings from '../../../../config/defaultSettings';
import './index.less';

type LoginType = 'account' | 'phone';

const LoginV2Page: React.FC = () => {
    const { initialState, setInitialState } = useModel('@@initialState');
    const [loginType, setLoginType] = useState<LoginType>('account');
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [codeUrl, setCodeUrl] = useState('');
    const [uuid, setUuid] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const { login, redirect } = useAuth();

    const getCaptcha = () => {
        setCaptchaLoading(true);
        const identity = getSessionId();
        createCaptcha(identity, CAPTCHA_CATEGORY)
            .then((res) => {
                if (res.success) {
                    setCodeUrl(res.data.graphicImageBase64);
                    setUuid(res.data.uuid);
                }
            })
            .catch((err) => {
                messageApi.error(err.message || '获取验证码失败');
            })
            .finally(() => {
                setCaptchaLoading(false);
            });
    };

    const getCookie = () => {
        const username = Cookie.get('username');
        const password = Cookie.get('password');
        const rememberMe = Cookie.get('rememberMe');
        const phone = Cookie.get('phone');
        form.setFieldsValue({
            username: username || 'admin',
            password: password || 'admin123',
            rememberMe: rememberMe ? Boolean(rememberMe) : false,
            phone: phone || '',
        });
    };

    const fetchUserInfo = async () => {
        const userInfo = await initialState?.fetchUserInfo?.();
        if (userInfo) {
            flushSync(() => {
                setInitialState((s) => ({
                    ...s,
                    currentUser: userInfo,
                }));
            });
        }
    };

    const handleSendSmsCode = async () => {
        try {
            const phone = form.getFieldValue('phone');
            if (!phone) {
                messageApi.error('请输入手机号');
                return;
            }

            if (!/^1[3-9]\d{9}$/.test(phone)) {
                messageApi.error('请输入正确的手机号');
                return;
            }

            await sendSmsCode(phone);
            messageApi.success('验证码已发送');
            setCountdown(60);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error: any) {
            messageApi.error(error.message || '发送验证码失败');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);

            if (loginType === 'phone') {
                const { phone, smsCode } = values;
                Cookie.set('phone', phone, { expires: 30 });
                await loginBySms({ phone, code: smsCode });
                messageApi.success('登录成功！');
            } else {
                const { username, password, captcha, rememberMe } = values;
                await login({ username, password, captcha, uuid });
                messageApi.success('登录成功！');

                if (rememberMe) {
                    Cookie.set('username', username, { expires: 30 });
                    Cookie.set('password', password, { expires: 30 });
                    Cookie.set('rememberMe', String(rememberMe), { expires: 30 });
                } else {
                    Cookie.remove('username');
                    Cookie.remove('password');
                    Cookie.remove('rememberMe');
                }
            }

            await fetchUserInfo();
            redirect();
        } catch (error: any) {
            if (loginType === 'account') {
                getCaptcha();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const sessionId = generateUUID();
        setSessionId(sessionId);
        getCaptcha();
        getCookie();

        if (isUserLoggedIn()) {
            redirect();
        }
    }, []);

    const tabItems = [
        { key: 'account', label: '账号登录' },
        { key: 'phone', label: '手机登录' },
    ];

    return (
        <div className="aurora-login">
            {contextHolder}
            <Helmet>
                <title>登录 - {defaultSettings.title}</title>
            </Helmet>

            {/* 噪点纹理层 */}
            <div className="noise-overlay"></div>

            {/* 玻璃拟态容器 */}
            <div className="glass-container">
                <div className="brand-area">
                    <div className="logo-icon">
                        <img src="/images/terra-logo-1.png" alt="Terra Logo" style={{ width: 64, height: 64 }} />
                    </div>
                    <h1>Terra EMS</h1>
                    <p>新一代智慧能源管理系统</p>
                </div>

                <Form form={form} onFinish={handleSubmit} className="login-form">
                    <Tabs
                        activeKey={loginType}
                        onChange={(key) => setLoginType(key as LoginType)}
                        items={tabItems}
                        centered
                    />

                    {loginType === 'account' ? (
                        <>
                            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                                <Input
                                    size="large"
                                    prefix={<UserOutlined />}
                                    placeholder="用户名 / Username"
                                    autoComplete="off"
                                />
                            </Form.Item>

                            <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined />}
                                    placeholder="密码 / Password"
                                />
                            </Form.Item>

                            <div className="captcha-row">
                                <Form.Item
                                    name="captcha"
                                    rules={[{ required: true, message: '请输入验证码' }]}
                                >
                                    <Input size="large" prefix={<SafetyOutlined />} placeholder="验证码" />
                                </Form.Item>
                                <div className="captcha-box" onClick={getCaptcha}>
                                    {captchaLoading ? (
                                        <div className="loading-placeholder">...</div>
                                    ) : (
                                        <img src={codeUrl} alt="captcha" />
                                    )}
                                </div>
                            </div>

                            <div className="form-extra">
                                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                                    <Checkbox>记住我</Checkbox>
                                </Form.Item>
                                <a onClick={() => message.info('请联系系统管理员重置密码')}>忘记密码?</a>
                            </div>
                        </>
                    ) : (
                        <>
                            <Form.Item
                                name="phone"
                                rules={[
                                    { required: true, message: '请输入手机号' },
                                    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                                ]}
                            >
                                <Input
                                    size="large"
                                    prefix={<MobileOutlined />}
                                    placeholder="手机号 / Phone Number"
                                    autoComplete="off"
                                />
                            </Form.Item>

                            <div className="captcha-row">
                                <Form.Item
                                    name="smsCode"
                                    rules={[
                                        { required: true, message: '请输入验证码' },
                                        { len: 6, message: '验证码必须为6位数字' },
                                    ]}
                                >
                                    <Input size="large" prefix={<SafetyOutlined />} placeholder="验证码" />
                                </Form.Item>
                                <Button
                                    className="sms-code-btn"
                                    onClick={handleSendSmsCode}
                                    disabled={countdown > 0}
                                >
                                    {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                </Button>
                            </div>
                        </>
                    )}

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="login-btn"
                        >
                            登 录
                        </Button>
                    </Form.Item>
                </Form>
            </div>

            <div className="footer-copyright">
                © 2024 Terra Energy Management System. All Rights Reserved.
            </div>
        </div>
    );
};

export default LoginV2Page;
