import { request } from '@umijs/max';

/**
 * 字典类型管理接口
 */
export const dictTypeApi = {
    // 分页查询字典类型
    findByPage: (params: any) => request('/api/system/dict/type', { method: 'GET', params }),
    // 获取字典类型详细
    get: (id: number) => request(`/api/system/dict/type/${id}`, { method: 'GET' }),
    // 保存或更新字典类型
    save: (data: any) => request('/api/system/dict/type', { method: 'POST', data }),
    // 新增字典类型
    add: (data: any) => request('/api/system/dict/type', { method: 'POST', data }),
    // 修改字典类型
    update: (data: any) => request('/api/system/dict/type', { method: 'POST', data }),
    // 删除字典类型
    remove: (ids: any) => {
        if (Array.isArray(ids)) {
            return request('/api/system/dict/type', { method: 'DELETE', data: ids });
        }
        return request(`/api/system/dict/type/${ids}`, { method: 'DELETE' });
    }
};

/**
 * 字典数据管理接口
 */
export const dictDataApi = {
    // 分页查询字典数据
    findByPage: (params: any) => request('/api/system/dict/data', { method: 'GET', params }),
    // 根据类型获取字典项 (useDict 使用)
    getByType: (type: string) => request(`/api/system/dict/data/type/${type}`, { method: 'GET' }),
    // 获取字典数据详细
    get: (id: number) => request(`/api/system/dict/data/${id}`, { method: 'GET' }),
    // 保存或更新字典数据
    save: (data: any) => request('/api/system/dict/data', { method: 'POST', data }),
    // 新增字典数据
    add: (data: any) => request('/api/system/dict/data', { method: 'POST', data }),
    // 修改字典数据
    update: (data: any) => request('/api/system/dict/data', { method: 'POST', data }),
    // 删除字典数据
    remove: (ids: any) => {
        if (Array.isArray(ids)) {
            return request('/api/system/dict/data', { method: 'DELETE', data: ids });
        }
        return request(`/api/system/dict/data/${ids}`, { method: 'DELETE' });
    }
};
