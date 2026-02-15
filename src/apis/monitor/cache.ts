import { request } from '@umijs/max';

/**
 * 缓存监控信息
 */
export interface CacheInfo {
    info: any;
    dbSize: any;
    commandStats: { name: string; value: string }[];
}

/**
 * 缓存名称对象
 */
export interface SysCache {
    cacheName: string;
    cacheKey?: string;
    cacheValue?: string;
    remark?: string;
}

/**
 * 查询缓存监控信息
 */
export function getCacheInfo() {
    return request<API.Result<CacheInfo>>('/api/monitor/cache', {
        method: 'GET',
    });
}

/**
 * 查询缓存名称列表
 */
export function listCacheNames() {
    return request<API.Result<SysCache[]>>('/api/monitor/cache/getNames', {
        method: 'GET',
    });
}

/**
 * 查询缓存键名列表
 * @param cacheName 缓存名称
 */
export function listCacheKeys(cacheName: string) {
    return request<API.Result<string[]>>(`/api/monitor/cache/getKeys/${cacheName}`, {
        method: 'GET',
    });
}

/**
 * 查询缓存内容
 * @param cacheName 缓存名称
 * @param cacheKey 缓存键名
 */
export function getCacheValue(cacheName: string, cacheKey: string) {
    return request<API.Result<SysCache>>(`/api/monitor/cache/getValue/${cacheName}/${cacheKey}`, {
        method: 'GET',
    });
}

/**
 * 清理指定名称缓存
 * @param cacheName 缓存名称
 */
export function clearCacheName(cacheName: string) {
    return request<API.Result<void>>(`/api/monitor/cache/clearCacheName/${cacheName}`, {
        method: 'DELETE',
    });
}

/**
 * 清理指定键名缓存
 * @param cacheKey 缓存键名
 */
export function clearCacheKey(cacheKey: string) {
    return request<API.Result<void>>(`/api/monitor/cache/clearCacheKey/${cacheKey}`, {
        method: 'DELETE',
    });
}

/**
 * 清理全部缓存
 */
export function clearCacheAll() {
    return request<API.Result<void>>('/api/monitor/cache/clearCacheAll', {
        method: 'DELETE',
    });
}
