import type { RequestConfig, RequestOptions } from '@umijs/max';
import { history } from "@umijs/max";
import { message, notification } from 'antd';
import { ContentType } from '@/enums';
import qs from 'qs';
import { EXPIRATION_CODE, LOGIN_PATH, TOKEN_HEADER_NAME, WHITE_LIST, X_TERRA_SESSION_ID } from "./config/constants";
import { getSessionId, getToken, removeToken } from "@/utils/auth";


// 错误处理方案： 错误类型
enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

// 与后端约定的响应数据格式
interface ResponseStructure {
  success: boolean;
  data: any;
  errorCode?: number;
  errorMessage?: string;
  showType?: ErrorShowType;
}

const dataConvert = (data: any, contentType: any) => {
  switch (contentType) {
    case ContentType.URL_ENCODED:
      return qs.stringify(data, { arrayFormat: 'brackets' });
    case ContentType.JSON:
      return JSON.stringify(data);
    default:
      return data;
  }
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params: Record<string, string>) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = encodeURIComponent(propName) + "=";
    if (value !== null && value !== "" && typeof (value) !== "undefined") {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== "" && typeof (value[key]) !== 'undefined') {
            let params = propName + '[' + key + ']';
            const subPart = encodeURIComponent(params) + "=";
            result += subPart + encodeURIComponent(value[key]) + "&";
          }
        }
      } else {
        result += part + encodeURIComponent(value) + "&";
      }
    }
  }
  return result
}

// 全局跳转守卫，防止 401 并发导致死循环
let isRedirecting = false;

/**
 * 统一跳转到登录页
 */
const jumpToLogin = () => {
  if (isRedirecting) return;

  const { location } = history;
  if (location.pathname === LOGIN_PATH) return;

  isRedirecting = true;
  removeToken();

  const uri = location.pathname + location.search;
  const loginUrl = `${LOGIN_PATH}?redirect=${encodeURIComponent(uri)}`;

  console.log('[Terra] |- 检测到 401/Token 过期，跳转至登录页:', loginUrl);

  // 使用 replace 防止在历史记录中堆积
  history.replace(loginUrl);

  // 1.5秒后重置状态，给页面跳转留出充分时间
  setTimeout(() => {
    isRedirecting = false;
  }, 1500);
};

/**
 * 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const { data, code, message } = res;
      const error: any = new Error(message);
      const showType = res.showType || 2;
      error.name = 'BizError';
      error.info = { errorCode: code, errorMessage: message, showType, data };
      throw error; // 抛出自制的错误
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { errorMessage, errorCode } = errorInfo;
          const showType = opts.showType || errorInfo.showType;

          // 如果是认证过期的业务代码，执行跳转
          if (EXPIRATION_CODE.includes(errorCode as number)) {
            jumpToLogin();
            return;
          }

          switch (showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              void message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              void message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: errorMessage,
                message: errorCode,
              });
              break;
            default:
              void message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        const { message: errorMessage, data, status } = error.response;

        if (status === 401) {
          jumpToLogin();
          return;
        }

        if (status === 403) {
          void message.error('无权访问该资源');
          return;
        }

        const msg = (data && data.message) || errorMessage || '操作失败!';
        void message.error(msg);
      } else if (error.request) {
        void message.error('服务器无响应，请重试');
      } else {
        void message.error('请求失败，请稍后再重试！');
      }
    },
  },


  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      const { data } = config;
      const headers: any = config.headers || {};
      const newData = dataConvert(data, headers?.['Content-Type']);

      const isToken = (headers || {}).isToken === false;

      const sessionId = getSessionId();
      if (sessionId) {
        headers[X_TERRA_SESSION_ID] = sessionId;
      }

      const token = getToken();

      if (token && !isToken) {
        headers['Authorization'] = 'Bearer ' + token;
        headers[TOKEN_HEADER_NAME] = token;
      }

      // // 自定义参数序列化逻辑
      // if (config.method === 'get' && config.params) {
      //   for (const key in config.params) {
      //     if (Array.isArray(config.params[key])) {
      //       config.params[key] = config.params[key].join(',');
      //     }
      //     // 如果值是对象（例如 params 需要传递的 Map 或对象），则转为 JSON 字符串
      //     else if (typeof config.params[key] === 'object' && config.params[key] !== null) {
      //       config.params[key] = JSON.stringify(config.params[key]);
      //     }
      //   }
      // }

      // get请求映射params参数
      if (config.method === 'get' && config.params) {
        let url = config.url + '?' + tansParams(config.params);
        url = url.slice(0, -1);
        config.params = {};
        config.url = url;
      }

      // 拦截请求配置，进行个性化处理
      return {
        ...config,
        headers: { ...headers },
        data: newData
      }
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const { data } = response as unknown as ResponseStructure;

      // 处理文件下载
      if (data instanceof Blob) {
        return response;
      }

      if (!WHITE_LIST.includes(location.pathname) && EXPIRATION_CODE.includes(data.code)) {
        jumpToLogin();
        return response;
      }

      data.success = data.code >= 20000 && data.code < 30000;

      return response;
    },
  ],
};
