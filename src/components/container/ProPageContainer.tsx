import { PageContainer, PageContainerProps } from "@ant-design/pro-components";
import { forwardRef } from 'react';

type Props = Omit<PageContainerProps, 'header'>;

const ProPageContainer = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, ...rest } = props;
  return (
    <div ref={ref}>
      <PageContainer header={{ title: undefined, breadcrumb: {} }} {...rest}>
        {children}
      </PageContainer>
    </div>
  )
});

export default ProPageContainer;
