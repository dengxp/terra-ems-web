/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import { getKnowledgeArticle, KnowledgeArticle } from '@/apis/knowledge';
import { ClockCircleOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { Descriptions, Divider, Modal, Space, Spin, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';

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
