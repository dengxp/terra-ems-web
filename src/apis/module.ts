import { request } from '@umijs/max';

const BASE_URL = '/api/system/module';

/**
 * 分页查询模块
 */
export async function findModulePage(params?: API.PageParams) {
    return request<API.Result<API.PageResult<SysModule>>>(BASE_URL, {
        method: 'GET',
        params: {
            ...params,
            pageNumber: params?.current ? params.current - 1 : (params?.pageNumber || 0),
        },
    });
}

/**
 * 根据ID查询模块详情
 */
export async function findModuleById(id: number) {
    return request<API.Result<SysModule>>(`${BASE_URL}/${id}`, {
        method: 'GET',
    });
}

/**
 * 获取模块选项列表
 */
export async function findModuleOptions() {
    return request<API.Result<API.Option<number>[]>>(`${BASE_URL}/options`, {
        method: 'GET',
    });
}

/**
 * 获取模块树（含权限列表）
 */
export async function findModuleTree() {
    return request<API.Result<SysModule[]>>(`${BASE_URL}/tree`, {
        method: 'GET',
    });
}

/**
 * 保存或更新模块
 */
export async function saveOrUpdateModule(data: SysModule) {
    return request<API.Result<SysModule>>(BASE_URL, {
        method: 'POST',
        data,
    });
}

/**
 * 批量删除模块
 */
export async function batchDeleteModules(ids: number[]) {
    return request<API.Result<void>>(BASE_URL, {
        method: 'DELETE',
        data: ids,
    });
}
