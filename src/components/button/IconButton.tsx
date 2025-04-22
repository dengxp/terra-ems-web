import React from 'react';
import {Tooltip, Button} from 'antd';

const IconButton = (props: any) => {

    const {type, tooltip, icon, size, ...rest} = props;

    return (
        <Tooltip title={tooltip ? tooltip : '配置'}>
            <Button type={type || 'text'}
                    shape='circle'
                    size={size || 'small'}
                    icon={icon}
                    {...rest}
            />
        </Tooltip>
    );
};

export default IconButton;
