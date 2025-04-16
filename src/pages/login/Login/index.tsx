import {
  LockOutlined, SafetyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import {message, theme, ConfigProvider, Form, Input, Space} from 'antd';
import React, {useEffect, useState} from 'react';
import {Helmet, useIntl, useModel} from "@umijs/max";
import {Footer} from "@/components";
import {flushSync} from "react-dom";
import defaultSettings from "../../../../config/defaultSettings";
import {getCodeImg} from "@/apis/login";
import Cookie from "js-cookie";
import useAuth from "@/hooks/auth";
import {isUserLoggedIn} from "@/utils/auth";

const Page = () => {
  const {initialState, setInitialState} = useModel('@@initialState');
  const [codeUrl, setCodeUrl] = useState('');
  const [captchaEnabled, setCaptchaEnabled] = useState(true);
  const [uuid, setUuid] = useState('');
  const {token} = theme.useToken();
  const intl = useIntl();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const {login, redirect} = useAuth();

  interface LoginValues {
    username: string;
    password: string;
    code: string;
    rememberMe: boolean;
  }

  const getCode = () => {
    getCodeImg()
      .then(res => {
        const enabled = res.captchaEnabled === undefined ? true : res.captchaEnabled;
        setCaptchaEnabled(enabled);
        if (enabled) {
          setCodeUrl('data:image/gif;base64,' + res.img);
          setUuid(res.uuid);
        }
      })
  }

  const getCookie = () => {
    const username = Cookie.get('username');
    const password = Cookie.get('password');
    const rememberMe = Cookie.get('rememberMe');
    form.setFieldsValue({
      username: username === undefined ? 'admin' : username,
      password: password === undefined ? 'admin123' : password,
      rememberMe: rememberMe === undefined ? false : Boolean(rememberMe)
    });
  }

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

  const handleSubmit = async (values: LoginValues) => {
    try {
      // 登录
      const {username, password, code, rememberMe} = values;
      const userInfo = {username, password, code, uuid};
      await login(userInfo);
      const defaultLoginSuccessMessage = intl.formatMessage({
        id: 'pages.login.success',
        defaultMessage: '登录成功！',
      });
      messageApi.success(defaultLoginSuccessMessage);

      if(rememberMe) {
        Cookie.set('username', username, {expires: 30});
        Cookie.set('password', password, {expires: 30});
        Cookie.set('rememberMe', String(rememberMe), {expires: 30});
      } else {
        Cookie.remove("username");
        Cookie.remove("password");
        Cookie.remove("rememberMe");
      }

      await fetchUserInfo();
      redirect();

      return;
    } catch (error: any) {
      if (captchaEnabled) {
        getCode();
      }
      // const defaultLoginFailureMessage = intl.formatMessage({
      //   id: 'pages.login.failure',
      //   defaultMessage: '登录失败，请重试！',
      // });
      console.log(error);
      // messageApi.error(defaultLoginFailureMessage);
      // messageApi.error(error.message);
    }
  };

  useEffect(() => {
    getCode();
    getCookie();

    if(isUserLoggedIn()) {
      redirect();
    }
  }, []);

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: '100vh',
      }}
    >
      {contextHolder}
      <Helmet>
        <title>
          {intl.formatMessage({id: 'menu.login', defaultMessage: '登录页',})} - {defaultSettings.title}
        </title>
      </Helmet>
      <LoginFormPage title={'若依Web端（Antd版）'}
        // backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
                     backgroundImageUrl="https://mdn.alipayobjects.com/yuyan_qk0oxh/afts/img/V-_oS6r-i7wAAAAAAAAAAAAAFl94AQBr"
                     logo="https://github.githubassets.com/favicons/favicon.png"
        // backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
                     containerStyle={{
                       // backgroundColor: 'rgba(0, 128, 0,1)',
                       // backgroundColor: '#13C2C2',
                       backdropFilter: 'blur(4px)',
                       padding: '48px 32px'
                     }}
                     mainStyle={{width: 280}}
                     subTitle="RuoYi Management System"
                     onFinish={async (values) => {
                       await handleSubmit(values);
                     }}
                     form={form}
                     submitter={{
                       submitButtonProps: {
                         shape: 'round'
                       }
                     }}
      >
        <>
          <ProFormText name="username"
                       fieldProps={{
                         size: 'large',
                         autoComplete: "off",
                         prefix: (
                           <UserOutlined
                             style={{
                               color: token.colorText,
                             }}
                             className={'prefixIcon'}
                           />
                         ),
                       }}
                       placeholder={'用户名'}
                       rules={[
                         {
                           required: true,
                           message: '请输入用户名',
                         },
                       ]}
          />
          <ProFormText.Password name="password"
                                initialValue={'admin123'}
                                fieldProps={{
                                  size: 'large',
                                  prefix: (
                                    <LockOutlined
                                      style={{
                                        color: token.colorText,
                                      }}
                                      className={'prefixIcon'}
                                    />
                                  ),
                                }}
                                placeholder={'密码'}
                                rules={[
                                  {
                                    required: true,
                                    message: '请输入密码',
                                  },
                                ]}
          />
          <Form.Item noStyle>
            <Space.Compact>
              <Form.Item name={'code'} className={'mb-2'}
              rules={[
                {required: true, message: '请输入验证码'}
              ]}
              >
                <Input prefix={<SafetyOutlined/>} size={'large'}
                       placeholder={'验证码'}
                />
              </Form.Item>
              <img src={codeUrl} alt={'captcha'} onClick={getCode} style={{height: 40}} className={'rounded-r-lg'}/>
            </Space.Compact>
          </Form.Item>
        </>
        <div
          style={{
            marginBlockEnd: 32,
          }}
        >
          <ProFormCheckbox noStyle name="rememberMe">记住密码</ProFormCheckbox>
          {/*<a style={{float: 'right', color: defaultSettings.colorPrimary}}>*/}
          {/*  忘记密码*/}
          {/*</a>*/}
        </div>
      </LoginFormPage>
      <Footer/>
    </div>
  );
};

export default () => {
  return (
    <ProConfigProvider>
      <ConfigProvider theme={{
        token: {
          colorPrimary: defaultSettings.colorPrimary
        }
      }}>
        <Page/>
      </ConfigProvider>
    </ProConfigProvider>
  );
};
