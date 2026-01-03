/**
 * 统一的 API 响应格式
 */
export interface ApiResponse<T = unknown> {
    code: number;
    message?: string;
    data: T;
    timestamp?: string;
    path?: string;
    status?: number;
    error?: any;
    traceId?: string;
}

/**
 * 分页数据格式
 */
export interface PageData<T = unknown> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
}

/**
 * 分页请求参数
 */
export interface PageParams {
    page?: number;
    size?: number;
    sort?: string;
    keyword?: string;
    [key: string]: any;
}

/**
 * 请求配置选项
 */
export interface RequestOptions {
    skipErrorHandler?: boolean;
    showType?: number;
    [key: string]: any;
}
