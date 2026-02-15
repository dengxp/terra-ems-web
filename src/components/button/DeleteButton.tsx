import { DeleteFilled } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import IconButton from "./IconButton";

const DeleteButton = (props: any) => {

    const { tooltip, onConfirm, ...rest } = props;

    return (
        <Popconfirm
            title="提示"
            description="确定要删除选中的记录吗？"
            onConfirm={onConfirm}
            okText="确定"
            cancelText="取消"
        >
            <IconButton
                tooltip={tooltip ? tooltip : '删除'}
                icon={<DeleteFilled />}
                {...rest}
            />
        </Popconfirm>
    )
}

export default DeleteButton;
