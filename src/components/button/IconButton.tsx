import React from 'react';
import {Tooltip, Button} from 'antd';

const IconButton = (props: any) => {

    const {variant, color, tooltip, icon, size, ...rest} = props;

    return (
        <Tooltip title={tooltip ? tooltip : '配置'}>
            <Button variant={variant || 'text'}
                    color={color || 'default'}
                    size={size || 'small'}
                    icon={icon}
                    {...rest}
            />
        </Tooltip>
    );
};

export default IconButton;
