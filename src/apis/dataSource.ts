import { request } from '@umijs/max';

/**
 * 数据源 API
 */

export interface DataSource {
    id: number;
    name: string;
    gatewayId?: number;
    gateway?: any;
    protocol: string;
    connection?: string;
    pollIntervalSecs?: number;
    lastSeenTime?: string;
    status: number;
    remark?: string;
}

export async function getDataSources(params: any) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<DataSource>>>('/api/data-sources/all', {
        method: 'GET',
        params: { pageNumber: pageNumber ?? (current ? current - 1 : 0), pageSize: pageSize ?? 10, ...rest },
    });
}

export async function getAllDataSources() {
    return request<API.Result<DataSource[]>>('/api/data-sources/all', { method: 'GET' });
}

export async function getDataSourcesByGatewayId(gatewayId: number) {
    return request<API.Result<DataSource[]>>(`/api/data-sources/gateway/${gatewayId}`, { method: 'GET' });
}

export async function saveDataSource(data: any) {
    return request<API.Result<DataSource>>('/api/data-sources', { method: 'POST', data });
}

export async function deleteDataSource(id: number) {
    return request<API.Result<void>>(`/api/data-sources/${id}`, { method: 'DELETE' });
}

export async function deleteDataSourcesBatch(ids: (number | string)[]) {
    return request<API.Result<void>>('/api/data-sources', { method: 'DELETE', data: ids });
}
