// import React, {useEffect, useMemo} from 'react';
// import {Select, SelectProps} from "antd";
// import constantState, {fetchOptions} from "@/stores/constants";
// import {useSnapshot} from "@umijs/max";
//
// type Props = SelectProps & {
//   dickey: string
// }
//
// function DictionarySelect(props: Props) {
//   const {dickey, ...rest} = props;
//   const snap = useSnapshot(constantState);
//
//   useEffect(() => {
//     if (!snap.optionMap || !snap.optionMap[dickey]) {
//       void fetchOptions();
//     }
//   }, [snap.optionMap]);
//
//   const options = useMemo(() => {
//     return snap.optionMap[dickey] ? [...snap.optionMap[dickey]] : [];
//   }, [snap.optionMap, dickey]);
//
//   return (
//     <Select options={options} {...rest} />
//   );
// }
//
// export default DictionarySelect;
