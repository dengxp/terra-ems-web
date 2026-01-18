import { request } from '@umijs/max';

/**
 * 尖峰平谷分析 API
 */

/**
 * 时段类型
 */
export type TimePeriodType = 'SHARP' | 'PEAK' | 'FLAT' | 'VALLEY' | 'DEEP_VALLEY';

/**
 * 时段类型选项
 */
export const TimePeriodTypeOptions = [
    { label: '尖峰', value: 'SHARP', color: '#f5222d' },
    { label: '高峰', value: 'PEAK', color: '#fa8c16' },
    { label: '平段', value: 'FLAT', color: '#52c41a' },
    { label: '低谷', value: 'VALLEY', color: '#1890ff' },
    { label: '深谷', value: 'DEEP_VALLEY', color: '#722ed1' },
];

/**
 * 分时电价配置
 */
export interface TimePeriodPrice {
    id: number;
    pricePolicyId?: number;
    periodType: TimePeriodType;
    periodName: string;
    startTime: string;  // HH:mm:ss
    endTime: string;    // HH:mm:ss
    price: number;
    sortOrder: number;
    status: number;
    remark?: string;
}

/**
 * 时段汇总数据
 */
export interface PeriodSummary {
    periodType: TimePeriodType;
    periodName: string;
    electricity: number;
    cost: number;
    percentage: number;
}

/**
 * 分析结果
 */
export interface PeakValleyAnalysisResult {
    periodSummaries: PeriodSummary[];
    totalElectricity: number;
    totalCost: number;
}

/**
 * 时段详情
 */
export interface PeriodDetail {
    periodType: TimePeriodType;
    periodName: string;
    electricity: number;
    cost: number;
}

/**
 * 每日峰谷数据
 */
export interface DailyPeakValleyData {
    date: string;
    periodDetails: Record<TimePeriodType, PeriodDetail>;
    totalElectricity: number;
    totalCost: number;
}

// ========================= API 接口 =========================

/**
 * 按日分析
 */
export async function getDailyAnalysis(energyUnitId: number, date: string) {
    return request<API.Result<PeakValleyAnalysisResult>>('/api/peak-valley/daily', {
        method: 'GET',
        params: { energyUnitId, date },
    });
}

/**
 * 按月分析
 */
export async function getMonthlyAnalysis(energyUnitId: number, yearMonth: string) {
    return request<API.Result<PeakValleyAnalysisResult>>('/api/peak-valley/monthly', {
        method: 'GET',
        params: { energyUnitId, yearMonth },
    });
}

/**
 * 按年分析
 */
export async function getYearlyAnalysis(energyUnitId: number, year: number) {
    return request<API.Result<PeakValleyAnalysisResult>>('/api/peak-valley/yearly', {
        method: 'GET',
        params: { energyUnitId, year },
    });
}

/**
 * 时段汇总
 */
export async function getPeriodSummary(energyUnitId: number, startDate: string, endDate: string) {
    return request<API.Result<PeakValleyAnalysisResult>>('/api/peak-valley/summary', {
        method: 'GET',
        params: { energyUnitId, startDate, endDate },
    });
}

/**
 * 获取每日详细数据
 */
export async function getDailyDetailedData(energyUnitId: number, startDate: string, endDate: string) {
    return request<API.Result<DailyPeakValleyData[]>>('/api/peak-valley/daily-details', {
        method: 'GET',
        params: { energyUnitId, startDate, endDate },
    });
}

/**
 * 获取电价配置列表
 */
export async function getPriceConfigs() {
    return request<API.Result<TimePeriodPrice[]>>('/api/peak-valley/price-configs', {
        method: 'GET',
    });
}

// ========================= 分时电价配置 API =========================

/**
 * 查询所有分时电价配置
 */
export async function getTimePeriodPriceList() {
    return request<API.Result<TimePeriodPrice[]>>('/api/time-period-prices', {
        method: 'GET',
    });
}

/**
 * 根据电价政策ID查询
 */
export async function getTimePeriodPricesByPolicyId(pricePolicyId: number) {
    return request<API.Result<TimePeriodPrice[]>>(`/api/time-period-prices/policy/${pricePolicyId}`, {
        method: 'GET',
    });
}

/**
 * 根据ID查询
 */
export async function getTimePeriodPriceById(id: number) {
    return request<API.Result<TimePeriodPrice>>(`/api/time-period-prices/${id}`, {
        method: 'GET',
    });
}

/**
 * 创建分时电价配置
 */
export async function createTimePeriodPrice(data: Partial<TimePeriodPrice>) {
    return request<API.Result<TimePeriodPrice>>('/api/time-period-prices', {
        method: 'POST',
        data,
    });
}

/**
 * 更新分时电价配置
 */
export async function updateTimePeriodPrice(id: number, data: Partial<TimePeriodPrice>) {
    return request<API.Result<TimePeriodPrice>>('/api/time-period-prices', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除分时电价配置
 */
export async function deleteTimePeriodPrice(id: number) {
    return request<API.Result<void>>(`/api/time-period-prices/${id}`, {
        method: 'DELETE',
    });
}
