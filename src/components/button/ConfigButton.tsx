import React from 'react';
import {Button, Tooltip} from "antd";
import {SettingFilled, ToolFilled} from "@ant-design/icons";

const ConfigButton = (props: any) => {
    const {tooltip, ...rest} = props;
    return (
        <Tooltip title={tooltip ? tooltip : '配置'} key={'config'}>
            <Button type={'text'}
                    shape='circle'
                    icon={<ToolFilled />}
                    size={'small'}
                    {...rest}
            />
        </Tooltip>
    );
};

export default ConfigButton;