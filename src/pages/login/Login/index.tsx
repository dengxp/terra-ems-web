/**
 * Terra EMS - 登录页面
 * 左右布局 + 精致输入框 + Tab切换登录方式
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
// import terraLogo from '@/assets/images/terra-logo.svg?url';
import './index.less';

type LoginType = 'account' | 'phone';

const LoginPage: React.FC = () => {
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

  // 发送短信验证码
  const handleSendSmsCode = async () => {
    try {
      const phone = form.getFieldValue('phone');
      if (!phone) {
        messageApi.error('请输入手机号');
        return;
      }

      // 验证手机号格式
      if (!/^1[3-9]\d{9}$/.test(phone)) {
        messageApi.error('请输入正确的手机号');
        return;
      }

      await sendSmsCode(phone);
      messageApi.success('验证码已发送');

      // 开始倒计时
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
        // 手机号登录
        const { phone, smsCode } = values;

        // 保存手机号到Cookie
        Cookie.set('phone', phone, { expires: 30 });

        await loginBySms({ phone, code: smsCode });
        messageApi.success('登录成功！');
      } else {
        // 账号密码登录
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
    {
      key: 'account',
      label: '账号登录',
    },
    {
      key: 'phone',
      label: '手机登录',
    },
  ];

  return (
    <div className="split-layout-login">
      {contextHolder}
      <Helmet>
        <title>登录 - {defaultSettings.title}</title>
      </Helmet>

      {/* 左侧：品牌展示 */}
      <div className="login-left">
        <div className="left-content">
          <div className="brand-section">
            {/*<img src={terraLogo} alt="Terra Logo" className="logo" />*/}
            <h1>泰若能源管理系统</h1>
            <p>Terra Energy Management System</p>
          </div>

          <div className="features">
            <div className="feature">
              <div className="icon">🌱</div>
              <div className="text">
                <h3>绿色低碳</h3>
                <p>助力实现碳中和目标</p>
              </div>
            </div>
            <div className="feature">
              <div className="icon">⚡</div>
              <div className="text">
                <h3>智能监控</h3>
                <p>实时能耗数据分析</p>
              </div>
            </div>
            <div className="feature">
              <div className="icon">📊</div>
              <div className="text">
                <h3>数据可视</h3>
                <p>直观的能源管理看板</p>
              </div>
            </div>
          </div>

          <div className="stats">
            <div className="stat">
              <div className="value">99.9%</div>
              <div className="label">系统可用性</div>
            </div>
            <div className="stat">
              <div className="value">30%+</div>
              <div className="label">节能效果</div>
            </div>
            <div className="stat">
              <div className="value">24/7</div>
              <div className="label">实时监控</div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧：登录表单 */}
      <div className="login-right">
        <div className="form-wrapper">
          <div className="form-header">
            <h2>欢迎回来</h2>
            <p>登录以继续访问能源管理系统</p>
          </div>

          <Tabs
            activeKey={loginType}
            onChange={(key) => setLoginType(key as LoginType)}
            items={tabItems}
            className="login-tabs"
          />

          <Form form={form} onFinish={handleSubmit} className="login-form">
            {loginType === 'account' ? (
              <>
                <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
                  <Input
                    size="large"
                    prefix={<UserOutlined />}
                    placeholder="用户名"
                    autoComplete="off"
                  />
                </Form.Item>

                <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
                  <Input.Password size="large" prefix={<LockOutlined />} placeholder="密码" />
                </Form.Item>

                <div className="captcha-row">
                  <Form.Item
                    name="captcha"
                    rules={[{ required: true, message: '请输入验证码' }]}
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input size="large" prefix={<SafetyOutlined />} placeholder="验证码" />
                  </Form.Item>
                  <div className="captcha-box" onClick={getCaptcha}>
                    {captchaLoading ? (
                      <div className="captcha-loading">
                        <div className="loading-spinner"></div>
                      </div>
                    ) : (
                      <img src={codeUrl} alt="captcha" />
                    )}
                  </div>
                </div>

                <Form.Item>
                  <div className="form-extra">
                    <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                      <Checkbox>记住我</Checkbox>
                    </Form.Item>
                  </div>
                </Form.Item>
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
                    placeholder="手机号"
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
                    style={{ marginBottom: 0, flex: 1 }}
                  >
                    <Input size="large" prefix={<SafetyOutlined />} placeholder="短信验证码" />
                  </Form.Item>
                  <Button
                    size="large"
                    className="sms-code-btn"
                    onClick={handleSendSmsCode}
                    disabled={countdown > 0}
                  >
                    {countdown > 0 ? `${countdown}s后重试` : '获取验证码'}
                  </Button>
                </div>

                <div className="phone-login-tip">
                  <p>首次使用手机号登录请联系管理员绑定账号</p>
                </div>
              </>
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={loading} block size="large">
                登录
              </Button>
            </Form.Item>
          </Form>

          <div className="form-footer">
            <p>🌿 绿色能源 · 智慧管理</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
