/**
 * Terra EMS - 智慧能源布网版登录页 (LoginV4)
 * Featuring AI Grid Background & Glassmorphism
 */

import { LockOutlined, MobileOutlined, SafetyOutlined, UserOutlined, NodeIndexOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, Tabs, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { Helmet, useModel } from '@umijs/max';
import { flushSync } from 'react-dom';
import Cookie from 'js-cookie';
import useAuth from '@/hooks/useAuth';
import { getSessionId, isUserLoggedIn, setSessionId } from '@/utils/auth';
import { generateUUID } from '@/utils';
import { createCaptcha, loginBySms, sendSmsCode } from '@/apis/login';
import { CAPTCHA_CATEGORY } from '@/config/constants';
import defaultSettings from '../../../../config/defaultSettings';
import './index.less';

type LoginType = 'account' | 'phone';

const LoginV4Page: React.FC = () => {
    const { initialState, setInitialState } = useModel('@@initialState');
    const [loginType, setLoginType] = useState<LoginType>('account');
    const [captchaLoading, setCaptchaLoading] = useState(false);
    const [codeUrl, setCodeUrl] = useState('');
    const [uuid, setUuid] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [form] = Form.useForm();
    const { login, redirect } = useAuth();
    const { Title: AntdTitle, Text: AntdText } = Typography;

    // 验证码获取逻辑
    const getCaptcha = () => {
        setCaptchaLoading(true);
        const identity = getSessionId();
        createCaptcha(identity, CAPTCHA_CATEGORY)
            .then((res) => {
                if (res.success) {
                    setCodeUrl(res.data.img);
                    setUuid(res.data.uuid);
                }
            })
            .finally(() => setCaptchaLoading(false));
    };

    // 核心提交逻辑
    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            if (loginType === 'phone') {
                const { phone, smsCode } = values;
                await loginBySms({ phone, code: smsCode });
            } else {
                const { username, password, captcha, rememberMe } = values;
                await login({ username, password, captcha, uuid });
                if (rememberMe) {
                    Cookie.set('username', username, { expires: 30 });
                    Cookie.set('password', password, { expires: 30 });
                    Cookie.set('rememberMe', 'true', { expires: 30 });
                } else {
                    Cookie.remove('username');
                    Cookie.remove('password');
                    Cookie.remove('rememberMe');
                }
            }

            // 获取用户信息并同步状态
            const userInfo = await initialState?.fetchUserInfo?.();
            if (userInfo) {
                flushSync(() => {
                    setInitialState((s) => ({ ...s, currentUser: userInfo }));
                });
            }
            message.success('欢迎回来，智慧能源门户已开启');
            redirect();
        } catch (error: any) {
            if (loginType === 'account') getCaptcha();
        } finally {
            setLoading(false);
        }
    };

    const handleSendSmsCode = async () => {
        const phone = form.getFieldValue('phone');
        if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
            message.error('请输入正确的手机号');
            return;
        }
        await sendSmsCode(phone);
        message.success('验证码已发送');
        setCountdown(60);
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) { clearInterval(timer); return 0; }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        const sessionId = generateUUID();
        setSessionId(sessionId);
        getCaptcha();

        // 初始化 Cookie 信息
        const username = Cookie.get('username');
        const password = Cookie.get('password');
        const rememberMe = Cookie.get('rememberMe');
        form.setFieldsValue({
            username: username || 'admin',
            password: password || 'admin123',
            rememberMe: !!rememberMe,
        });

        if (isUserLoggedIn()) redirect();
    }, []);

    return (
        <div className="login-v4-container">
            <Helmet><title>智能登录 - {defaultSettings.title}</title></Helmet>

            {/* 背景动态图层 */}
            <div className="bg-image"></div>
            <div className="mesh-overlay"></div>

            <div className="login-box">
                <div className="logo-section">
                    <div className="logo-icon"><NodeIndexOutlined /></div>
                    <div className="logo-text">TERRA<span>EMS</span></div>
                </div>

                <div className="login-header">
                    <AntdTitle level={2} style={{ color: '#fff', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>智慧能源管控门户</AntdTitle>
                    <AntdText style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '14px' }}>PRECISION MONITORING · INTELLIGENT ANALYTICS</AntdText>
                </div>

                <Tabs
                    centered
                    activeKey={loginType}
                    onChange={(k) => setLoginType(k as LoginType)}
                    items={[
                        { key: 'account', label: '核心凭据登录' },
                        { key: 'phone', label: '动态令牌登录' },
                    ]}
                />

                <Form form={form} onFinish={handleSubmit} layout="vertical" requiredMark={false}>
                    {loginType === 'account' ? (
                        <>
                            <Form.Item name="username" label="接入标识" rules={[{ required: true, message: '请输入接入标识' }]}>
                                <Input prefix={<UserOutlined />} placeholder="用户名 / 工号" />
                            </Form.Item>

                            <Form.Item name="password" label="安全密钥" rules={[{ required: true, message: '请输入安全密钥' }]}>
                                <Input.Password prefix={<LockOutlined />} placeholder="请输入登录密码" />
                            </Form.Item>

                            <div className="captcha-row">
                                <Form.Item name="captcha" label="验证识别" rules={[{ required: true, message: '请输入验证码' }]}>
                                    <Input prefix={<SafetyOutlined />} placeholder="验证码" />
                                </Form.Item>
                                <div className="captcha-box" onClick={getCaptcha}>
                                    {captchaLoading ? (
                                        <div style={{ color: '#fff', textAlign: 'center', lineHeight: '42px' }}>...</div>
                                    ) : (
                                        <img src={codeUrl} alt="CAPTCHA" />
                                    )}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0' }}>
                                <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                                    <Checkbox>保持会话 (30d)</Checkbox>
                                </Form.Item>
                                <a className="forgot-password">找回密钥?</a>
                            </div>
                        </>
                    ) : (
                        <>
                            <Form.Item name="phone" label="通讯节点" rules={[{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入有效手机号' }]}>
                                <Input prefix={<MobileOutlined />} placeholder="手机号码" />
                            </Form.Item>

                            <div className="captcha-row">
                                <Form.Item name="smsCode" label="动态令牌" rules={[{ required: true, len: 6, message: '6位校验码' }]}>
                                    <Input prefix={<SafetyOutlined />} placeholder="短信校验码" />
                                </Form.Item>
                                <Button className="sms-code-btn" onClick={handleSendSmsCode} disabled={countdown > 0} style={{ height: 42, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    {countdown > 0 ? `${countdown}s` : '获取令牌'}
                                </Button>
                            </div>
                            <div style={{ height: 24 }}></div>
                        </>
                    )}

                    <Button type="primary" htmlType="submit" loading={loading} block className="submit-btn">
                        {loginType === 'account' ? '确认身份并开启系统' : '令牌校验登录'}
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: 24 }}>
                        <AntdText type="secondary" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                            <NodeIndexOutlined /> 全球能源数据同步中心
                        </AntdText>
                    </div>
                </Form>
            </div>

            <div className="login-footer">
                TERRA TECHNOLOGY · SMART ENERGY NETWORK · VER 4.0
            </div>
        </div>
    );
};

export default LoginV4Page;
