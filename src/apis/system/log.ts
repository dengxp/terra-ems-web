import { request } from '@umijs/max';

/**
 * 系统日志
 */
export interface SysLog {
    id: number;
    logType?: string;
    title?: string;
    businessType?: number;
    method?: string;
    requestMethod?: string;
    username?: string;
    deptName?: string;
    url?: string;
    ip?: string;
    location?: string;
    param?: string;
    result?: string;
    status?: number;
    errorMsg?: string;
    costTime?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 系统日志管理接口
 */
export const logApi = {
    // 分页查询系统日志
    findByPage: (params: any) => request('/api/system/log', { method: 'GET', params }),

    // 获取系统日志详细
    get: (id: number) => request(`/api/system/log/${id}`, { method: 'GET' }),

    // 删除系统日志
    remove: (ids: any) => {
        if (Array.isArray(ids)) {
            return request('/api/system/log', { method: 'DELETE', data: ids });
        }
        return request(`/api/system/log/${ids}`, { method: 'DELETE' });
    },

    // 清空系统日志 (Optional, check if backend supports)
    clean: () => request('/api/system/log/clean', { method: 'DELETE' }),
};
