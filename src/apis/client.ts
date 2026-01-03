import { request } from '@umijs/max';
import type { ApiResponse, RequestOptions } from '@/types';

/**
 * 类型安全的 API 客户端
 * 封装所有 HTTP 请求方法，提供统一的类型支持
 */
export class ApiClient {
    /**
     * GET 请求
     * @param url - 请求路径
     * @param params - 查询参数
     * @param options - 请求配置
     */
    static async get<T>(
        url: string,
        params?: Record<string, any>,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return request<ApiResponse<T>>(url, {
            method: 'GET',
            params,
            ...options,
        });
    }

    /**
     * POST 请求
     * @param url - 请求路径
     * @param data - 请求体数据
     * @param options - 请求配置
     */
    static async post<T>(
        url: string,
        data?: any,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return request<ApiResponse<T>>(url, {
            method: 'POST',
            data,
            ...options,
        });
    }

    /**
     * PUT 请求
     * @param url - 请求路径
     * @param data - 请求体数据
     * @param options - 请求配置
     */
    static async put<T>(
        url: string,
        data?: any,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return request<ApiResponse<T>>(url, {
            method: 'PUT',
            data,
            ...options,
        });
    }

    /**
     * DELETE 请求
     * @param url - 请求路径
     * @param options - 请求配置
     */
    static async delete<T>(
        url: string,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return request<ApiResponse<T>>(url, {
            method: 'DELETE',
            ...options,
        });
    }

    /**
     * PATCH 请求
     * @param url - 请求路径
     * @param data - 请求体数据
     * @param options - 请求配置
     */
    static async patch<T>(
        url: string,
        data?: any,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return request<ApiResponse<T>>(url, {
            method: 'PATCH',
            data,
            ...options,
        });
    }

    /**
     * 文件上传
     * @param url - 请求路径
     * @param formData - FormData 对象
     * @param options - 请求配置
     */
    static async upload<T>(
        url: string,
        formData: FormData,
        options?: RequestOptions
    ): Promise<ApiResponse<T>> {
        return request<ApiResponse<T>>(url, {
            method: 'POST',
            data: formData,
            ...options,
        });
    }

    /**
     * 文件下载
     * @param url - 请求路径
     * @param params - 查询参数
     * @param filename - 保存的文件名
     */
    static async download(
        url: string,
        params?: Record<string, any>,
        filename?: string
    ): Promise<void> {
        const response = await request(url, {
            method: 'POST',
            params,
            responseType: 'blob',
            skipErrorHandler: true,
        });

        // 创建下载链接
        const blob = new Blob([response]);
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    }
}

export default ApiClient;
