/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

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
    unitType: 'GENERAL' | 'BRANCH' | 'PROCESS' | 'EQUIPMENT';
    voltageLevel?: string;
    ratedCurrent?: number;
    ratedPower?: number;
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
 */
export async function createEnergyUnit(data: Partial<EnergyUnit>) {
    return request<API.Result<EnergyUnit>>('/api/energy-units', {
        method: 'POST',
        data,
    });
}

/**
 * 更新用能单元
 * @param id 节点ID
 * @param data 节点数据
 */
export async function updateEnergyUnit(id: number, data: Partial<EnergyUnit>) {
    return request<API.Result<EnergyUnit>>('/api/energy-units', {
        method: 'POST',
        data: { ...data, id },
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
