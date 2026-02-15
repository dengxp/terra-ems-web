import { Modal } from "antd";
import { ModalFuncProps } from "antd/es/modal/interface";
import styles from "./index.less";

type Props = ModalFuncProps;

function Index(props: Props) {
  Modal.confirm({
    ...props,
    okButtonProps: {
      ...props.okButtonProps,
      className: styles.okButton + ' custom'
    },
    cancelButtonProps: {
      ...props.cancelButtonProps,
      className: styles.cancelButton + ' custom'
    }
  })
}

export default Index
