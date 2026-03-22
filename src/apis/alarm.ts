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
import { MeterPoint } from './meterPoint';

/**
 * 报警管理 API
 */

// ==================== 报警限值类型 ====================

export interface AlarmLimitType {
    id: number;
    limitName: string;
    limitCode: string;
    colorNumber?: string;
    comparatorOperator?: string;
    alarmType?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AlarmLimitTypePageParams {
    current?: number;
    pageSize?: number;
    limitName?: string;
    limitCode?: string;
}

/**
 * 分页查询报警限值类型
 */
export async function getAlarmLimitTypePage(params: AlarmLimitTypePageParams) {
    const { current, pageSize, limitName, limitCode, ...rest } = params;
    return request<API.Result<API.PageResult<AlarmLimitType>>>('/api/alarm/limit-types', {
        method: 'GET',
        params: {
            pageNumber: (current || 1) - 1,
            pageSize: pageSize || 10,
            name: limitName,
            code: limitCode,
            ...rest,
        },
    });
}

/**
 * 创建报警限值类型
 */
export async function createAlarmLimitType(data: Partial<AlarmLimitType>) {
    return request<API.Result<AlarmLimitType>>('/api/alarm/limit-types', {
        method: 'POST',
        data,
    });
}

/**
 * 更新报警限值类型
 */
export async function updateAlarmLimitType(id: number, data: Partial<AlarmLimitType>) {
    return request<API.Result<AlarmLimitType>>('/api/alarm/limit-types', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除报警限值类型
 */
export async function deleteAlarmLimitType(id: number) {
    return request<API.Result<void>>(`/api/alarm/limit-types/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 获取所有报警限值类型
 */
export async function getAllAlarmLimitTypes() {
    return request<API.Result<AlarmLimitType[]>>('/api/alarm/limit-types/all', {
        method: 'GET',
    });
}

// ==================== 预报警配置 ====================

export interface AlarmConfig {
    id: number;
    meterPoint: MeterPoint;
    alarmLimitType: AlarmLimitType;
    limitValue: number;
    isEnabled: boolean;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 根据计量点查询报警配置
 */
export async function getAlarmConfigsByMeterPoint(meterPointId: number) {
    return request<API.Result<AlarmConfig[]>>(`/api/alarm/configs/meter-point/${meterPointId}`, {
        method: 'GET',
    });
}

/**
 * 保存或更新报警配置
 */
export async function saveOrUpdateAlarmConfig(data: Partial<AlarmConfig>) {
    return request<API.Result<AlarmConfig>>('/api/alarm/configs', {
        method: 'POST',
        data,
    });
}

/**
 * 删除报警配置
 */
export async function deleteAlarmConfig(id: number) {
    return request<API.Result<void>>(`/api/alarm/configs/${id}`, {
        method: 'DELETE',
    });
}

// ==================== 报警记录 ====================

export interface AlarmRecord {
    id: number;
    alarmConfig: AlarmConfig;
    triggerValue: number;
    triggerTime: string;
    status: number; // 0: 未处理, 1: 已处理, 2: 忽略
    handleTime?: string;
    handleRemark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface AlarmRecordPageParams {
    current?: number;
    pageSize?: number;
    status?: number;
    meterPointId?: number;
    alarmLimitTypeId?: number;
    startTime?: string;
    endTime?: string;
}

/**
 * 分页查询报警记录
 */
export async function getAlarmRecordPage(params: AlarmRecordPageParams) {
    const { current, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<AlarmRecord>>>('/api/alarm/records', {
        method: 'GET',
        params: {
            pageNumber: (current || 1) - 1,
            pageSize: pageSize || 10,
            ...rest,
        },
    });
}

/**
 * 处理报警记录
 */
export async function handleAlarmRecord(id: number, remark: string, status: number) {
    return request<API.Result<AlarmRecord>>(`/api/alarm/records/${id}/handle`, {
        method: 'POST',
        params: { remark, status },
    });
}
