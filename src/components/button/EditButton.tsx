import React from 'react';
import { Tooltip, Button } from 'antd';
import { EditFilled } from '@ant-design/icons';

const EditButton = (props: any) => (
    <Tooltip title={'编辑'} key={'edit'}>
        <Button
            type='text'
            shape='circle'
            icon={<EditFilled />}
            size={'small'}
            {...props}
        />
    </Tooltip>
);

export default EditButton;
