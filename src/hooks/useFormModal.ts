import { useState, useCallback } from 'react';
import { Form, message } from 'antd';
import type { FormInstance } from 'antd';

/**
 * useFormModal Hook 配置选项
 */
export interface UseFormModalOptions<T> {
    /** 表单实例 */
    form?: FormInstance<T>;
    /** 创建函数 */
    onCreate?: (values: T) => Promise<any>;
    /** 更新函数 */
    onUpdate?: (id: number, values: T) => Promise<any>;
    /** 成功回调 */
    onSuccess?: () => void;
    /** 创建成功消息 */
    createSuccessMessage?: string;
    /** 更新成功消息 */
    updateSuccessMessage?: string;
}

/**
 * useFormModal - 表单弹窗管理 Hook
 * 封装新增/编辑表单的常用操作
 * 
 * @example
 * ```typescript
 * const [form] = Form.useForm();
 * const {
 *   visible,
 *   isEdit,
 *   loading,
 *   showModal,
 *   handleOk,
 *   handleCancel
 * } = useFormModal({
 *   form,
 *   onCreate: UserApi.create,
 *   onUpdate: UserApi.update,
 *   onSuccess: () => refresh()
 * });
 * 
 * <Modal
 *   visible={visible}
 *   onOk={handleOk}
 *   onCancel={handleCancel}
 *   confirmLoading={loading}
 * >
 *   <Form form={form}>
 *     ...
 *   </Form>
 * </Modal>
 * ```
 */
export function useFormModal<T = any>(options: UseFormModalOptions<T> = {}) {
    const {
        form: formProp,
        onCreate,
        onUpdate,
        onSuccess,
        createSuccessMessage = '创建成功',
        updateSuccessMessage = '更新成功',
    } = options;

    const [defaultForm] = Form.useForm<T>();
    const form = formProp || defaultForm;

    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    /** 是否为编辑模式 */
    const isEdit = editId !== null;

    /**
     * 显示新增表单
     */
    const showCreate = useCallback((initialValues?: Partial<T>) => {
        setEditId(null);
        setVisible(true);
        if (initialValues) {
            form.setFieldsValue(initialValues as T);
        } else {
            form.resetFields();
        }
    }, [form]);

    /**
     * 显示编辑表单
     */
    const showEdit = useCallback((id: number, record: T) => {
        setEditId(id);
        setVisible(true);
        form.setFieldsValue(record);
    }, [form]);

    /**
     * 显示表单（自动判断新增/编辑）
     */
    const showModal = useCallback((record?: T & { id?: number }) => {
        if (record?.id) {
            showEdit(record.id, record);
        } else {
            showCreate(record);
        }
    }, [showCreate, showEdit]);

    /**
     * 处理确定
     */
    const handleOk = useCallback(async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (isEdit && editId && onUpdate) {
                await onUpdate(editId, values);
                message.success(updateSuccessMessage);
            } else if (!isEdit && onCreate) {
                await onCreate(values);
                message.success(createSuccessMessage);
            }

            setVisible(false);
            form.resetFields();
            onSuccess?.();
        } catch (error: any) {
            // 表单验证错误不需要处理
            if (!error.errorFields) {
                message.error(error.message || '操作失败');
            }
        } finally {
            setLoading(false);
        }
    }, [
        form,
        isEdit,
        editId,
        onCreate,
        onUpdate,
        onSuccess,
        createSuccessMessage,
        updateSuccessMessage,
    ]);

    /**
     * 处理取消
     */
    const handleCancel = useCallback(() => {
        setVisible(false);
        form.resetFields();
        setEditId(null);
    }, [form]);

    return {
        /** 表单实例 */
        form,
        /** 弹窗可见性 */
        visible,
        /** 是否为编辑模式 */
        isEdit,
        /** 加载状态 */
        loading,
        /** 编辑的ID */
        editId,
        /** 显示新增表单 */
        showCreate,
        /** 显示编辑表单 */
        showEdit,
        /** 显示表单（自动判断） */
        showModal,
        /** 处理确定 */
        handleOk,
        /** 处理取消 */
        handleCancel,
        /** 设置可见性 */
        setVisible,
    };
}

export default useFormModal;
