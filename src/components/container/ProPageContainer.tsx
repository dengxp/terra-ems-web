import {PageContainer, PageContainerProps} from "@ant-design/pro-components";

type Props = Omit<PageContainerProps, 'header'>;

const ProPageContainer = (props: Props) => {
  const {children, ...rest} = props;
  return (
    <PageContainer header={{title: undefined, breadcrumb: {}}} {...rest}>
      {children}
    </PageContainer>
  )
}

export default ProPageContainer;
