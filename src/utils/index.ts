/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

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
