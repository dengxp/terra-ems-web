import { request } from '@umijs/max';

/**
 * 能源成本记录 API
 */

export interface EnergyCostRecord {
    id: number;
    energyUnit?: {
        id: number;
        name: string;
        code: string;
    };
    energyType?: {
        id: number;
        name: string;
        code: string;
    };
    recordDate: string;
    periodType: RecordPeriodType;
    consumption?: number;
    cost?: number;
    sharpConsumption?: number;
    peakConsumption?: number;
    flatConsumption?: number;
    valleyConsumption?: number;
    powerFactor?: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type RecordPeriodType = 'DAY' | 'MONTH' | 'YEAR';

/**
 * 周期类型选项
 */
export const recordPeriodTypeOptions = [
    { label: '日', value: 'DAY' },
    { label: '月', value: 'MONTH' },
    { label: '年', value: 'YEAR' },
];

export interface EnergyCostRecordPageParams {
    current?: number;
    pageSize?: number;
    energyUnitId?: number;
    energyTypeId?: number;
    periodType?: RecordPeriodType;
    startDate?: string;
    endDate?: string;
}

/**
 * 分页查询
 */
export async function getEnergyCostRecordPage(params: EnergyCostRecordPageParams) {
    return request<API.Result<API.PageResult<EnergyCostRecord>>>('/api/ems/energy-cost-records', {
        method: 'GET',
        params: {
            pageNumber: (params.current || 1) - 1,
            pageSize: params.pageSize || 10,
            energyUnitId: params.energyUnitId,
            energyTypeId: params.energyTypeId,
            periodType: params.periodType,
            startDate: params.startDate,
            endDate: params.endDate,
        },
    });
}

/**
 * 按用能单元和日期范围查询
 */
export async function getEnergyCostRecordsByEnergyUnit(energyUnitId: number, startDate: string, endDate: string) {
    return request<API.Result<EnergyCostRecord[]>>(`/api/ems/energy-cost-records/energy-unit/${energyUnitId}`, {
        method: 'GET',
        params: { startDate, endDate },
    });
}

/**
 * 统计成本和用量
 */
export async function getEnergyCostStatistics(params: {
    energyUnitId?: number;
    startDate: string;
    endDate: string;
}) {
    return request<API.Result<{ totalCost: number; totalConsumption: number }>>('/api/ems/energy-cost-records/statistics', {
        method: 'GET',
        params,
    });
}

/**
 * 根据ID查询
 */
export async function getEnergyCostRecordById(id: number) {
    return request<API.Result<EnergyCostRecord>>(`/api/ems/energy-cost-records/${id}`, {
        method: 'GET',
    });
}

/**
 * 创建成本记录
 */
export async function createEnergyCostRecord(data: Partial<EnergyCostRecord>) {
    return request<API.Result<EnergyCostRecord>>('/api/ems/energy-cost-records', {
        method: 'POST',
        data,
    });
}

/**
 * 更新成本记录
 */
export async function updateEnergyCostRecord(id: number, data: Partial<EnergyCostRecord>) {
    return request<API.Result<EnergyCostRecord>>(`/api/ems/energy-cost-records/${id}`, {
        method: 'PUT',
        data,
    });
}

/**
 * 删除成本记录
 */
export async function deleteEnergyCostRecord(id: number) {
    return request<API.Result<void>>(`/api/ems/energy-cost-records/${id}`, {
        method: 'DELETE',
    });
}

// ==================== 偏差分析 ====================

export interface ElectricityData {
    totalConsumption?: number;
    totalConsumptionYoy?: number;
    totalConsumptionMom?: number;
    totalCost?: number;
    totalCostYoy?: number;
    totalCostMom?: number;
    powerFactor?: number;
    powerFactorYoy?: number;
    powerFactorMom?: number;
    sharpConsumption?: number;
    peakConsumption?: number;
    flatConsumption?: number;
    valleyConsumption?: number;
}

export interface StatisticsData extends ElectricityData {
    totalConsumptionDiff?: number;
    totalCostDiff?: number;
    powerFactorDiff?: number;
    sharpConsumptionDiff?: number;
    peakConsumptionDiff?: number;
    flatConsumptionDiff?: number;
    valleyConsumptionDiff?: number;
}

export interface ConsumptionDetail {
    energyUnitId?: number;
    energyUnitName?: string;
    totalConsumption?: number;
    sharpConsumption?: number;
    peakConsumption?: number;
    flatConsumption?: number;
    valleyConsumption?: number;
    totalCost?: number;
    yoy?: number;
    mom?: number;
    percentage?: number;
}

export interface CostDeviation {
    electricityData?: ElectricityData;
    statisticsData?: StatisticsData;
    consumptionDetails?: ConsumptionDetail[];
}

/**
 * 获取偏差分析数据
 */
export async function getCostDeviationAnalysis(params: {
    energyUnitId?: number;
    timeType: string;
    dataTime: string;
}) {
    return request<API.Result<CostDeviation>>('/api/ems/energy-cost-records/deviation', {
        method: 'GET',
        params,
    });
}

// ==================== 成本趋势分析 ====================

export interface TrendChartData {
    energyTypeId?: number;
    energyTypeName?: string;
    energyUnit?: string;
    costLabel?: string;
    consumptionLabel?: string;
    timeLabels?: string[];
    costValues?: number[];
    consumptionValues?: number[];
}

export interface CostTrend {
    tableItems?: any[];
    chartData?: TrendChartData[];
}

/**
 * 获取成本趋势分析数据
 */
export async function getCostTrendAnalysis(params: {
    energyUnitId?: number;
    timeType: string;
    dataTime: string;
}) {
    return request<API.Result<CostTrend>>('/api/ems/energy-cost-records/trend', {
        method: 'GET',
        params,
    });
}

