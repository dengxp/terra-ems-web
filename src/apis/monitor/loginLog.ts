import { request } from '@umijs/max';

/**
 * 登录日志
 */
export interface SysLoginLog {
    id: number;
    userName?: string;
    status?: string;
    ipaddr?: string;
    loginLocation?: string;
    browser?: string;
    os?: string;
    msg?: string;
    loginTime?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 登录日志管理接口
 */
export const loginLogApi = {
    // 分页查询登录日志
    findByPage: (params: any) => {
        const { current, pageSize, ...rest } = params;
        return request('/api/monitor/login-log', {
            method: 'GET',
            params: {
                pageNumber: current ? current - 1 : 0,
                pageSize: pageSize || 10,
                ...rest,
            },
        });
    },

    // 获取登录日志详细
    findById: (id: number) => request(`/api/monitor/login-log/${id}`, { method: 'GET' }),

    // 删除登录日志
    remove: (ids: number | number[]) => {
        if (Array.isArray(ids)) {
            return request('/api/monitor/login-log', { method: 'DELETE', data: ids });
        }
        return request(`/api/monitor/login-log/${ids}`, { method: 'DELETE' });
    },

    // 清空登录日志
    clean: () => request('/api/monitor/login-log/clean', { method: 'DELETE' }),
};
