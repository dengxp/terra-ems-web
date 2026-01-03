import {OperationEnum} from "@/enums";
import {history, useModel} from "@umijs/max";
import {useCallback, useEffect, useRef} from "react";
import {request} from "@@/exports";
import {Form, message} from "antd";
import {ActionType, ProFormInstance} from "@ant-design/pro-components";
import ModalConfirm from "@/components/ModalConfirm";
import {wrapperResult} from '@/utils';
import {Entity, Page, Result} from "@/types";

type Props = {
  entityName?: string;
  pathname: string;
  baseUrl: string;
  onOpenChange?: (visible: boolean) => void;
}

export default function useCrud<T extends Entity>({entityName, pathname, baseUrl, onOpenChange}: Props) {
  const {getState, initState, updateState} = useModel('crudModel');
  // const state = getState(pathname);

  const [form] = Form.useForm();
  const formRef = useRef<ProFormInstance>();
  const actionRef = useRef<ActionType | undefined>();

  // 👇 这里就初始化好对应 pathname 的状态
  useEffect(() => {
    initState(pathname);
  }, [pathname, initState]);

  const findByPage = useCallback(async (params: Record<string, any>) => {
    return request<Result<Page<T>>>(
      baseUrl + '/page',
      {
        method: 'GET',
        params
      }
    )
  }, [baseUrl]);

  const findByPageWithParams = useCallback(async (params: Record<string, any>) => {
    return request<Result<Page<T>>>(
      baseUrl + '/condition',
      {
        method: 'GET',
        params
      }
    )
  }, [baseUrl]);

  const saveOrUpdate = useCallback(async (data: any) => {
    return request<Result<T>>(
      baseUrl,
      {
        method: 'POST',
        data
      }
    )
  }, [baseUrl]);

  const save = useCallback(async (data: Record<string, any>) => {
    return request<Result<T>>(
      baseUrl,
      {
        method: 'POST',
        data
      }
    )
  }, [baseUrl]);

  const update = useCallback(async (data: Record<string, any>) => {
    return request<Result<T>>(
      baseUrl,
      {
        method: 'PUT',
        data
      }
    )
  }, [baseUrl]);

  const deleteById = useCallback(async (id: any) => {
    return request(
      baseUrl + '/' + id,
      {
        method: 'DELETE'
      })
  }, [baseUrl]);

  const fetchPage = useCallback(async (params: Record<string, any>) => {
    const {current, pageSize, ...rest} = params;
    const result = await findByPage({
      pageNumber: current,
      pageSize,
      ...rest
    });
    return wrapperResult(result);

  }, [findByPage]);

  const fetchPageWithParams = useCallback(async (params: Record<string, any>) => {
    const {current, pageSize, ...rest} = params;
    const result = await findByPageWithParams({
      pageNum: current,
      pageSize,
      ...rest
    });
    return wrapperResult(result);

  }, [findByPageWithParams]);

  const handleSaveOrUpdate = useCallback(async (values: Record<string, any>) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        updateState(pathname, {loading: true});
        const result = await saveOrUpdate(values);
        void message.success(result.message || '保存成功');
        updateState(pathname, { loading: false, shouldRefresh: true });
        onOpenChange?.(false);
        resolve();
      } catch (error: any) {
        updateState(pathname, {loading: false});
        console.error(error);
        reject(error);
      }
    });
  }, [saveOrUpdate, pathname, updateState, onOpenChange]);

  const handleSave = useCallback(async (values: Record<string, any>) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        updateState(pathname, {loading: true});
        const result = await save(values);
        void message.success(result.message || '保存成功');
        updateState(pathname, { loading: false, shouldRefresh: true });
        onOpenChange?.(false);
        resolve();
      } catch (error: any) {
        updateState(pathname, {loading: false});
        console.error(error);
        reject(error);
      }
    });
  }, [saveOrUpdate, pathname, updateState, onOpenChange]);

  const handleUpdate = useCallback(async (values: Record<string, any>) => {
    return new Promise<void>(async (resolve, reject) => {
      try {
        updateState(pathname, {loading: true});
        const result = await update(values);
        void message.success(result.message || '保存成功');
        updateState(pathname, { loading: false, shouldRefresh: true });
        onOpenChange?.(false);
        resolve();
      } catch (error: any) {
        updateState(pathname, {loading: false});
        console.error(error);
        reject(error);
      }
    });
  }, [saveOrUpdate, pathname, updateState, onOpenChange]);

  const toCreate = useCallback(() => {
    updateState(pathname, {
      operation: OperationEnum.CREATE,
      dialogTitle: '新建' + entityName,
      dialogVisible: true
    })
  }, [entityName, pathname, updateState]);

  const toEdit = useCallback((editData?: T) => {
    updateState(pathname, {
      operation: OperationEnum.EDIT,
      dialogTitle: '编辑' + entityName,
      dialogVisible: true
    });
    if(editData) {
      updateState(pathname, {
        editData: {...editData}
      });
    }
  }, [entityName, pathname, updateState]);

  const toPage = useCallback((editData: T, pathname: string) => {
    updateState(pathname, {
      operation: OperationEnum.EDIT,
      editData: {...editData}
    });
    history.push(pathname);
  }, [pathname, updateState]);

  const toDialog = useCallback((editData: T) => {
    updateState(pathname, {
      editData: {...editData}
    });
    onOpenChange?.(true);
  }, [updateState]);

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
              updateState(pathname, {
                shouldRefresh: true
              });
            }
            resolve(); // 成功时 resolve
          } catch (error: any) {
            console.error(error.message);
            reject(error); // 失败时 reject
          }
        },
        onCancel() {
          // reject(new Error('取消删除')); // 如果用户取消删除，reject 一个错误
        }
      });
    });
  }, [updateState, entityName, deleteById]);

  const setDialogVisible = useCallback((visible: boolean) => {
    updateState(pathname, {
      dialogVisible: visible
    })
  }, [updateState]);

  const setLoading = useCallback((loading: boolean) => {
    updateState(pathname, {
      loading: loading
    })
  }, [updateState]);

  const setDialogTitle = useCallback((title: string) => {
    updateState(pathname, {
      dialogTitle: title
    });
  }, [updateState]);

  const setShouldRefresh = useCallback((shouldRefresh: boolean) => {
    updateState(pathname, {
      shouldRefresh: shouldRefresh
    });
  }, [updateState]);

  return {
    fetchPage,
    fetchPageWithParams,
    handleSaveOrUpdate,
    handleSave,
    handleUpdate,
    saveOrUpdate,
    save,
    update,
    toCreate,
    toEdit,
    toDialog,
    toDelete,
    toPage,
    setDialogVisible,
    setLoading,
    setDialogTitle,
    setShouldRefresh,
    form,
    formRef,
    actionRef,
    getState,
    updateState
  }
}
