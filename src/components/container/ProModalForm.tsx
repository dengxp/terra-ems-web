import React from 'react';
import {ModalForm, ModalFormProps} from "@ant-design/pro-components";

export type ProModalFormProps = ModalFormProps & {
  children?: React.ReactNode | React.ReactNode[];
}
const ProModalForm = (props: ProModalFormProps) => {

  const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 14, offset: 1},
  }

  const {title, open, children, ...rest} = props;

  return (
    <ModalForm title={title}
               open={open}
               layout={'horizontal'}
               {...rest}
               className={'py-4'}
               modalProps={{
                 centered: true,
                 destroyOnClose: true,
                 styles: {
                   body: {
                     maxHeight: '80vh',
                     overflowY: 'auto'
                   }
                 }
               }}
    >
      {children}
    </ModalForm>
  )
};

export default ProModalForm;
