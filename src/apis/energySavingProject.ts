/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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
 * 节能项目 API
 */

export interface EnergySavingProject {
    id: number;
    name: string;
    plan?: string;
    implementationPlan?: string;
    currentWork?: string;
    liablePerson?: string;
    savingAmount?: number;
    completionTime?: string;
    status: ProjectStatus;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * 项目状态选项
 */
export const projectStatusOptions = [
    { label: '规划中', value: 'PLANNING', color: '#1890ff' },
    { label: '进行中', value: 'IN_PROGRESS', color: '#faad14' },
    { label: '已完成', value: 'COMPLETED', color: '#52c41a' },
    { label: '已取消', value: 'CANCELLED', color: '#999' },
];

export interface ProjectPageParams {
    current?: number;
    pageSize?: number;
    keyword?: string;
    name?: string;
    status?: ProjectStatus;
}

/**
 * 分页查询节能项目
 */
export async function getProjectPage(params: ProjectPageParams) {
    return request<API.Result<API.PageResult<EnergySavingProject>>>('/api/ems/saving-projects', {
        method: 'GET',
        params: {
            pageNumber: (params.current || 1) - 1,
            pageSize: params.pageSize || 10,
            keyword: params.keyword,
            name: params.name,
            status: params.status,
        },
    });
}

/**
 * 获取所有节能项目
 */
export async function getAllProjects() {
    return request<API.Result<EnergySavingProject[]>>('/api/ems/saving-projects/all', {
        method: 'GET',
    });
}

/**
 * 按状态查询节能项目
 */
export async function getProjectsByStatus(status: ProjectStatus) {
    return request<API.Result<EnergySavingProject[]>>(`/api/ems/saving-projects/status/${status}`, {
        method: 'GET',
    });
}

/**
 * 根据ID查询节能项目
 */
export async function getProjectById(id: number) {
    return request<API.Result<EnergySavingProject>>(`/api/ems/saving-projects/${id}`, {
        method: 'GET',
    });
}

/**
 * 创建节能项目
 */
export async function createProject(data: Partial<EnergySavingProject>) {
    return request<API.Result<EnergySavingProject>>('/api/ems/saving-projects', {
        method: 'POST',
        data,
    });
}

/**
 * 更新节能项目
 */
export async function updateProject(id: number, data: Partial<EnergySavingProject>) {
    return request<API.Result<EnergySavingProject>>('/api/ems/saving-projects', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除节能项目
 */
export async function deleteProject(id: number) {
    return request<API.Result<void>>(`/api/ems/saving-projects/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 更新项目状态
 */
export async function updateProjectStatus(id: number, status: ProjectStatus) {
    return request<API.Result<EnergySavingProject>>(`/api/ems/saving-projects/${id}/status`, {
        method: 'POST',
        params: { status },
    });
}

/**
 * 获取已完成项目的节约量总和
 */
export async function getCompletedSavingAmount() {
    return request<API.Result<number>>('/api/ems/saving-projects/statistics/saving-amount', {
        method: 'GET',
    });
}

/**
 * 按状态统计项目数量
 */
export async function countByStatus(status: ProjectStatus) {
    return request<API.Result<number>>(`/api/ems/saving-projects/statistics/count/${status}`, {
        method: 'GET',
    });
}
