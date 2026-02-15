import type { SysNotice } from '@/apis/system/notice';
import { noticeApi } from '@/apis/system/notice';
import { OperationEnum } from '@/enums';
import { useWebSocket } from '@/hooks/common/useWebSocket';
import NoticeDetailDialog from '@/pages/system/Notice/NoticeDetailDialog';
import { Alert, Carousel } from 'antd';
import React, { useEffect, useState } from 'react';

const BANNER_HIDDEN_KEY = 'terra_notice_banner_hidden_id';

const NoticeBanner: React.FC = () => {
    const [notices, setNotices] = useState<SysNotice[]>([]);
    const [visible, setVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentNotice, setCurrentNotice] = useState<SysNotice | null>(null);

    const fetchNotices = async () => {
        try {
            const res = await noticeApi.findByPage({
                pageNumber: 0,
                pageSize: 5,
                status: '0',
                noticeType: '2', // 仅公告
                unreadOnly: true, // 仅未读
            });
            const list = res.data?.content || [];
            if (list.length > 0) {
                // 检查用户是否手动关闭过最新的一条
                const hiddenId = localStorage.getItem(BANNER_HIDDEN_KEY);
                if (hiddenId !== list[0].id?.toString()) {
                    setNotices(list);
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            } else {
                setVisible(false);
            }
        } catch (error) {
            console.error('[NoticeBanner] Fetch Error', error);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    useWebSocket({
        onMessage: (msg: any) => {
            if (msg.type === 'NOTICE_NEW' && msg.data?.noticeType === '2') {
                // 新公告插入最前
                setNotices(prev => [msg.data, ...prev].slice(0, 5));
                setVisible(true);
                localStorage.removeItem(BANNER_HIDDEN_KEY);
            } else if (msg.type === 'NOTICE_DELETE') {
                fetchNotices();
            }
        },
    });

    const handleClose = () => {
        if (notices.length > 0) {
            localStorage.setItem(BANNER_HIDDEN_KEY, notices[0].id?.toString() || '');
        }
        setVisible(false);
    };

    const openDetail = (n: SysNotice) => {
        setCurrentNotice(n);
        setDetailVisible(true);
    };

    if (!visible || notices.length === 0) return null;

    return (
        <div className="notice-banner-wrapper">
            <Alert
                message={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 'bold', whiteSpace: 'nowrap', color: '#1d39c4' }}>
                            <span style={{ marginRight: 4 }}>📢</span>系统公告:
                        </span>
                        <div style={{ flex: 1, overflow: 'hidden', height: '24px' }}>
                            <Carousel
                                autoplay
                                dots={false}
                                vertical
                                style={{ height: '24px' }}
                            >
                                {notices.map((n) => (
                                    <div key={n.id} style={{ height: '24px', lineHeight: '24px' }}>
                                        <span
                                            style={{
                                                cursor: 'pointer',
                                                color: '#262626',
                                                transition: 'color 0.3s'
                                            }}
                                            onClick={() => openDetail(n)}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = '#1890ff')}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = '#262626')}
                                        >
                                            {n.noticeTitle}
                                        </span>
                                    </div>
                                ))}
                            </Carousel>
                        </div>
                        <span
                            style={{ color: '#1890ff', fontSize: '12px', whiteSpace: 'nowrap', cursor: 'pointer' }}
                            onClick={() => openDetail(notices[0])}
                        >
                            更多详情 &raquo;
                        </span>
                    </div>
                }
                type="info"
                banner
                closable
                onClose={handleClose}
                style={{
                    borderBottom: '1px solid #adc6ff',
                    backgroundColor: '#f0f5ff',
                    padding: '4px 12px'
                }}
            />

            <NoticeDetailDialog
                open={detailVisible}
                onOpenChange={setDetailVisible}
                record={currentNotice || undefined}
                operation={OperationEnum.DETAIL}
                onSuccess={() => {
                    // 已读反馈：重新拉取未读列表
                    fetchNotices();
                }}
            />
        </div>
    );
};

export default NoticeBanner;
