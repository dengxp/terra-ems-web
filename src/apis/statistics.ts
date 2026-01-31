import { request } from '@umijs/max';

/**
 * 能耗统计分析 API
 */

// 能源类型分布
export interface EnergyTypeDistribution {
    energyTypeId: number;
    energyTypeName: string;
    value: number;
    percentage: number;
}

// 趋势数据项
export interface TrendDataItem {
    dataTime: string;
    label: string;
    value: number;
}

// 统计汇总
export interface EnergyStatisticsSummary {
    currentTotal: number;
    lastYearTotal: number;
    lastPeriodTotal: number;
    yoyRate: number;
    momRate: number;
    energyTypeDistribution: EnergyTypeDistribution[];
    trendData: TrendDataItem[];
}

// 同比/环比分析项
export interface ComparisonAnalysis {
    energyUnitId: number;
    energyUnitName: string;
    currentValue: number;
    comparisonValue: number;
    difference: number;
    changeRate: number;
    unit: string;
}

// 查询参数
export interface StatisticsQueryParams {
    energyUnitId?: number;
    parentUnitId?: number;
    timeType?: 'DAY' | 'MONTH' | 'YEAR';
    dataTime?: string;
    energyTypeId?: number;
}

/**
 * 获取统计汇总
 */
export async function getStatisticsSummary(params: StatisticsQueryParams) {
    return request<API.Result<EnergyStatisticsSummary>>('/api/statistics/summary', {
        method: 'GET',
        params,
    });
}

/**
 * 获取同比分析
 */
export async function getYoYAnalysis(params: StatisticsQueryParams) {
    return request<API.Result<ComparisonAnalysis[]>>('/api/statistics/yoy', {
        method: 'GET',
        params,
    });
}

/**
 * 获取环比分析
 */
export async function getMoMAnalysis(params: StatisticsQueryParams) {
    return request<API.Result<ComparisonAnalysis[]>>('/api/statistics/mom', {
        method: 'GET',
        params,
    });
}

/**
 * 获取综合能耗汇总
 */
export async function getComprehensiveSummary(params: StatisticsQueryParams) {
    return request<API.Result<EnergyStatisticsSummary>>('/api/statistics/comprehensive/summary', {
        method: 'GET',
        params,
    });
}

/**
 * 获取能耗排名
 */
export async function getRankingAnalysis(params: StatisticsQueryParams) {
    return request<API.Result<ComparisonAnalysis[]>>('/api/statistics/ranking', {
        method: 'GET',
        params,
    });
}

// 单耗趋势项
export interface UnitConsumptionTrendItem {
    label: string;
    unitConsumption: number;
    production: number;
    energyConsumption: number;
}

// 单耗分析结果
export interface UnitConsumption {
    energyUnitId: number;
    energyUnitName: string;
    production: number;
    productionUnit: string;
    energyConsumption: number;
    energyUnit: string;
    unitConsumption: number;
    lastYearUnitConsumption: number;
    yoyRate: number;
    lastPeriodUnitConsumption: number;
    momRate: number;
    trendData: UnitConsumptionTrendItem[];
}

// 单耗分析查询参数
export interface UnitConsumptionQueryParams extends StatisticsQueryParams {
    energyTypeId?: number;
    productId?: number;
}

/**
 * 获取单耗分析
 */
export async function getUnitConsumptionAnalysis(params: UnitConsumptionQueryParams) {
    return request<API.Result<UnitConsumption>>('/api/statistics/unit-consumption', {
        method: 'GET',
        params,
    });
}

// 时段能耗项
export interface TimeSlotEnergy {
    label: string;
    value: number;
}

// 工序能耗分析结果
export interface ProcessEnergyAnalysis {
    energyUnitId: number;
    energyUnitName: string;
    totalConsumption: number;
    percentage: number;
    unit: string;
    timeSlotData: TimeSlotEnergy[];
}

/**
 * 获取工序能耗分析
 */
export async function getProcessEnergyAnalysis(params: StatisticsQueryParams) {
    return request<API.Result<ProcessEnergyAnalysis[]>>('/api/statistics/process-energy', {
        method: 'GET',
        params,
    });
}

// ==================== 支路分析 ====================

// 支路时段数据
export interface BranchTimeSlotData {
    label: string;
    value: number;
}

// 支路分析结果
export interface BranchAnalysis {
    branchId: number;
    branchName: string;
    voltageLevel?: string;
    ratedCurrent?: number;
    ratedPower?: number;
    totalConsumption: number;
    unit: string;
    percentage: number;
    timeSlotData: BranchTimeSlotData[];
}

// 支路分析查询参数
export interface BranchAnalysisQueryParams extends StatisticsQueryParams {
    energyTypeId?: number;
}

/**
 * 获取支路能耗分析
 */
export async function getBranchAnalysis(params: BranchAnalysisQueryParams) {
    return request<API.Result<BranchAnalysis[]>>('/api/statistics/branch', {
        method: 'GET',
        params,
    });
}

// ==================== 对标分析 ====================

// 对标分析结果
export interface BenchmarkAnalysis {
    energyUnitId: number;
    energyUnitName: string;
    actualConsumption: number;
    benchmarkValue: number;
    benchmarkGrade: string;
    benchmarkCode: string;
    difference: number;
    complianceRate: number;
    isCompliant: boolean;
    unit: string;
    evaluation: string;
}

// 对标分析查询参数
export interface BenchmarkAnalysisQueryParams extends StatisticsQueryParams {
    benchmarkType?: string;
}

/**
 * 获取对标分析
 */
export async function getBenchmarkAnalysis(params: BenchmarkAnalysisQueryParams) {
    return request<API.Result<BenchmarkAnalysis[]>>('/api/statistics/benchmark', {
        method: 'GET',
        params,
    });
}
