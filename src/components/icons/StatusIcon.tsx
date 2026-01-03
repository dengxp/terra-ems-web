import React, {useEffect, useMemo} from 'react';
import {CheckCircleFilled, CloseCircleFilled, ExclamationCircleFilled, LockFilled} from "@ant-design/icons";
import {Tooltip} from "antd";
import {useModel} from "@umijs/max";
import {DataItemStatus} from "@/enums";

type Props = {
  value?: number;
}
const StatusIcon = ({value}: Props) => {
  const {optionMap} = useModel('constantModel');
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
    <Tooltip title={value != undefined && map[value] ? map[value].label : '未知'}>{icon}</Tooltip>
  )
}
export default StatusIcon;
