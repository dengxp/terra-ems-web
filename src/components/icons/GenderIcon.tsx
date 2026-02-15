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
