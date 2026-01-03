import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import type { PageData, PageParams } from '@/types';

/**
 * useTableData Hook 配置选项
 */
export interface UseTableDataOptions<T, P = PageParams> {
    /** 数据获取函数 */
    fetchData: (params: P) => Promise<{ data: PageData<T> }>;
    /** 默认每页大小 */
    defaultPageSize?: number;
    /** 是否立即加载 */
    immediate?: boolean;
    /** 默认查询参数 */
    defaultParams?: Partial<P>;
    /** 成功回调 */
    onSuccess?: (data: PageData<T>) => void;
    /** 错误回调 */
    onError?: (error: Error) => void;
}

/**
 * useTableData - 表格数据管理 Hook
 * 封装分页、加载、刷新等常用表格操作
 * 
 * @example
 * ```typescript
 * const {
 *   dataSource,
 *   loading,
 *   pagination,
 *   refresh,
 *   search
 * } = useTableData({
 *   fetchData: UserApi.findByPage,
 *   defaultPageSize: 10,
 *   immediate: true
 * });
 * 
 * // 在 Table 组件中使用
 * <Table
 *   dataSource={dataSource}
 *   loading={loading}
 *   pagination={pagination}
 * />
 * ```
 */
export function useTableData<T, P = PageParams>(options: UseTableDataOptions<T, P>) {
    const {
        fetchData,
        defaultPageSize = 10,
        immediate = true,
        defaultParams = {} as Partial<P>,
        onSuccess,
        onError,
    } = options;

    const [loading, setLoading] = useState(false);
    const [dataSource, setDataSource] = useState<T[]>([]);
    const [total, setTotal] = useState(0);
    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(defaultPageSize);
    const [params, setParams] = useState<Partial<P>>(defaultParams);

    /**
     * 加载数据
     */
    const loadData = useCallback(
        async (page = current, size = pageSize, searchParams = params) => {
            setLoading(true);
            try {
                const mergedParams = {
                    ...searchParams,
                    page: page - 1, // 后端分页从 0 开始
                    size,
                } as P;

                const response = await fetchData(mergedParams);
                const pageData = response.data;

                setDataSource(pageData.content || []);
                setTotal(pageData.totalElements || 0);
                setCurrent(page);
                setPageSize(size);
                setParams(searchParams);

                onSuccess?.(pageData);
            } catch (error) {
                message.error('加载数据失败');
                onError?.(error as Error);
            } finally {
                setLoading(false);
            }
        },
        [fetchData, current, pageSize, params, onSuccess, onError]
    );

    /**
     * 刷新当前页
     */
    const refresh = useCallback(() => {
        loadData(current, pageSize, params);
    }, [loadData, current, pageSize, params]);

    /**
     * 搜索（重置到第一页）
     */
    const search = useCallback(
        (searchParams: Partial<P>) => {
            loadData(1, pageSize, { ...params, ...searchParams });
        },
        [loadData, pageSize, params]
    );

    /**
     * 重置搜索条件
     */
    const reset = useCallback(() => {
        loadData(1, pageSize, defaultParams);
    }, [loadData, pageSize, defaultParams]);

    /**
     * 页码改变
     */
    const handlePageChange = useCallback(
        (page: number, size: number) => {
            loadData(page, size, params);
        },
        [loadData, params]
    );

    /**
     * 删除项目后的处理
     * 如果当前页没有数据了，返回上一页
     */
    const handleAfterDelete = useCallback(() => {
        const totalPages = Math.ceil((total - 1) / pageSize);
        const targetPage = current > totalPages ? totalPages : current;
        loadData(Math.max(1, targetPage), pageSize, params);
    }, [loadData, total, pageSize, current, params]);

    /**
     * 初始加载
     */
    useEffect(() => {
        if (immediate) {
            loadData();
        }
    }, []); // 只在组件挂载时执行一次

    return {
        /** 数据源 */
        dataSource,
        /** 加载状态 */
        loading,
        /** 总数 */
        total,
        /** 当前页码 */
        current,
        /** 每页大小 */
        pageSize,
        /** 查询参数 */
        params,
        /** 加载数据 */
        loadData,
        /** 刷新当前页 */
        refresh,
        /** 搜索 */
        search,
        /** 重置 */
        reset,
        /** 删除后处理 */
        handleAfterDelete,
        /** 分页配置（可直接用于 Table） */
        pagination: {
            current,
            pageSize,
            total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `共 ${total} 条`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange,
        },
        /** 设置数据源（用于手动更新） */
        setDataSource,
    };
}

export default useTableData;
