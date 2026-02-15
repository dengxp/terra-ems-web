import { noticeApi, SysNotice } from '@/apis/system/notice';
import { OperationEnum } from '@/enums';
import { useWebSocket } from '@/hooks/common/useWebSocket';
import NoticeDetailDialog from '@/pages/system/Notice/NoticeDetailDialog';
import { BellOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';
import { Badge, List, notification, Popover, Spin, Tabs, Typography } from 'antd';
import { createStyles } from 'antd-style';
import React, { useCallback, useEffect, useState } from 'react';

const { Text } = Typography;

const useStyles = createStyles(({ token }) => {
    return {
        action: {
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            padding: '0 12px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            borderRadius: token.borderRadius,
            '&:hover': {
                backgroundColor: token.colorBgTextHover,
            },
        },
        popover: {
            padding: 0,
            width: 336,
        },
        noticeItem: {
            padding: '12px 24px',
            cursor: 'pointer',
            transition: 'all 0.3s',
            '&:hover': {
                backgroundColor: token.colorBgTextHover,
            },
        }
    };
});

const NoticeIcon: React.FC = () => {
    const { styles } = useStyles();
    const [loading, setLoading] = useState(false);
    const [notices, setNotices] = useState<SysNotice[]>([]); // 通知 (noticeType = 1)
    const [announcements, setAnnouncements] = useState<SysNotice[]>([]); // 公告 (noticeType = 2)
    const [totalNotice, setTotalNotice] = useState(0);
    const [totalAnnouncement, setTotalAnnouncement] = useState(0);

    // 详情弹窗状态
    const [detailOpen, setDetailOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<SysNotice>();

    const fetchNotices = useCallback(async () => {
        setLoading(true);
        try {
            // 获取通知 (1)，只查未读
            const resNotice = await noticeApi.findByPage({
                pageNumber: 0,
                pageSize: 5,
                status: '0',
                noticeType: '1',
                unreadOnly: true
            });
            if (resNotice.data) {
                setNotices(resNotice.data.content || []);
                setTotalNotice(resNotice.data.totalElements || 0);
            }

            // 获取公告 (2)，只查未读
            const resAnnounce = await noticeApi.findByPage({
                pageNumber: 0,
                pageSize: 5,
                status: '0',
                noticeType: '2',
                unreadOnly: true
            });
            if (resAnnounce.data) {
                setAnnouncements(resAnnounce.data.content || []);
                setTotalAnnouncement(resAnnounce.data.totalElements || 0);
            }
        } catch (error) {
            console.error('Fetch notices failed:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotices();
    }, [fetchNotices]);

    // 集成 WebSocket 监听
    useWebSocket({
        onMessage: (msg: any) => {
            console.log('[NoticeIcon] Received WebSocket msg:', msg);
            if (msg.type === 'NOTICE_NEW') {
                const newNotice = msg.data;
                // 根据类型更新本地列表和总数缓存
                if (newNotice.noticeType === '2') {
                    setAnnouncements(prev => [newNotice, ...prev]);
                    setTotalAnnouncement(prev => prev + 1);
                    notification.info({
                        message: `新公告：${newNotice.noticeTitle}`,
                        description: '点击查看详情',
                        placement: 'bottomRight',
                        onClick: () => {
                            setCurrentRecord(newNotice);
                            setDetailOpen(true);
                        }
                    });
                } else {
                    setNotices(prev => [newNotice, ...prev]);
                    setTotalNotice(prev => prev + 1);
                    notification.info({
                        message: `新通知：${newNotice.noticeTitle}`,
                        description: '点击查看详情',
                        placement: 'bottomRight',
                        onClick: () => {
                            setCurrentRecord(newNotice);
                            setDetailOpen(true);
                        }
                    });
                }
            } else if (msg.type === 'NOTICE_DELETE') {
                fetchNotices(); // 删除操作直接重新拉取最准确
            }
        },
    });

    const showDetail = (notice: SysNotice) => {
        setCurrentRecord(notice);
        setDetailOpen(true);
    };

    const renderList = (data: SysNotice[]) => (
        <Spin spinning={loading}>
            <List
                dataSource={data}
                renderItem={(item) => (
                    <List.Item className={styles.noticeItem} onClick={() => showDetail(item)}>
                        <List.Item.Meta
                            title={<Text ellipsis={{ tooltip: item.noticeTitle }}>{item.noticeTitle}</Text>}
                            description={<Text type="secondary" style={{ fontSize: 12 }}>{item.createdAt}</Text>}
                        />
                    </List.Item>
                )}
                locale={{ emptyText: '暂无未读消息' }}
                footer={
                    <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0' }}>
                        <a onClick={() => history.push('/system/notice')}>查看更多</a>
                    </div>
                }
            />
        </Spin>
    );

    const content = (
        <div className={styles.popover}>
            <Tabs
                defaultActiveKey="notice"
                centered
                items={[
                    {
                        key: 'notice',
                        label: `通知 (${totalNotice})`,
                        children: renderList(notices),
                    },
                    {
                        key: 'announce',
                        label: `公告 (${totalAnnouncement})`,
                        children: renderList(announcements),
                    },
                ]}
            />
        </div>
    );

    const totalCount = totalNotice + totalAnnouncement;

    return (
        <>
            <Popover
                placement="bottomRight"
                content={content}
                trigger="click"
                overlayClassName={styles.popover}
            >
                <span className={styles.action}>
                    <Badge count={totalCount} size="small" offset={[2, 0]}>
                        <BellOutlined style={{ fontSize: 18 }} />
                    </Badge>
                </span>
            </Popover>

            <NoticeDetailDialog
                open={detailOpen}
                onOpenChange={setDetailOpen}
                record={currentRecord}
                operation={OperationEnum.DETAIL}
                onSuccess={() => {
                    // 已读成功后刷新列表，数字会自动减一
                    fetchNotices();
                }}
            />
        </>
    );
};

export default NoticeIcon;
