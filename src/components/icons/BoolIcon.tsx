import React, { forwardRef } from 'react';
import { Tooltip } from "antd";
import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";

type Props = {
  value: boolean;
  trueText?: string;
  falseText?: string;
}

const BoolIcon = forwardRef<HTMLSpanElement, Props>(({ value, trueText, falseText }, ref) => {
  return (
    <Tooltip title={trueText ? trueText : '是'}>
      <span ref={ref}>
        {value ? <CheckCircleFilled style={{ color: 'green' }} /> : <CloseCircleFilled style={{ color: '#8c8c8c' }} />}
      </span>
    </Tooltip>
  );
});

export default BoolIcon;
