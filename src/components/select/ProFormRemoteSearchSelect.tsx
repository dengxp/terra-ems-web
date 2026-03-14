/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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

import type { ProFormSelectProps } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import type { SelectProps } from 'antd';
import { Form, Spin } from 'antd';
import { debounce } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface RemoteSearchOptions<ValueType = any> {
  label: React.ReactNode;
  value: ValueType;

  [key: string]: any;
}

export interface ProFormRemoteSearchSelectProps<ValueType = any>
  extends Omit<ProFormSelectProps, 'fieldProps' | 'options'> {
  /** 异步加载数据的函数 */
  fetchOptions: (searchValue: string) => Promise<RemoteSearchOptions<ValueType>[]>;
  /** 防抖时间（毫秒） */
  debounceTimeout?: number;
  /** Select 组件的属性 */
  fieldProps?: Omit<SelectProps<ValueType>, 'options' | 'loading'>;
  /** 初始选项（用于回显等场景） */
  initialOptions?: RemoteSearchOptions<ValueType>[];
  /** 是否预加载 */
  preload?: boolean;
}

const ProFormRemoteSearchSelect = <ValueType extends any = any>(
  props: ProFormRemoteSearchSelectProps<ValueType>
) => {
  const {
    fetchOptions,
    debounceTimeout = 800,
    fieldProps = {},
    initialOptions = [],
    preload = false,
    ...rest
  } = props;

  const [options, setOptions] = useState<RemoteSearchOptions<ValueType>[]>(initialOptions);
  const [fetching, setFetching] = useState(false);
  const fetchRef = useRef(0);

  const formRef = Form.useFormInstance();
  const fieldName = rest.name;

  // 新增：处理初始值加载或预加载
  useEffect(() => {
    if (!fieldName && !preload) return;

    const initialValue = fieldName ? formRef?.getFieldValue(fieldName) : undefined;

    // 如果有初始值，或者开启了预加载，则触发查询
    if (initialValue || preload) {
      const valueToSearch = '';
      fetchRef.current += 1;
      const fetchId = fetchRef.current;
      setFetching(true);

      fetchOptions(valueToSearch).then((newOptions) => {
        if (fetchId !== fetchRef.current) return;
        setOptions(newOptions);
        setFetching(false);
      }).catch(() => {
        setFetching(false);
      });
    }
  }, [fieldName, formRef, fetchOptions, preload]);

  const debounceFetcher = useMemo(() => {
    const loadOptions = (value: string) => {
      fetchRef.current += 1;
      const fetchId = fetchRef.current;

      setOptions([]);
      setFetching(true);

      fetchOptions(value).then((newOptions) => {
        // 只处理最后一次请求的结果
        if (fetchId !== fetchRef.current) {
          return;
        }

        setOptions(newOptions);
        setFetching(false);
      }).catch(() => {
        setFetching(false);
      });
    };

    return debounce(loadOptions, debounceTimeout);
  }, [fetchOptions, debounceTimeout]);

  const onFocus = () => {
    if (options.length === 0) {
      debounceFetcher('');
    }
  };

  return (
    <ProFormSelect<ValueType>
      showSearch
      options={options}
      fieldProps={{
        filterOption: false,
        onSearch: debounceFetcher,
        onFocus: onFocus,
        notFoundContent: fetching ? <Spin size="small" /> : null,
        ...fieldProps,
      }}
      {...rest}
    />
  );
};

export default ProFormRemoteSearchSelect;
