
import { request } from '@umijs/max';

/**
 * 操作日志记录对象
 */
export interface OperationLog {
    id?: number;
    operId: number;
    title: string;
    businessType: number;
    method: string;
    requestMethod: string;
    operatorType: number;
    operName: string;
    deptName: string;
    operUrl: string;
    operIp: string;
    operLocation: string;
    operParam: string;
    jsonResult: string;
    status: number;
    errorMsg: string;
    operTime: Date;
    costTime: number;
}

/**
 * 查询操作日志列表
 * @param params
 */
export async function list(params: any) {
    return request<API.Result<API.PageResult<OperationLog>>>('/monitor/operationLog/list', {
        method: 'GET',
        params: {
            ...params,
            pageNumber: params.current ? params.current - 1 : 0,
            pageSize: params.pageSize,
            pageNum: params.current ? params.current - 1 : 0,
        },
    });
}

/**
 * 删除操作日志
 * @param operIds
 */
export async function del(operIds: number[]) {
    return request<API.Result<void>>(`/monitor/operlog/${operIds}`, {
        method: 'DELETE',
    });
}

/**
 * 清空操作日志
 */
export async function clean() {
    return request<API.Result<void>>('/monitor/operlog/clean', {
        method: 'DELETE',
    });
}

/**
 * 导出操作日志
 * @param params
 */
export async function exportOperlog(params: any) {
    return request<Blob>('/monitor/operlog/export', {
        method: 'POST',
        data: params,
        responseType: 'blob',
    });
}
