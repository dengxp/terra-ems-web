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

import { DataItemStatus } from "@/enums";
import { CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, LockFilled } from "@ant-design/icons";
import { useModel } from "@umijs/max";
import { Tooltip } from "antd";
import { forwardRef, useMemo } from 'react';

type Props = {
  value?: number;
}
const StatusIcon = forwardRef<HTMLSpanElement, Props>(({ value }, ref) => {
  const { optionMap } = useModel('constantModel');
  const map = useMemo(() => {
    return optionMap.status;
  }, [optionMap]);

  let icon;
  switch (value) {
    case DataItemStatus.ENABLE:
      icon = <CheckCircleFilled className={'text-green-500'} />;
      break;
    case DataItemStatus.FORBIDDEN:
      icon = <CloseCircleFilled />;
      break;
    case DataItemStatus.LOCKING:
      icon = <LockFilled className={'text-gray-500'} />
      break;
    case DataItemStatus.EXPIRED:
      icon = <ExclamationCircleFilled className={'text-orange-400'} />
      break;

    default:
      icon = null;
  }

  return (
    <Tooltip title={value != undefined && map[value] ? map[value].label : '未知'}>
      <span ref={ref}>{icon}</span>
    </Tooltip>
  )
});
export default StatusIcon;
