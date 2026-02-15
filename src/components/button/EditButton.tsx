import { IconButton } from "@/components/button/index";
import { EditFilled } from '@ant-design/icons';

const EditButton = (props: any) => {
  const {tooltip, ...rest} = props;
  return <IconButton tooltip={tooltip ? tooltip : '编辑'}
                     icon={<EditFilled />}
                     {...rest}
  />
}

export default EditButton;
