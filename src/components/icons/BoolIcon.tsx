import React from 'react';
import {Tooltip} from "antd";
import {CheckCircleFilled, CloseCircleFilled} from "@ant-design/icons";

type Props = {
  value: boolean;
  trueText?: string;
  falseText?: string;
}

const BoolIcon = ({value, trueText, falseText}: Props) => {
  return value
    ? <Tooltip title={trueText ? trueText : '是'}><CheckCircleFilled style={{color: 'green'}}/></Tooltip>
    : <Tooltip title={falseText ? falseText : '否'}><CloseCircleFilled style={{color: '#8c8c8c'}} /></Tooltip>
}

export default BoolIcon;
