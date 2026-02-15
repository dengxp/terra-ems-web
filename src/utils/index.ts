import type { RequestData } from '@ant-design/pro-components';

export * from './auth';
export * from './avatar';
export * from './tree';
export * from './uuid';
export * from './validate';


/**
 * 将后端分页结果转换为 ProTable 所需的格式
 */
export const wrapperResult = <T,>(result: API.Result<API.PageResult<T>>): Partial<RequestData<T>> => {
  const data = result.data;
  return {
    data: data?.content || [],
    success: result.status ? (result.status >= 200 && result.status < 300) : true,
    total: data?.totalElements ?? 0
  };
};

// 转换字符串，undefined,null等转化为""
export const parseStrEmpty = (str?: string) => {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}
