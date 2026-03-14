import { PageContainer, PageContainerProps } from "@ant-design/pro-components";
import { forwardRef } from 'react';

type Props = Omit<PageContainerProps, 'header'>;

const ProPageContainer = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { children, style, token, ...rest } = props;
  return (
    <div ref={ref} style={style}>
      <PageContainer
        header={{ title: undefined, breadcrumb: {} }}
        token={token}
        {...rest}
      >
        {children}
      </PageContainer>
    </div>
  )
});

export default ProPageContainer;
