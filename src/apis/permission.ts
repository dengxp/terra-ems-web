import { request } from '@umijs/max';

const BASE_URL = '/api/system/permission';

/**
 * 分页查询权限
 */
export async function findPermissionPage(params?: API.PageParams) {
    return request<API.Result<API.PageResult<SysPermission>>>(BASE_URL, {
        method: 'GET',
        params: {
            ...params,
            pageNumber: params?.current ? params.current - 1 : (params?.pageNumber || 0),
        },
    });
}

/**
 * 查询权限详情
 */
export async function findPermissionById(id: number) {
    return request<API.Result<SysPermission>>(`${BASE_URL}/${id}`, {
        method: 'GET',
    });
}

/**
 * 获取权限选项列表
 */
export async function findPermissionOptions() {
    return request<API.Result<API.Option<number>[]>>(`${BASE_URL}/options`, {
        method: 'GET',
    });
}

/**
 * 保存或更新权限
 */
export async function saveOrUpdatePermission(data: SysPermission) {
    return request<API.Result<SysPermission>>(BASE_URL, {
        method: 'POST',
        data,
    });
}

/**
 * 批量删除权限
 */
export async function batchDeletePermissions(ids: number[]) {
    return request<API.Result<void>>(BASE_URL, {
        method: 'DELETE',
        data: ids,
    });
}

/**
 * 同步扫码权限
 */
export async function syncPermissions() {
    return request<API.Result<void>>(`${BASE_URL}/sync`, {
        method: 'POST',
    });
}
