import { useCallback } from 'react';
import { Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { confirm } = Modal;

/**
 * useDelete Hook 配置选项
 */
export interface UseDeleteOptions<T = any> {
    /** 删除函数 */
    onDelete: (id: number | string) => Promise<any>;
    /** 批量删除函数 */
    onBatchDelete?: (ids: (number | string)[]) => Promise<any>;
    /** 成功回调 */
    onSuccess?: () => void;
    /** 删除成功消息 */
    successMessage?: string;
    /** 批量删除成功消息 */
    batchSuccessMessage?: string;
    /** 确认标题 */
    confirmTitle?: string;
    /** 确认内容 */
    confirmContent?: string | ((record: T) => string);
    /** 批量删除确认内容 */
    batchConfirmContent?: string | ((count: number) => string);
}

/**
 * useDelete - 删除操作 Hook
 * 封装删除确认和删除逻辑
 * 
 * @example
 * ```typescript
 * const { handleDelete, handleBatchDelete } = useDelete({
 *   onDelete: UserApi.delete,
 *   onBatchDelete: UserApi.batchDelete,
 *   onSuccess: () => refresh()
 * });
 * 
 * // 单个删除
 * <Button onClick={() => handleDelete(1, record)}>删除</Button>
 * 
 * // 批量删除
 * <Button onClick={() => handleBatchDelete([1, 2, 3])}>批量删除</Button>
 * ```
 */
export function useDelete<T = any>(options: UseDeleteOptions<T>) {
    const {
        onDelete,
        onBatchDelete,
        onSuccess,
        successMessage = '删除成功',
        batchSuccessMessage = '批量删除成功',
        confirmTitle = '确认删除',
        confirmContent = '确定要删除这条数据吗？',
        batchConfirmContent,
    } = options;

    /**
     * 单个删除
     */
    const handleDelete = useCallback(
        (id: number | string, record?: T) => {
            const content =
                typeof confirmContent === 'function' && record
                    ? confirmContent(record)
                    : confirmContent;

            confirm({
                title: confirmTitle,
                icon: <ExclamationCircleOutlined />,
        content,
                okText: '确定',
                okType: 'danger',
                cancelText: '取消',
                async onOk() {
                    try {
                        await onDelete(id);
                        message.success(successMessage);
                        onSuccess?.();
                    } catch (error: any) {
                        message.error(error.message || '删除失败');
                        throw error;
                    }
                },
            });
        },
        [onDelete, onSuccess, successMessage, confirmTitle, confirmContent]
    );

    /**
     * 批量删除
     */
    const handleBatchDelete = useCallback(
        (ids: (number | string)[]) => {
            if (!onBatchDelete) {
                message.warning('不支持批量删除');
                return;
            }

            if (ids.length === 0) {
                message.warning('请选择要删除的数据');
                return;
            }

            const content =
                typeof batchConfirmContent === 'function'
                    ? batchConfirmContent(ids.length)
                    : batchConfirmContent || `确定要删除选中的 ${ids.length} 条数据吗？`;

            confirm({
                title: confirmTitle,
                icon: <ExclamationCircleOutlined />,
        content,
                okText: '确定',
                okType: 'danger',
                cancelText: '取消',
                async onOk() {
                    try {
                        await onBatchDelete(ids);
                        message.success(batchSuccessMessage);
                        onSuccess?.();
                    } catch (error: any) {
                        message.error(error.message || '批量删除失败');
                        throw error;
                    }
                },
            });
        },
        [onBatchDelete, onSuccess, batchSuccessMessage, confirmTitle, batchConfirmContent]
    );

    return {
        /** 单个删除 */
        handleDelete,
        /** 批量删除 */
        handleBatchDelete,
    };
}

export default useDelete;
