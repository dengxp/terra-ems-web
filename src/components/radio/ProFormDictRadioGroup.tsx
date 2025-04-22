import React, { useMemo } from 'react';
import { ProFormRadio, ProFormRadioGroupProps } from "@ant-design/pro-components";
import {useDict} from "@/hooks/common/useDict";

type Props = ProFormRadioGroupProps & {
  dictKey: string;
}

const ProFormDictRadioGroup = (props: Props) => {
  const { dictKey, ...rest } = props;
  const dictMap = useDict(dictKey);

  // 使用 useMemo 来优化 options 的计算
  const options = useMemo(() => {
    return dictMap[dictKey] ? [...dictMap[dictKey]] : [];
  }, [dictMap, dictKey]);

  return (
    <ProFormRadio.Group options={options} {...rest} />
  );
};

export default ProFormDictRadioGroup;
