import type {RequestConfig, RequestOptions} from '@umijs/max';
import {history} from "@umijs/max";
import {message, notification} from 'antd';
import {ContentType} from '@/enums';
import qs from 'qs';
import {EXPIRATION_CODE, LOGIN_PATH, WHITE_LIST} from "./config/constants";
import {getToken, removeToken} from "@/utils/auth";

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
      return qs.stringify(data, {arrayFormat: 'brackets'});
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
      const {data, code, msg} = res;
      const error: any = new Error(msg);
      const showType = res.showType || 2;
      error.name = 'BizError';
      error.info = {errorCode: code, errorMessage: msg, showType, data};
      throw error; // 抛出自制的错误
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const {errorMessage, errorCode} = errorInfo;
          const showType = opts.showType || errorInfo.showType;
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
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              void message.error(errorMessage);
          }
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        const {message: errorMessage, data} = error.response;
        const msg = (data && data.message) || errorMessage || '操作失败!';
        void message.error(msg);
        // message.error(`Response status:${error.response.status}`);
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        void message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        void message.error('请求失败，请稍后再重试！');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      const {data} = config;
      const headers: any = config.headers || {};
      const newData = dataConvert(data, headers?.['Content-Type']);

      const isToken = (headers || {}).isToken === false;
      if (getToken() && !isToken) {
        headers['Authorization'] = 'Bearer ' + getToken();
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
        headers: {...headers},
        data: newData
      }
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response) => {
      // 拦截响应数据，进行个性化处理
      const {data} = response as unknown as ResponseStructure;

      // 处理文件下载
      if (data instanceof Blob) {
        return response;
      }

      if (!WHITE_LIST.includes(location.pathname) && EXPIRATION_CODE.includes(data.code)) {
        removeToken();
        const uri = location.pathname + location.search;
        history.push(`${LOGIN_PATH}?redirect=${encodeURIComponent(uri)}`);
        return response;
      }

      data.success = data.code >= 200 && data.code < 300;

      return response;
    },
  ],
};
