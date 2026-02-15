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
 * 通知公告管理接口
 */
export const noticeApi = {
    // 分页查询通知公告
    findByPage: (params: any) => request('/api/system/notice', { method: 'GET', params }),

    // 获取通知公告详细
    get: (id: number | string) => request(`/api/system/notice/${id}`, { method: 'GET' }),

    // 标记公告为已读
    markAsRead: (id: number | string) => request(`/api/system/notice/${id}/read`, { method: 'POST' }),

    // 保存或更新通知公告
    saveOrUpdate: (data: SysNotice) => request('/api/system/notice', { method: 'POST', data }),

    // 新增通知公告
    add: (data: SysNotice) => request('/api/system/notice', { method: 'POST', data }),

    // 修改通知公告
    update: (data: SysNotice) => request('/api/system/notice', { method: 'POST', data }),

    // 删除通知公告
    remove: (ids: any) => {
        if (Array.isArray(ids)) {
            return request('/api/system/notice', { method: 'DELETE', data: ids });
        }
        return request(`/api/system/notice/${ids}`, { method: 'DELETE' });
    }
};
