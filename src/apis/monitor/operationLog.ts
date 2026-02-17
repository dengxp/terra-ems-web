
import { request } from '@umijs/max';

/**
 * 操作日志记录对象
 */
export interface OperationLog {
    id: number;
    title: string;
    businessType: number;
    method: string;
    requestMethod: string;
    operatorType: number;
    operationName: string;
    deptName: string;
    operationUrl: string;
    operationIp: string;
    operationLocation: string;
    operationParam: string;
    jsonResult: string;
    status: number;
    errorMsg: string;
    operationTime: Date;
    costTime: number;
}

/**
 * 查询操作日志列表
 * @param params
 */
export async function list(params: any) {
    return request<API.Result<API.PageResult<OperationLog>>>('/api/monitor/operation-log', {
        method: 'GET',
        params: {
            ...params,
            pageNumber: params.current ? params.current - 1 : 0,
            pageSize: params.pageSize,
        },
    });
}

/**
 * 删除操作日志
 * @param ids
 */
export async function del(ids: number[]) {
    return request<API.Result<void>>(`/api/monitor/operation-log/${ids}`, {
        method: 'DELETE',
    });
}

/**
 * 清空操作日志
 */
export async function clean() {
    return request<API.Result<void>>('/api/monitor/operation-log/clean', {
        method: 'DELETE',
    });
}

/**
 * 导出操作日志
 * @param params
 */
export async function exportOperlog(params: any) {
    return request<Blob>('/api/monitor/operation-log/export', {
        method: 'POST',
        data: params,
        responseType: 'blob',
    });
}
