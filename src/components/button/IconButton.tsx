import React, { forwardRef } from 'react';
import { Tooltip, Button } from 'antd';

const IconButton = forwardRef((props: any, ref: any) => {

    const { variant, color, tooltip, icon, size, ...rest } = props;

    return (
        <Tooltip title={tooltip ? tooltip : '配置'}>
            <span ref={ref} className="inline-block">
                <Button variant={variant || 'text'}
                    color={color || 'default'}
                    shape="circle"
                    size={size || 'small'}
                    icon={icon}
                    {...rest}
                />
            </span>
        </Tooltip>
    );
});

export default IconButton;
