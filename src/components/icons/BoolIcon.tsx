import { CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import { Tooltip } from "antd";
import { forwardRef } from 'react';

type Props = {
  value: boolean;
  trueText?: string;
}

const BoolIcon = forwardRef<HTMLSpanElement, Props>(({ value, trueText }, ref) => {
  return (
    <Tooltip title={trueText ? trueText : '是'}>
      <span ref={ref}>
        {value ? <CheckCircleFilled style={{ color: 'green' }} /> : <CloseCircleFilled style={{ color: '#8c8c8c' }} />}
      </span>
    </Tooltip>
  );
});

export default BoolIcon;
