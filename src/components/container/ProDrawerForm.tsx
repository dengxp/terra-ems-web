import { DrawerForm, DrawerFormProps } from "@ant-design/pro-components";
import React from 'react';

export type ProDrawerFormProps = Omit<DrawerFormProps, 'children'> & {
    children?: React.ReactNode;
}

const ProDrawerForm = (props: ProDrawerFormProps) => {
    const { title, open, children, ...rest } = props;

    return (
        <DrawerForm
            title={title}
            open={open}
            layout={'horizontal'}
            width={600}
            {...rest}
            drawerProps={{
                destroyOnClose: true,
                ...rest.drawerProps,
            }}
        >
            {children}
        </DrawerForm>
    )
};

export default ProDrawerForm;
