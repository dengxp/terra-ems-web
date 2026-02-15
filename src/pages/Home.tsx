import { MoneyCollectOutlined } from "@ant-design/icons";
import { PageContainer } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Card, Col, Row, Space, theme } from 'antd';
import React from 'react';

/**
 * 每个单独的卡片，为了复用样式抽成了组件
 * @param param0
 * @returns
 */
const InfoCard: React.FC<{
  title: string;
  index: number;
  desc: string;
  href: string;
}> = ({title, href, index, desc}) => {
  const {useToken} = theme;

  const {token} = useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        boxShadow: token.boxShadow,
        borderRadius: '8px',
        fontSize: '14px',
        color: token.colorTextSecondary,
        lineHeight: '22px',
        padding: '16px 19px',
        minWidth: '220px',
        flex: 1,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            lineHeight: '22px',
            backgroundSize: '100%',
            textAlign: 'center',
            padding: '8px 16px 16px 12px',
            color: '#FFF',
            fontWeight: 'bold',
            backgroundImage:
              "url('https://gw.alipayobjects.com/zos/bmw-prod/daaf8d50-8e6d-4251-905d-676a24ddfa12.svg')",
          }}
        >
          {index}
        </div>
        <div
          style={{
            fontSize: '16px',
            color: token.colorText,
            paddingBottom: 8,
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: '14px',
          color: token.colorTextSecondary,
          textAlign: 'justify',
          lineHeight: '22px',
          marginBottom: 8,
        }}
      >
        {desc}
      </div>
      <a href={href} target="_blank" rel="noreferrer">
        了解更多 {'>'}
      </a>
    </div>
  );
};

const Home: React.FC = () => {
  const {token} = theme.useToken();
  const {initialState} = useModel('@@initialState');
  return (
    <PageContainer>
      <Card
        style={{
          borderRadius: 8,
          backgroundImage:
            initialState?.layoutSettings?.navTheme === 'realDark'
              ? 'background-image: linear-gradient(75deg, #1A1B1F 0%, #191C1F 100%)'
              : 'background-image: linear-gradient(75deg, #FBFDFF 0%, #F5F7FF 100%)',
        }}
      >
        <div
          style={{
            backgroundPosition: '100% -30%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '274px auto',
            backgroundImage:
              "url('https://gw.alipayobjects.com/mdn/rms_a9745b/afts/img/A*BuFmQqsB2iAAAAAAAAAAAAAAARQnAQ')",
          }}
        >
          <Row align={'top'}>
            <Col span={12}>
              <div
                style={{
                  fontSize: '20px',
                  color: token.colorTextHeading,
                }}
              >
                若依管理系统Web前端（Antd版）
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: token.colorTextSecondary,
                  lineHeight: '22px',
                  marginTop: 16,
                  marginBottom: 8,
                  width: '65%',
                }}
              >
                若依管理系统是一个优化的开源框架，她可以用于所有的Web应用程序，如网站管理后台，网站会员中心，CMS，CRM，OA等等。
                但它的前端要么是传统的不分离方式，要么是Vue版本，因个人喜欢Ant Design，因此特开发基于React+Ant Design框架的版本
              </p>
            </Col>
            <Col span={12}>
              <div
                style={{
                  fontSize: '20px',
                  color: token.colorTextHeading,
                }}
              >
                技术框架
              </div>
              <ul style={{
                listStyleType: 'circle',
                paddingLeft: 16,
                marginTop: 16
              }}>
                <li>React</li>
                <li>UmiJS</li>
                <li>Ant Design</li>
                <li>Axios</li>
                <li>TailWindCSS</li>
              </ul>
            </Col>
          </Row>

          <Space align={'center'} size={'large'}>
            <p className={'font-bold mb-2'}>当前版本：v1.0</p>
            <div className={'mb-4'}>
              <Button color={'danger'}
                      size={'small'}
                      variant={'filled'}
                      icon={<MoneyCollectOutlined/>}
              >免费开源</Button>
            </div>
          </Space>


          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <InfoCard
              index={1}
              href="https://umijs.org/docs/introduce/introduce"
              title="了解 umi"
              desc="umi 是一个可扩展的企业级前端应用框架,umi 以路由为基础的，同时支持配置式路由和约定式路由，保证路由的功能完备，并以此进行功能扩展。"
            />
            <InfoCard
              index={2}
              title="了解 ant design"
              href="https://ant.design"
              desc="antd 是基于 Ant Design 设计体系的 React UI 组件库，主要用于研发企业级中后台产品。"
            />
            <InfoCard
              index={3}
              title="了解 Pro Components"
              href="https://procomponents.ant.design"
              desc="ProComponents 是一个基于 Ant Design 做了更高抽象的模板组件，以 一个组件就是一个页面为开发理念，为中后台开发带来更好的体验。"
            />
          </div>
        </div>
      </Card>
    </PageContainer>
  );
};

export default Home;
