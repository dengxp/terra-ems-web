import React from 'react';
import {EditFilled} from '@ant-design/icons';
import {IconButton} from "@/components/button/index";

const EditButton = (props: any) => {
  const {tooltip, ...rest} = props;
  return <IconButton tooltip={tooltip ? tooltip : '编辑'}
                     icon={<EditFilled />}
                     {...rest}
  />
}

export default EditButton;
