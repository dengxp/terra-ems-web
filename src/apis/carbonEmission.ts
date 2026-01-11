import { request } from '@umijs/max';
import { EnergyStatisticsSummary, ComparisonAnalysis, StatisticsQueryParams } from './statistics';

/**
 * 碳排放管理 API
 */

/**
 * 获取碳排放汇总
 */
export async function getCarbonSummary(params: StatisticsQueryParams) {
    return request<API.Result<EnergyStatisticsSummary>>('/api/carbon/summary', {
        method: 'GET',
        params,
    });
}

/**
 * 获取碳排放排名
 */
export async function getCarbonRanking(params: StatisticsQueryParams) {
    return request<API.Result<ComparisonAnalysis[]>>('/api/carbon/ranking', {
        method: 'GET',
        params,
    });
}
