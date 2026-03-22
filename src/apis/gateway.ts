import { request } from '@umijs/max';

/**
 * 网关 API
 */

export interface Gateway {
    id: number;
    code: string;
    name: string;
    model?: string;
    manufacturer?: string;
    ipAddress?: string;
    installLocation?: string;
    energyUnitId?: number;
    energyUnit?: any;
    runStatus?: string;
    lastHeartbeat?: string;
    status: number;
    remark?: string;
}

export async function getGateways(params: any) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<Gateway>>>('/api/gateways', {
        method: 'GET',
        params: { pageNumber: pageNumber ?? (current ? current - 1 : 0), pageSize: pageSize ?? 10, ...rest },
    });
}

export async function getAllGateways() {
    return request<API.Result<Gateway[]>>('/api/gateways/all', { method: 'GET' });
}

export async function saveGateway(data: any) {
    return request<API.Result<Gateway>>('/api/gateways', { method: 'POST', data });
}

export async function deleteGateway(id: number) {
    return request<API.Result<void>>(`/api/gateways/${id}`, { method: 'DELETE' });
}

export async function deleteGatewaysBatch(ids: (number | string)[]) {
    return request<API.Result<void>>('/api/gateways', { method: 'DELETE', data: ids });
}

export interface GatewayOnlineInfo {
    online: boolean;
    lastHeartbeat?: string;
}

export async function getGatewayOnlineStatus() {
    return request<API.Result<Record<string, GatewayOnlineInfo>>>('/api/gateways/online-status', { method: 'GET' });
}
