import { request } from '@umijs/max';

/**
 * 导入结果统计
 */
export interface ImportResult {
  energyTypes: number;
  energyUnits: number;
  gateways: number;
  dataSources: number;
  equipments: number;
  meters: number;
  meterPoints: number;
}

/**
 * 上传场站配置文件
 * @param file YAML 文件
 */
export async function uploadSiteConfig(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return request<API.Result<ImportResult>>('/api/site-import/upload', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
