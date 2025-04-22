// import React, {useEffect, useMemo} from 'react';
// import {useSnapshot} from "@umijs/max";
// import constantState, {fetchMaps} from "@/stores/constants";
//
// import Icon, {ManOutlined, WomanOutlined} from "@ant-design/icons";
// import {Tooltip} from "antd";
// import {ReactComponent as UnknownSvg} from '@/icons/svg/unknown.svg';
//
// type Props = {
//   value?: number;
// }
//
// const GenderIcon = ({value}: Props) => {
//
//   const snap = useSnapshot(constantState);
//
//   useEffect(() => {
//     if (!snap.mapMaps || !snap.mapMaps['gender']) {
//       void fetchMaps();
//     }
//   }, [snap.mapMaps]);
//
//   const map = useMemo(() => {
//     return snap.mapMaps['gender'] || {}; // 如果 dictKey 不存在，则返回一个空对象
//   }, [snap.mapMaps]);
//
//   let icon;
//   switch (value) {
//     case 0:
//       icon = <WomanOutlined style={{color: 'magenta'}}/>;
//       break;
//     case 1:
//       icon = <ManOutlined style={{color: 'blue'}}/>;
//       break;
//     default:
//       icon = <Icon component={UnknownSvg}/>;
//       break;
//   }
//
//   return (
//     <Tooltip title={value != undefined && map[value] ? map[value] : '未知'}>{icon}</Tooltip>
//   );
// }
//
// export default GenderIcon;
