import { ToolFilled } from "@ant-design/icons";
import { Button, Tooltip } from "antd";

const ConfigButton = (props: any) => {
    const { tooltip, ...rest } = props;
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