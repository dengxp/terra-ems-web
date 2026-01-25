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

        // 1. 初始化 Cookie 信息
        const username = Cookie.get('username');
        const password = Cookie.get('password');
        const rememberMe = Cookie.get('rememberMe');
        form.setFieldsValue({
            username: username || 'admin',
            password: password || 'admin123',
            rememberMe: !!rememberMe,
        });

        if (isUserLoggedIn()) redirect();

        // 2. Canvas 极光布网动效逻辑
        const canvas = document.getElementById('mesh-canvas') as HTMLCanvasElement;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        let particles: any[] = [];
        let auroras: any[] = [];
        const particleCount = 100;
        const connectionDistance = 160;
        const mouse = { x: -100, y: -100 };

        // 能量粒子类
        class Particle {
            x: number; y: number; vx: number; vy: number; size: number; color: string;
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.size = Math.random() * 2 + 0.5;
                this.color = Math.random() > 0.5 ? 'rgba(24, 144, 255,' : 'rgba(82, 196, 26,';
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                if (!ctx) return;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + ' 0.6)';
                ctx.fill();
            }
        }

        // 极光背景块 (Aurora Blobs)
        class Aurora {
            x: number; y: number; r: number; color: string; vx: number; vy: number;
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.r = Math.random() * 300 + 200;
                this.color = Math.random() > 0.5 ? 'rgba(24, 144, 255, 0.08)' : 'rgba(82, 196, 26, 0.05)';
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
            }
            update() {
                this.x += this.vx; this.y += this.vy;
                if (this.x < -this.r || this.x > width + this.r) this.vx *= -1;
                if (this.y < -this.r || this.y > height + this.r) this.vy *= -1;
            }
            draw() {
                if (!ctx) return;
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
                grad.addColorStop(0, this.color);
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const initScene = () => {
            particles = [];
            auroras = [];
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());
            for (let i = 0; i < 4; i++) auroras.push(new Aurora());
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#0a1024'; // 稍微提亮一点的深蓝
            ctx.fillRect(0, 0, width, height);

            // 绘制背景极光
            auroras.forEach(a => { a.update(); a.draw(); });

            // 绘制网格
            particles.forEach((p, i) => {
                p.update();
                p.draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        const opacity = (1 - dist / connectionDistance) * 0.5;
                        ctx.strokeStyle = p.color === p2.color ? p.color + ` ${opacity})` : `rgba(255, 255, 255, ${opacity * 0.3})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // 鼠标增强效果
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mdist < 220) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(168, 255, 120, ${(1 - mdist / 220) * 0.4})`;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            });
            requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initScene();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        initScene();
        animate();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <div className="login-v4-container">
            <Helmet><title>智能登录 - {defaultSettings.title}</title></Helmet>

            {/* 动态 Canvas 背景图层 */}
            <canvas id="mesh-canvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
            <div className="mesh-overlay"></div>

            <div className="login-box">
                <div className="logo-section">
                    <div className="logo-icon">
                        <svg viewBox="0 0 100 100" className="energy-svg">
                            <defs>
                                <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#00f2fe" />
                                    <stop offset="100%" stopColor="#4facfe" />
                                </linearGradient>
                            </defs>
                            <circle cx="50" cy="50" r="45" fill="none" stroke="url(#logo-grad)" strokeWidth="2" strokeDasharray="282.7" strokeDashoffset="282.7" className="outer-circle" />
                            <path d="M50 20 L50 40 M30 50 L45 50 M70 50 L55 50 M50 80 L50 60" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
                            <path d="M40 45 L50 30 L60 45 L50 60 L40 75 L50 60 Z" fill="#52c41a" className="inner-pulse" />
                        </svg>
                    </div>
                    <div className="logo-text">TERRA<span className="accent">EMS</span></div>
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
