import { OperationEnum } from "@/enums";
import { history, useModel } from "@umijs/max";
import { useCallback, useEffect, useRef } from "react";
import { request } from "@@/exports";
import { Form, message } from "antd";
import { ActionType, ProFormInstance } from "@ant-design/pro-components";
import ModalConfirm from "@/components/ModalConfirm";
import { wrapperResult } from '@/utils';

type Props = {
  entityName?: string;
  pathname: string;
  baseUrl: string;
  onOpenChange?: (visible: boolean) => void;
}

/**
 * 通用 CRUD Hook
 *
 * 提供标准的增删改查操作和 UI 状态管理
 *
 * API 端点约定：
 * - GET    baseUrl          → 分页查询
 * - GET    baseUrl/search   → 复杂搜索
 * - POST   baseUrl          → 简单新增/更新 (saveOrUpdate)
 * - POST   baseUrl/create   → 复杂新增 (create)
 * - PUT    baseUrl          → 复杂更新 (update)
 * - DELETE baseUrl/{id}     → 删除
 */
export default function useCrud<T extends Entity>({ entityName, pathname, baseUrl, onOpenChange }: Props) {
  const { getState, initState, updateState, resetState } = useModel('crudModel');

  const [form] = Form.useForm();
  // const formRef = useRef<ProFormInstance>();
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType | undefined>();

  // 初始化对应 pathname 的状态，并在组件卸载时重置对话框状态
  useEffect(() => {
    initState(pathname);
    // 组件卸载时重置对话框状态，解决页面切换时对话框残留问题
    return () => {
      resetState(pathname);
    };
  }, [pathname, initState, resetState]);

  // ============================================================================
  // 纯 API 调用方法 (第 4 层)
  // ============================================================================

  /**
   * 分页查询
   */
  const findByPage = useCallback(async (params: Record<string, any>) => {
    return request<API.Result<API.PageResult<T>>>(
      baseUrl,
      {
        method: 'GET',
        params
      }
    )
  }, [baseUrl]);

  /**
   * 简单新增或更新 (后端根据 id 判断)
   */
  const saveOrUpdate = useCallback(async (data: any) => {
    return request<API.Result<T>>(
      baseUrl,
      {
        method: 'POST',
        data
      }
    )
  }, [baseUrl]);

  /**
   * 复杂新增 (有特殊业务逻辑)
   */
  const create = useCallback(async (data: Record<string, any>) => {
    return request<API.Result<T>>(
      baseUrl + '/create',
      {
        method: 'POST',
        data
      }
    )
  }, [baseUrl]);

  /**
   * 复杂更新 (有特殊业务逻辑)
   */
  const update = useCallback(async (data: Record<string, any>) => {
    return request<API.Result<T>>(
      baseUrl,
      {
        method: 'PUT',
        data
      }
    )
  }, [baseUrl]);

  /**
   * 根据 ID 删除
   */
  const deleteById = useCallback(async (id: any) => {
    return request<API.Result<void>>(
      baseUrl + '/' + id,
      {
        method: 'DELETE'
      })
  }, [baseUrl]);

  /**
   * 批量删除
   */
  const batchDeleteByIds = useCallback(async (ids: any[]) => {
    return request<API.Result<void>>(
      baseUrl,
      {
        method: 'DELETE',
        data: ids
      })
  }, [baseUrl]);

  // ============================================================================
  // 封装方法 (供 ProTable 使用)
  // ============================================================================

  /**
   * 分页查询 (适配 ProTable request)
   */
  const fetchPage = useCallback(async (params: Record<string, any>) => {
    const { current, pageSize, ...rest } = params;
    const result = await findByPage({
      pageNumber: (current || 1) - 1,
      pageSize,
      ...rest
    });
    return wrapperResult(result);
  }, [findByPage]);

  /**
   * 复杂搜索 (适配 ProTable request，当前与 fetchPage 一致)
   */
  const search = fetchPage;

  // ============================================================================
  // 带 UI 交互的操作方法 (第 1 层)
  // ============================================================================

  /**
   * 处理简单保存/更新 (带 loading、message、刷新)
   */
  const handleSaveOrUpdate = useCallback(async (values: Record<string, any>) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        updateState(pathname, { loading: true });
        const result = await saveOrUpdate(values);
        void message.success(result.message || '保存成功');
        updateState(pathname, { loading: false, shouldRefresh: true, dialogVisible: false });
        onOpenChange?.(false);
        resolve();
      } catch (error: any) {
        updateState(pathname, { loading: false });
        console.error(error);
        reject(error);
      }
    });
  }, [saveOrUpdate, pathname, updateState, onOpenChange]);

  /**
   * 处理复杂新增 (带 loading、message、刷新)
   */
  const handleCreate = useCallback(async (values: Record<string, any>) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        updateState(pathname, { loading: true });
        const result = await create(values);
        void message.success(result.message || '创建成功');
        updateState(pathname, { loading: false, shouldRefresh: true, dialogVisible: false });
        onOpenChange?.(false);
        resolve();
      } catch (error: any) {
        updateState(pathname, { loading: false });
        console.error(error);
        reject(error);
      }
    });
  }, [create, pathname, updateState, onOpenChange]);

  /**
   * 处理复杂更新 (带 loading、message、刷新)
   */
  const handleUpdate = useCallback(async (values: Record<string, any>) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        updateState(pathname, { loading: true });
        const state = getState(pathname);
        // 自动合并逻辑
        const data = state?.editData ? { ...state.editData, ...values } : values;

        const result = await update(data);
        void message.success(result.message || '更新成功');
        updateState(pathname, { loading: false, shouldRefresh: true, dialogVisible: false });
        onOpenChange?.(false);
        resolve();
      } catch (error: any) {
        updateState(pathname, { loading: false });
        console.error(error);
        reject(error);
      }
    });
  }, [update, pathname, updateState, onOpenChange, getState]);

  // ============================================================================
  // UI 状态变化方法 (第 2 层)
  // ============================================================================

  /**
   * 打开新建对话框
   */
  const toCreate = useCallback((initialData?: any) => {
    updateState(pathname, {
      operation: OperationEnum.CREATE,
      dialogTitle: '新建' + entityName,
      dialogVisible: true,
      editData: initialData || null
    })
  }, [entityName, pathname, updateState]);

  /**
   * 打开编辑对话框
   */
  const toEdit = useCallback((editData?: T) => {
    updateState(pathname, {
      operation: OperationEnum.EDIT,
      dialogTitle: '编辑' + entityName,
      dialogVisible: true,
      editData: editData ? { ...editData } : null
    });
  }, [entityName, pathname, updateState]);

  /**
   * 跳转到详情页面
   */
  const toPage = useCallback((editData: T, targetPath: string) => {
    updateState(targetPath, {
      operation: OperationEnum.EDIT,
      editData: { ...editData }
    });
    history.push(targetPath);
  }, [updateState]);

  /**
   * 打开对话框（通用）
   */
  const toDialog = useCallback((editData: T) => {
    updateState(pathname, {
      editData: { ...editData }
    });
    onOpenChange?.(true);
  }, [pathname, updateState, onOpenChange]);

  /**
   * 删除确认
   */
  const toDelete = useCallback((id: any, refresh: boolean = false) => {
    return new Promise<void>((resolve, reject) => {
      ModalConfirm({
        title: '删除' + entityName,
        content: (entityName || '数据') + '删除后将无法恢复，请确认是否删除？',
        async onOk() {
          try {
            const result = await deleteById(id);
            message.success(result.message || '删除成功');
            if (refresh) {
              updateState(pathname, { shouldRefresh: true });
            }
            resolve();
          } catch (error: any) {
            console.error(error.message);
            reject(error);
          }
        },
        onCancel() {
          // 用户取消，不做处理
        }
      });
    });
  }, [pathname, updateState, entityName, deleteById]);

  /**
   * 批量删除确认
   */
  const toBatchDelete = useCallback((ids: (number | string)[], refresh: boolean = false) => {
    return new Promise<void>((resolve, reject) => {
      if (!ids || ids.length === 0) {
        message.warning('请选择要删除的数据');
        reject(new Error('未选择数据'));
        return;
      }

      ModalConfirm({
        title: '批量删除' + entityName,
        content: `确定要删除选中的 ${ids.length} 条${entityName || '数据'}吗？删除后将无法恢复。`,
        async onOk() {
          try {
            const result = await batchDeleteByIds(ids);
            message.success(result.message || '批量删除成功');
            if (refresh) {
              updateState(pathname, { shouldRefresh: true });
            }
            resolve();
          } catch (error: any) {
            console.error(error.message);
            reject(error);
          }
        },
        onCancel() {
          // 用户取消，不做处理
        }
      });
    });
  }, [pathname, updateState, entityName, batchDeleteByIds]);

  // ============================================================================
  // 状态设置方法 (第 3 层)
  // ============================================================================

  const setDialogVisible = useCallback((visible: boolean) => {
    updateState(pathname, { dialogVisible: visible })
  }, [pathname, updateState]);

  const setLoading = useCallback((loading: boolean) => {
    updateState(pathname, { loading })
  }, [pathname, updateState]);

  const setDialogTitle = useCallback((title: string) => {
    updateState(pathname, { dialogTitle: title });
  }, [pathname, updateState]);

  const setShouldRefresh = useCallback((shouldRefresh: boolean) => {
    updateState(pathname, { shouldRefresh });
  }, [pathname, updateState]);

  const setEditData = useCallback((editData: T | null) => {
    updateState(pathname, { editData });
  }, [pathname, updateState]);

  return {
    // 分页查询
    fetchPage,
    // 搜索
    search,
    // 带 UI 交互的操作
    handleSaveOrUpdate,
    handleCreate,
    handleUpdate,
    // 纯 API 调用
    saveOrUpdate,
    create,
    update,
    deleteById,
    batchDeleteByIds,
    // UI 状态变化
    toCreate,
    toEdit,
    toDialog,
    toDelete,
    toBatchDelete,
    toPage,
    // 状态设置
    setDialogVisible,
    setLoading,
    setDialogTitle,
    setShouldRefresh,
    setEditData,
    // 表单/表格引用
    form,
    formRef,
    actionRef,
    // 状态获取/更新
    getState,
    updateState,
    resetState
  }
}
