// import React, {useEffect, useMemo} from 'react';
// import {CheckCircleFilled, CloseCircleFilled} from "@ant-design/icons";
// import {Tooltip} from "antd";
// import constantState, {fetchMaps} from "@/stores/constants";
// import {useSnapshot} from "@@/exports";
//
// type Props = {
//   value?: number;
// }
// const StatusIcon = ({value}: Props) => {
//
//   const snap = useSnapshot(constantState);
//
//   const map = useMemo(() => {
//     return snap.mapMaps['status'] || {};
//   }, [snap.mapMaps]);
//
//   useEffect(() => {
//     if (!snap.mapMaps['status']) {
//       void fetchMaps();
//     }
//   }, [snap.mapMaps]);
//
//   let icon;
//   switch (value) {
//     case 0:
//       icon = <CloseCircleFilled />;
//       break;
//     case 1:
//       icon = <CheckCircleFilled style={{color: 'green'}} />;
//       break;
//     default:
//       icon = null;
//   }
//
//   return (
//     <Tooltip title={value && map[value] ? map[value] : '未知'}>{icon}</Tooltip>
//   )
// }
// export default StatusIcon;
// import React, {useEffect, useMemo} from 'react';
// import {CheckCircleFilled, CloseCircleFilled} from "@ant-design/icons";
// import {Tooltip} from "antd";
// import constantState, {fetchMaps} from "@/stores/constants";
// import {useSnapshot} from "@@/exports";
//
// type Props = {
//   value?: number;
// }
// const StatusIcon = ({value}: Props) => {
//
//   const snap = useSnapshot(constantState);
//
//   const map = useMemo(() => {
//     return snap.mapMaps['status'] || {};
//   }, [snap.mapMaps]);
//
//   useEffect(() => {
//     if (!snap.mapMaps['status']) {
//       void fetchMaps();
//     }
//   }, [snap.mapMaps]);
//
//   let icon;
//   switch (value) {
//     case 0:
//       icon = <CloseCircleFilled />;
//       break;
//     case 1:
//       icon = <CheckCircleFilled style={{color: 'green'}} />;
//       break;
//     default:
//       icon = null;
//   }
//
//   return (
//     <Tooltip title={value && map[value] ? map[value] : '未知'}>{icon}</Tooltip>
//   )
// }
// export default StatusIcon;
