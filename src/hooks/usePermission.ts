import { useAccess } from '@umijs/max';
import { useCallback } from 'react';

/**
 * Name: usePermission
 * Description: 提供更具语义化且类型安全的权限判断方法
 */
export const usePermission = () => {
    const { hasPermission: rawHasPermission } = useAccess();

    /**
     * 判断是否拥有指定权限
     */
    const hasPermission = useCallback((code: string): boolean => {
        return rawHasPermission(code);
    }, [rawHasPermission]);

    /**
     * 判断是否拥有任一指定权限 (OR 逻辑)
     */
    const hasAny = useCallback((codes: string[]): boolean => {
        if (!codes || codes.length === 0) return true;
        return codes.some(code => rawHasPermission(code));
    }, [rawHasPermission]);

    /**
     * 判断是否拥有全部指定权限 (AND 逻辑)
     */
    const hasAll = useCallback((codes: string[]): boolean => {
        if (!codes || codes.length === 0) return true;
        return codes.every(code => rawHasPermission(code));
    }, [rawHasPermission]);

    return {
        hasPermission,
        hasAny,
        hasAll,
    };
};

export default usePermission;
