import React, { useMemo } from 'react';
import { ProFormRadio, ProFormRadioGroupProps } from "@ant-design/pro-components";
import {useDict} from "@/hooks/common/useDict";
import {useModel} from "@umijs/max";

type Props = ProFormRadioGroupProps & {
  dictKey: string;
}

const ProFormDictRadioGroup = (props: Props) => {
  const { dictKey, ...rest } = props;
  const {optionMap} = useModel('constantModel');

  // 使用 useMemo 来优化 options 的计算
  const options = useMemo(() => {
    return optionMap[dictKey] ? [...optionMap[dictKey]] : [];
  }, [optionMap, dictKey]);

  return (
    <ProFormRadio.Group options={options} {...rest} />
  );
};

export default ProFormDictRadioGroup;
