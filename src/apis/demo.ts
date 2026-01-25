import { request } from '@umijs/max';

/**
 * 演示数据服务 API
 */

/**
 * 生成能耗排名演示数据
 * @param parentUnitId 父级用能单元ID
 */
export async function generateRankingData(parentUnitId: number) {
    return request<API.Result<string>>('/api/demo/generate-ranking-data', {
        method: 'POST',
        params: { parentUnitId },
    });
}
