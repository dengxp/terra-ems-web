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
 * 根据键名查询参数值
 */
export async function findConfigValue(configKey: string) {
    return request<API.Result<string>>(`/api/system/config/configKey/${configKey}`, {
        method: 'GET',
    });
}

/**
 * 根据ID查询参数配置详情
 */
export async function findConfigById(id: number) {
    return request<API.Result<SysConfig>>(`/api/system/config/${id}`, {
        method: 'GET',
    });
}

/**
 * 参数配置管理接口 (保留兼容对象，但主要使用 useCrud)
 */
export const configApi = {
    getConfigValue: findConfigValue,
};
