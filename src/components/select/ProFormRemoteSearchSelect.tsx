import type { ProFormSelectProps } from '@ant-design/pro-components';
import { ProFormSelect } from '@ant-design/pro-components';
import type { SelectProps } from 'antd';
import { Form, Spin } from 'antd';
import debounce from 'lodash/debounce';
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
}

const ProFormRemoteSearchSelect = <ValueType extends any = any>(
  props: ProFormRemoteSearchSelectProps<ValueType>
) => {
  const {
    fetchOptions,
    debounceTimeout = 800,
    fieldProps = {},
    initialOptions = [],
    ...rest
  } = props;

  const [options, setOptions] = useState<RemoteSearchOptions<ValueType>[]>(initialOptions);
  const [fetching, setFetching] = useState(false);
  const fetchRef = useRef(0);

  const formRef = Form.useFormInstance();
  const fieldName = rest.name;

  // 新增：处理初始值加载
  useEffect(() => {

    if (!fieldName) return;

    const initialValue = formRef?.getFieldValue(fieldName);
    if (initialValue) {
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
  }, [fieldName, formRef, fetchOptions]);

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

  return (
    <ProFormSelect<ValueType> showSearch
                              options={options}
                              fieldProps={{
                                filterOption: false,
                                onSearch: debounceFetcher,
                                notFoundContent: fetching ? <Spin size="small"/> : null,
                                ...fieldProps,
                              }}
                              {...rest}
    />
  );
};

export default ProFormRemoteSearchSelect;
