/**
 * Terra EMS - 现代极简企业级登录页 (LoginV3)
 * Modern Minimalist / Split Screen Layout
 */

import { LockOutlined, MobileOutlined, SafetyOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { Helmet, useIntl, useModel, history } from '@umijs/max';
import { flushSync } from 'react-dom';
import Cookie from 'js-cookie';
import useAuth from '@/hooks/useAuth';
import { getSessionId, isUserLoggedIn, setSessionId } from '@/utils/auth';
import { generateUUID } from '@/utils';
import { createCaptcha, sendSmsCode, loginBySms } from '@/apis/login';
import { CAPTCHA_CATEGORY } from '@/config/constants';
import defaultSettings from '../../../../config/defaultSettings';
import './index.less';

type LoginType = 'account' | 'phone';

const LoginV3Page: React.FC = () => {
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

    // ... 逻辑与 Login/index.tsx 相同 ...
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
        { key: 'phone', label: '手机快速登录' },
    ];

    return (
        <div className="split-screen-login">
            {contextHolder}
            <Helmet>
                <title>登录 - {defaultSettings.title}</title>
            </Helmet>

            {/* 左侧视觉区 */}
            <div className="visual-side">
                <div className="brand-top">
                    <div className="logo-icon">🌿</div>
                    <span className="brand-name">TERRA<span>EMS</span></span>
                </div>

                <div className="brand-featured">
                    <h1>智慧能源，绿动未来。</h1>
                    <p>
                        下一代智慧能源管理平台，为您提供精确的能耗监控、碳排放分析与智能优化建议。
                    </p>
                    <div className="feature-tags">
                        <div className="tag">实时监控</div>
                        <div className="tag">AI 预测</div>
                        <div className="tag">碳中和</div>
                    </div>
                </div>

                <div className="brand-footer">
                    © 2024 Terra Energy. Design for sustainability.
                </div>
            </div>

            {/* 右侧交互区 */}
            <div className="interaction-side">
                <div className="login-wrapper">
                    <div className="header">
                        <h2>欢迎回来</h2>
                        <p>还没有账号? <a onClick={() => message.info('请联系管理员创建账号')}>联系管理员</a></p>
                    </div>

                    <Tabs
                        activeKey={loginType}
                        onChange={(key) => setLoginType(key as LoginType)}
                        items={tabItems}
                    />

                    <Form form={form} onFinish={handleSubmit} layout="vertical">
                        {loginType === 'account' ? (
                            <>
                                <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                                    <Input prefix={<UserOutlined />} placeholder="请输入您的用户名" autoComplete="off" />
                                </Form.Item>

                                <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
                                    <Input.Password prefix={<LockOutlined />} placeholder="请输入您的密码" />
                                </Form.Item>

                                <div className="captcha-row">
                                    <Form.Item name="captcha" label="验证码" rules={[{ required: true, message: '请输入验证码' }]}>
                                        <Input prefix={<SafetyOutlined />} placeholder="验证码" />
                                    </Form.Item>
                                    <div className="captcha-box" onClick={getCaptcha}>
                                        {captchaLoading ? (
                                            <div className="loading">...</div>
                                        ) : (
                                            <img src={codeUrl} alt="验证码" />
                                        )}
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                                        <Checkbox>30天内自动登录</Checkbox>
                                    </Form.Item>
                                    <a className="forgot-password">忘记密码?</a>
                                </div>
                            </>
                        ) : (
                            <>
                                <Form.Item
                                    name="phone"
                                    label="手机号码"
                                    rules={[
                                        { required: true, message: '请输入手机号' },
                                        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                                    ]}
                                >
                                    <Input prefix={<MobileOutlined />} placeholder="请输入您的手机号" autoComplete="off" />
                                </Form.Item>

                                <div className="captcha-row">
                                    <Form.Item
                                        name="smsCode"
                                        label="短信验证码"
                                        rules={[
                                            { required: true, message: '请输入验证码' },
                                            { len: 6, message: '验证码必须为6位数字' },
                                        ]}
                                    >
                                        <Input prefix={<SafetyOutlined />} placeholder="6位数字" />
                                    </Form.Item>
                                    <Button
                                        className="sms-code-btn"
                                        onClick={handleSendSmsCode}
                                        disabled={countdown > 0}
                                    >
                                        {countdown > 0 ? `${countdown}s` : '获取验证码'}
                                    </Button>
                                </div>
                                {/* 占位，保持高度一致 */}
                                <div style={{ height: 24, marginBottom: 32 }}></div>
                            </>
                        )}

                        <Button type="primary" htmlType="submit" loading={loading} block className="submit-btn">
                            {loginType === 'account' ? '立即登录' : '验证并登录'}
                        </Button>

                        <div className="divider">
                            <span>或者使用以下方式</span>
                        </div>

                        <div className="social-login">
                            <Button>企业微信</Button>
                            <Button>钉钉登录</Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default LoginV3Page;
