import { DefaultFooter } from '@ant-design/pro-components';
import React from 'react';

const Footer: React.FC = () => {
    return (
        // <DefaultFooter style={{background: 'none',}}
      //                // links={[
      //                //     {
      //                //         key: 'Ant Design Pro',
      //                //         title: 'Ant Design Pro',
      //                //         href: 'https://pro.ant.design',
      //                //         blankTarget: true,
      //                //     },
      //                //     {
      //                //         key: 'github',
      //                //         title: <GithubOutlined/>,
      //                //         href: 'https://github.com/ant-design/ant-design-pro',
      //                //         blankTarget: true,
      //                //     },
      //                //     {
      //                //         key: 'Ant Design',
      //                //         title: 'Ant Design',
      //                //         href: 'https://ant.design',
      //                //         blankTarget: true,
      //                //     },
      //                // ]}
      //                copyright={'2021 泰若科技（广州）有限公司'}
      // />

  <div style={{
    padding: '24px 0',
    textAlign: 'center',
    color: 'rgba(0, 0, 0, 0.45)',
    fontSize: '12px',
    background: 'transparent'
  }}>
    © 2021 泰若科技（广州）有限公司
  </div>
    );
};

export default Footer;
