import { request } from '@umijs/max';

/**
 * 通知公告
 */
export interface SysNotice {
    id: number;
    noticeTitle?: string;
    noticeType?: string;
    noticeContent?: string;
    status?: import("@/enums").DataItemStatus;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
    createBy?: string;
    readFlag?: boolean;
}

/**
 * 获取通知公告详细
 */
export async function findNoticeById(id: number | string) {
    return request<API.Result<SysNotice>>(`/api/system/notice/${id}`, {
        method: 'GET',
    });
}

/**
 * 标记公告为已读
 */
export async function markNoticeAsRead(id: number | string) {
    return request<API.Result<void>>(`/api/system/notice/${id}/read`, {
        method: 'POST',
    });
}

/**
 * 分页查询通知公告
 */
export async function findNoticePage(params?: any) {
    return request<API.Result<API.PageResult<SysNotice>>>('/api/system/notice', {
        method: 'GET',
        params,
    });
}

// 兼容旧名称
export const noticeApi = {
    get: findNoticeById,
    findByPage: findNoticePage,
    markAsRead: markNoticeAsRead,
};
