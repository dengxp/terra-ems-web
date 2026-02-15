import { OperationEnum } from "@/enums";
import { PaginationProps } from "antd";
import { useCallback, useState } from 'react';

interface CrudState {
  operation: OperationEnum;
  dialogVisible: boolean;
  dialogTitle: string;
  loading: boolean;
  shouldRefresh: boolean;
  editData: Record<string, any> | null;
  pagination: PaginationProps;
}

/**
 * 获取默认状态
 */
const getDefaultState = (): CrudState => ({
  operation: OperationEnum.CREATE,
  dialogVisible: false,
  dialogTitle: '',
  loading: false,
  shouldRefresh: false,
  editData: null,
  pagination: { pageSize: 20 }
});

/**
 * CRUD 全局状态管理
 * 
 * 使用 pathname 作为 key 隔离不同页面的状态，支持：
 * - 自动初始化：updateState 时自动创建不存在的状态
 * - 状态重置：页面卸载时可重置状态
 */
export default function useCrudModel() {
  // 使用一个 Map 来存储不同 pathname 的状态
  const [states, setStates] = useState<Map<string, CrudState>>(new Map());

  /**
   * 初始化指定 pathname 的状态（幂等操作）
   */
  const initState = useCallback((pathname: string) => {
    setStates(prev => {
      if (!prev.has(pathname)) {
        const newMap = new Map(prev);
        newMap.set(pathname, getDefaultState());
        return newMap;
      }
      return prev;
    });
  }, []);

  /**
   * 获取指定 pathname 的状态
   */
  const getState = useCallback((pathname: string): CrudState => {
    return states.get(pathname) || getDefaultState();
  }, [states]);

  /**
   * 更新指定 pathname 的状态
   * 如果状态不存在，会自动初始化后再更新（解决首次渲染时序问题）
   */
  const updateState = useCallback((pathname: string, newState: Partial<CrudState>) => {
    setStates(prev => {
      // 自动初始化不存在的状态，解决 useEffect 初始化时序问题
      const currentState = prev.get(pathname) || getDefaultState();
      const newMap = new Map(prev);
      newMap.set(pathname, { ...currentState, ...newState });
      return newMap;
    });
  }, []);

  /**
   * 重置指定 pathname 的状态（页面卸载时调用）
   * 可选择性重置对话框状态，保留其他状态
   */
  const resetState = useCallback((pathname: string, full: boolean = false) => {
    setStates(prev => {
      if (!prev.has(pathname)) return prev;

      const newMap = new Map(prev);
      if (full) {
        // 完全重置
        newMap.set(pathname, getDefaultState());
      } else {
        // 仅重置对话框相关状态，保留分页等设置
        const currentState = prev.get(pathname)!;
        newMap.set(pathname, {
          ...currentState,
          dialogVisible: false,
          dialogTitle: '',
          editData: null,
          loading: false
        });
      }
      return newMap;
    });
  }, []);

  return {
    initState,
    getState,
    updateState,
    resetState
  };
}
