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

import { forwardRef, useMemo } from 'react';

import { ReactComponent as UnknownSvg } from '@/icons/svg/unknown.svg';
import Icon, { ManOutlined, WomanOutlined } from "@ant-design/icons";
import { useModel } from "@umijs/max";
import { Tooltip } from "antd";

type Props = {
  value?: number;
}

const GenderIcon = forwardRef<HTMLSpanElement, Props>(({ value }, ref) => {

  const { mapMaps } = useModel('constantModel');
  const map = useMemo(() => {
    return mapMaps.gender || {};
  }, [mapMaps]);

  let icon;
  switch (value) {
    case 0:
      icon = <ManOutlined style={{ color: 'blue' }} />;
      break;
    case 1:
      icon = <WomanOutlined style={{ color: 'magenta' }} />;
      break;
    default:
      icon = <Icon component={UnknownSvg} />;
      break;
  }

  return (
    <Tooltip title={value != undefined && map[value] ? map[value] : '未知'}>
      <span ref={ref}>{icon}</span>
    </Tooltip>
  );
});

export default GenderIcon;
