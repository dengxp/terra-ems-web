import { useState, useCallback } from 'react';
import { message } from 'antd';

/**
 * useApi Hook 配置选项
 */
export interface UseApiOptions<T> {
    /** 成功回调 */
    onSuccess?: (data: T) => void;
    /** 错误回调 */
    onError?: (error: Error) => void;
    /** 是否显示成功消息 */
    showSuccessMessage?: boolean;
    /** 成功消息文本 */
    successMessage?: string;
    /** 是否显示错误消息（默认 true） */
    showErrorMessage?: boolean;
    /** 初始加载状态 */
    initialLoading?: boolean;
}

/**
 * useApi - 通用 API 调用 Hook
 * 封装 loading、error、data 状态管理和错误处理
 * 
 * @example
 * ```typescript
 * const { data, loading, error, execute } = useApi(UserApi.findByPage, {
 *   onSuccess: (data) => console.log('成功', data),
 *   showSuccessMessage: true,
 *   successMessage: '加载成功'
 * });
 * 
 * // 调用 API
 * await execute({ pageNumber: 0, pageSize: 10 });
 * ```
 */
export function useApi<T, P extends any[] = any[]>(
    apiFunc: (...args: P) => Promise<T>,
    options: UseApiOptions<T> = {}
) {
    const {
        onSuccess,
        onError,
        showSuccessMessage = false,
        successMessage = '操作成功',
        showErrorMessage = true,
        initialLoading = false,
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(initialLoading);
    const [error, setError] = useState<Error | null>(null);

    /**
     * 执行 API 调用
     */
    const execute = useCallback(
        async (...args: P): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                const result = await apiFunc(...args);
                setData(result);

                if (showSuccessMessage) {
                    message.success(successMessage);
                }

                onSuccess?.(result);
                return result;
            } catch (err) {
                const error = err as Error;
                setError(error);

                if (showErrorMessage) {
                    message.error(error.message || '操作失败');
                }

                onError?.(error);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [apiFunc, onSuccess, onError, showSuccessMessage, successMessage, showErrorMessage]
    );

    /**
     * 重置状态
     */
    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return {
        /** 响应数据 */
        data,
        /** 加载状态 */
        loading,
        /** 错误信息 */
        error,
        /** 执行 API 调用 */
        execute,
        /** 重置状态 */
        reset,
        /** 设置数据（用于手动更新） */
        setData,
    };
}

export default useApi;
