import { request } from '@umijs/max';

/**
 * 用能单元 API
 */

export interface EnergyUnit {
    id: number;
    code: string;
    name: string;
    parentId?: number | null;
    level: number;
    sortOrder: number;
    status: number;
    remark?: string;
    children?: EnergyUnit[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 获取完整树形结构
 */
export async function getEnergyUnitTree() {
    return request<API.Result<EnergyUnit[]>>('/api/energy-units/tree', {
        method: 'GET',
    });
}

/**
 * 获取启用状态的列表
 */
export async function getEnabledEnergyUnits() {
    return request<API.Result<EnergyUnit[]>>('/api/energy-units/enabled', {
        method: 'GET',
    });
}

/**
 * 获取启用状态的树形结构
 */
export async function getEnabledEnergyUnitTree() {
    return request<API.Result<EnergyUnit[]>>('/api/energy-units/tree/enabled', {
        method: 'GET',
    });
}

/**
 * 获取子节点（懒加载）
 * @param parentId 父节点ID
 */
export async function getEnergyUnitChildren(parentId: number) {
    return request<API.Result<EnergyUnit[]>>(`/api/energy-units/${parentId}/children`, {
        method: 'GET',
    });
}

/**
 * 根据ID查询用能单元
 * @param id 节点ID
 */
export async function getEnergyUnitById(id: number) {
    return request<API.Result<EnergyUnit>>(`/api/energy-units/${id}`, {
        method: 'GET',
    });
}

/**
 * 根据编码查询用能单元
 * @param code 编码
 */
export async function getEnergyUnitByCode(code: string) {
    return request<API.Result<EnergyUnit>>(`/api/energy-units/code/${code}`, {
        method: 'GET',
    });
}

/**
 * 创建用能单元
 * @param data 节点数据
 * @param parentId 父节点ID（可选）
 */
export async function createEnergyUnit(data: Partial<EnergyUnit>, parentId?: number) {
    return request<API.Result<EnergyUnit>>('/api/energy-units', {
        method: 'POST',
        data,
        params: parentId ? { parentId } : undefined,
    });
}

/**
 * 更新用能单元
 * @param id 节点ID
 * @param data 节点数据
 */
export async function updateEnergyUnit(id: number, data: Partial<EnergyUnit>) {
    return request<API.Result<EnergyUnit>>(`/api/energy-units/${id}`, {
        method: 'PUT',
        data,
    });
}

/**
 * 移动节点（更改父节点）
 * @param id 节点ID
 * @param newParentId 新父节点ID（可选，不传表示移动到根级别）
 */
export async function moveEnergyUnit(id: number, newParentId?: number) {
    return request<API.Result<EnergyUnit>>(`/api/energy-units/${id}/move`, {
        method: 'PATCH',
        params: newParentId ? { newParentId } : undefined,
    });
}

/**
 * 删除用能单元
 * @param id 节点ID
 */
export async function deleteEnergyUnit(id: number) {
    return request<API.Result<void>>(`/api/energy-units/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 修改用能单元状态
 * @param id 节点ID
 * @param status 状态值
 */
export async function updateEnergyUnitStatus(id: number, status: number) {
    return request<API.Result<EnergyUnit>>(`/api/energy-units/${id}/status`, {
        method: 'PATCH',
        params: { status },
    });
}
