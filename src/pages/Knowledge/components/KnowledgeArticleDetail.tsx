import React, { useEffect, useState } from 'react';
import { Modal, Spin, Typography, Tag, Space, Divider, Descriptions } from 'antd';
import { EyeOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { KnowledgeArticle, getKnowledgeArticle } from '@/apis/knowledge';

const { Title, Paragraph, Text } = Typography;

interface KnowledgeArticleDetailProps {
    visible: boolean;
    articleId?: number;
    onClose: () => void;
}

const KnowledgeArticleDetail: React.FC<KnowledgeArticleDetailProps> = ({
    visible,
    articleId,
    onClose,
}) => {
    const [loading, setLoading] = useState(false);
    const [article, setArticle] = useState<KnowledgeArticle | null>(null);

    useEffect(() => {
        if (visible && articleId) {
            loadArticle();
        }
    }, [visible, articleId]);

    const loadArticle = async () => {
        if (!articleId) return;
        setLoading(true);
        try {
            const res = await getKnowledgeArticle(articleId);
            if (res.success && res.data) {
                setArticle(res.data);
            }
        } catch (error) {
            console.error('加载文章失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            destroyOnHidden
        >
            <Spin spinning={loading}>
                {article && (
                    <div style={{ padding: '16px 0' }}>
                        <Title level={3}>{article.title}</Title>
                        {article.createdAt && (
                            <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
                                <Descriptions.Item label="创建时间">{article.createdAt}</Descriptions.Item>
                            </Descriptions>
                        )}
                        <Space split={<Divider type="vertical" />} style={{ marginBottom: 16 }}>
                            {article.category && <Tag color="blue">{article.category}</Tag>}
                            {article.author && (
                                <Text type="secondary">
                                    <UserOutlined /> {article.author}
                                </Text>
                            )}
                            <Text type="secondary">
                                <EyeOutlined /> {article.viewCount || 0} 次阅读
                            </Text>
                            {article.createdAt && (
                                <Text type="secondary">
                                    <ClockCircleOutlined /> {article.createdAt}
                                </Text>
                            )}
                        </Space>
                        {article.summary && (
                            <Paragraph
                                type="secondary"
                                style={{
                                    background: '#f5f5f5',
                                    padding: '12px 16px',
                                    borderRadius: 6,
                                    marginBottom: 16,
                                }}
                            >
                                {article.summary}
                            </Paragraph>
                        )}
                        <Divider />
                        <div
                            style={{ lineHeight: 1.8 }}
                            dangerouslySetInnerHTML={{ __html: article.content || '' }}
                        />
                    </div>
                )}
            </Spin>
        </Modal>
    );
};

export default KnowledgeArticleDetail;
