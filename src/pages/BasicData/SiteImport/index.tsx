import { uploadSiteConfig, type ImportResult } from '@/apis';
import { PageContainer } from '@ant-design/pro-components';
import {
  InboxOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Modal,
  Row,
  Typography,
  Upload,
  Space,
  Tag
} from 'antd';
import type { UploadProps } from 'antd';
import React, { useState } from 'react';

const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;

const SiteImport: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const props: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.yaml,.yml',
    showUploadList: false,
    beforeUpload: (file) => {
      const isYaml = file.name.endsWith('.yaml') || file.name.endsWith('.yml');
      if (!isYaml) {
        message.error('仅支持导入 YAML 格式文件（.yaml 或 .yml）');
      }
      return isYaml || Upload.LIST_IGNORE;
    },
    customRequest: async (options) => {
      const { file, onSuccess, onError } = options;
      setLoading(true);
      try {
        const res = await uploadSiteConfig(file as File);
        if (res.success && res.data) {
          setResult(res.data);
          setModalVisible(true);
          message.success('场站配置导入成功');
          onSuccess?.(res.data);
        } else {
          message.error(res.message || '导入失败');
          onError?.(new Error(res.message));
        }
      } catch (e: any) {
        message.error('网络错误或服务器异常');
        onError?.(e);
      } finally {
        setLoading(false);
      }
    },
  };

  const exampleYaml = `# 企业基本信息
site:
  name: "示范工厂"
  code: "SFGY"

energy_types:
  - code: ELECTRIC
    name: 电力
    unit: kWh

energy_units:
  - code: UNIT-01
    name: 生产车间
    type: GENERAL
    gateways:
      - code: GW-001
        name: 采集网关
    equipments:
      - code: EQ-01
        name: 动力设备
    meters:
      - code: MTR-01
        name: 总电表
        type: 电表
        energy_type: ELECTRIC
        gateway: GW-001
        points:
          - code: P-01
            name: 有功电能
            type: COLLECT
            unit: kWh
            energy_type: ELECTRIC`;

  return (
    <PageContainer title="场站配置导入" subTitle="通过 YAML 配置文件一键初始化场站全量设备及关联关系">
      <Row gutter={24}>
        <Col span={16}>
          <Card 
            title={<span><SendOutlined /> 开始导入</span>} 
            bordered={false} 
            loading={loading}
          >
            <Dragger {...props} disabled={loading}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或将场站配置文件拖拽到此区域上传</p>
              <p className="ant-upload-hint">
                支持单个 .yaml 或 .yml 文件上传。系统将根据文件内容自动创建能源类型、用能单元、网关、设备、仪表及测点。
              </p>
            </Dragger>

            <Divider orientation="left">操作说明</Divider>
            <Typography>
              <Paragraph>
                1. 场站配置文件是系统的核心数据交换格式，描述了工厂的完整用能结构。
              </Paragraph>
              <Paragraph>
                2. 支持**幂等导入**：如果编码（Code）已存在，系统将更新其属性而非重复创建。
              </Paragraph>
              <Paragraph>
                3. <Text strong>数据一致性</Text>：导入过程中会自动建立物理连接（网关-通道-仪表）和逻辑归属（用能单元-设备-仪表-测点）。
              </Paragraph>
            </Typography>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="配置结构示例" bordered={false}>
            <pre style={{ 
              backgroundColor: '#f5f5f5', 
              padding: '12px', 
              borderRadius: '4px', 
              fontSize: '12px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {exampleYaml}
            </pre>
            <div style={{ marginTop: '12px' }}>
              <Tag color="blue">YAML 格式</Tag>
              <Tag color="cyan">UTF-8 编码</Tag>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>导入结果统计</span>
          </Space>
        }
        open={modalVisible}
        onOk={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        width={600}
        footer={[
          <Button key="ok" type="primary" onClick={() => setModalVisible(false)}>
            确定
          </Button>,
        ]}
      >
        {result && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="能源类型" span={1}>{result.energyTypes}</Descriptions.Item>
            <Descriptions.Item label="用能单元" span={1}>{result.energyUnits}</Descriptions.Item>
            <Descriptions.Item label="网关" span={1}>{result.gateways}</Descriptions.Item>
            <Descriptions.Item label="数据源" span={1}>{result.dataSources}</Descriptions.Item>
            <Descriptions.Item label="用能设备" span={1}>{result.equipments}</Descriptions.Item>
            <Descriptions.Item label="计量器具" span={1}>{result.meters}</Descriptions.Item>
            <Descriptions.Item label="计量点" span={2}>{result.meterPoints}</Descriptions.Item>
          </Descriptions>
        )}
        <Paragraph style={{ marginTop: '16px', color: '#666' }}>
          提示：导入已完成。您可以前往各管理模块查看详细结果。
        </Paragraph>
      </Modal>
    </PageContainer>
  );
};

export default SiteImport;
