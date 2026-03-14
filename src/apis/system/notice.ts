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
