import React from 'react';
import {DeleteFilled} from '@ant-design/icons';
import IconButton from "./IconButton";

const DeleteButton = (props: any) => {

    const {tooltip, ...rest} = props;
    return <IconButton tooltip={tooltip ? tooltip : '删除'}
                       icon={<DeleteFilled />}
                       {...rest}
    />
}

export default DeleteButton;
