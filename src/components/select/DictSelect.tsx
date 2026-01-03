import React, {useMemo} from 'react';
import {Select, SelectProps} from "antd";
import {useModel} from "@umijs/max";

type Props = SelectProps & {
  dickey: string
}

function DictSelect(props: Props) {
  const {dickey, ...rest} = props;
  const {optionMap} = useModel('constantModel');

  const options = useMemo(() => {
    return optionMap[dickey] ? [...optionMap[dickey]] : [];
  }, [optionMap, dickey]);

  return (
    <Select options={options} {...rest} />
  );
}

export default DictSelect;
