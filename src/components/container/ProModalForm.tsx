import { ModalForm, ModalFormProps } from "@ant-design/pro-components";
import React from 'react';

export type ProModalFormProps = Omit<ModalFormProps, 'children'> & {
  children?: React.ReactNode;
}
const ProModalForm = (props: ProModalFormProps) => {


  const { title, open, children, ...rest } = props;

  return (
    <ModalForm title={title}
      open={open}
      layout={'horizontal'}
      {...rest}
      className={'py-4 px-4'}
      modalProps={{
        centered: true,
        destroyOnHidden: true,
        ...rest.modalProps,
        styles: {
          ...rest.modalProps?.styles,
          body: {
            maxHeight: '80vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            ...rest.modalProps?.styles?.body,
          },
        },
      }}
    >
      {children}
    </ModalForm>
  )
};

export default ProModalForm;
