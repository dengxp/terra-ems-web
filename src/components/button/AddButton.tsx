import { PlusOutlined } from '@ant-design/icons';
import { Button, ButtonProps } from 'antd';
import React from 'react';

interface AddButtonProps extends ButtonProps {
    children?: React.ReactNode;
}

const AddButton: React.FC<AddButtonProps> = ({ children = '新建', ...rest }) => {
    return (
        <Button
            color="primary"
            icon={<PlusOutlined />}
            variant="outlined"
            size="small"
            {...rest}
        >
            {children}
        </Button>
    );
};

export default AddButton;
