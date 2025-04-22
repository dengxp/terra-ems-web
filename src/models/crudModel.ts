import {useState, useCallback} from 'react';
import {OperationEnum} from "@/enums";
import {PaginationProps} from "antd";

interface CrudState {
  operation: OperationEnum;
  dialogVisible: boolean;
  dialogTitle: string;
  loading: boolean;
  shouldRefresh: boolean;
  editData: Record<string, any> | null;
  pagination: PaginationProps;
}

export default function useCrudModel() {
  // 使用一个 Map 来存储不同 pathname 的状态
  const [states, setStates] = useState<Map<string, CrudState>>(new Map());

  const initState = useCallback((pathname: string) => {
    setStates(prev => {
      if (!prev.has(pathname)) {
        const newMap = new Map(prev);
        newMap.set(pathname, {
          operation: OperationEnum.CREATE,
          dialogVisible: false,
          dialogTitle: '',
          loading: false,
          shouldRefresh: false,
          editData: null,
          pagination: {pageSize: 20}
        });
        return newMap;
      }
      return prev;
    });
  }, []);

  const getState = useCallback((pathname: string): CrudState => {
    if (!states.has(pathname)) {
      return {
        operation: OperationEnum.CREATE,
        dialogVisible: false,
        dialogTitle: '',
        loading: false,
        shouldRefresh: false,
        editData: null,
        pagination: { pageSize: 20 }
      };
    }
    return states.get(pathname)!;
  }, [states]);

  const updateState = useCallback((pathname: string, newState: Partial<CrudState>) => {
    setStates(prev => {
      const currentState = prev.get(pathname);
      if (!currentState) return prev;
      const newMap = new Map(prev);
      newMap.set(pathname, {...currentState, ...newState});
      return newMap;
    });
  }, []);

  return {
    initState,
    getState,
    updateState
  };
}
