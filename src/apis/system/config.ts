import { request } from '@umijs/max';

/**
 * 参数配置
 */
export interface SysConfig {
    id: number;
    configName?: string;
    configKey?: string;
    configValue?: string;
    configType?: string; // Y/N default
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 参数配置管理接口
 */
export const configApi = {
    // 分页查询参数配置
    findByPage: (params: any) => request('/api/system/config', { method: 'GET', params }),

    // 获取参数配置详细
    get: (id: number) => request(`/api/system/config/${id}`, { method: 'GET' }),

    // 根据键名查询参数值
    getConfigValue: (configKey: string) => request(`/api/system/config/configKey/${configKey}`, { method: 'GET' }),

    // 保存或更新参数配置
    saveOrUpdate: (data: SysConfig) => request('/api/system/config', { method: 'POST', data }),

    // 新增参数配置
    add: (data: SysConfig) => request('/api/system/config', { method: 'POST', data }),

    // 修改参数配置
    update: (data: SysConfig) => request('/api/system/config', { method: 'POST', data }),

    // 删除参数配置
    remove: (ids: any) => {
        if (Array.isArray(ids)) {
            return request('/api/system/config', { method: 'DELETE', data: ids });
        }
        return request(`/api/system/config/${ids}`, { method: 'DELETE' });
    }
};
