export * from './auth';
export * from './uuid';
export * from './avatar';
export * from './validate';
export * from './tree';

export const wrapperResult = <T>(result: Result<T>): AntdResult => {
  return {
    data: result?.rows || [],
    success: result.success,
    total: result?.total
  }
}

// 转换字符串，undefined,null等转化为""
export const parseStrEmpty = (str?: string) => {
  if (!str || str == "undefined" || str == "null") {
    return "";
  }
  return str;
}
