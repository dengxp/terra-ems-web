import {AntdResult, Page, Result} from "@/types";

export * from './auth';
export * from './uuid';
export * from './avatar';
export * from './validate';
export * from './tree';

export const wrapperResult = <T>(result: Result<Page<T>>): AntdResult => {
  const data = result.data;
  return {
    data: data?.content || [],
    success: result.status ? (result.status >= 200 && result.status < 300) : false,
    total: data?.totalElement || 0
  }
}

// 转换字符串，undefined,null等转化为""
export const parseStrEmpty = (str?: string) => {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}
