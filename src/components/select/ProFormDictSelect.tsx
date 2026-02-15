import { ProFormSelect, ProFormSelectProps } from "@ant-design/pro-components";

type Props = ProFormSelectProps & {
  dickey: string;
}

import { useModel } from "@umijs/max";
import { useMemo } from 'react';

const ProFormDictSelect = (props: Props) => {
  const {dickey, fieldProps, ...rest} = props;
  const {optionMap} = useModel('constantModel');

  const options = useMemo(() => {
    return optionMap[dickey] ? [...optionMap[dickey]] : [];
  }, [optionMap, dickey]);

  return (
    <ProFormSelect fieldProps={{...fieldProps, options: options}} {...rest} />
  )
}

export default ProFormDictSelect;
