import { request } from '@umijs/max';

/**
 * 系统拓扑 API
 */

/**
 * 获取完整拓扑数据（用能单元树 + 网关 + 设备 + 仪表 + 计量点）
 * 通过组合多个接口数据构建拓扑
 */
export async function getTopologyData() {
    const [unitsRes, gatewaysRes, equipmentsRes, metersRes] = await Promise.all([
        request<API.Result<any[]>>('/api/energy-units/tree', { method: 'GET' }),
        request<API.Result<any[]>>('/api/gateways/all', { method: 'GET' }),
        request<API.Result<any[]>>('/api/equipments/all', { method: 'GET' }),
        request<API.Result<any[]>>('/api/meters', {
            method: 'GET',
            params: { pageNumber: 0, pageSize: 1000 },
        }),
    ]);

    return {
        energyUnits: unitsRes?.data || [],
        gateways: gatewaysRes?.data || [],
        equipments: equipmentsRes?.data || [],
        meters: metersRes?.data?.content || metersRes?.data?.records || [],
    };
}
