import { SysDictType } from '@/apis/system/dict';
import useCrud from '@/hooks/common/useCrud';
import { ModalForm, ProFormRadio, ProFormText, ProFormTextArea } from '@ant-design/pro-components';
import React, { useEffect } from 'react';

interface DictTypeFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DictTypeForm: React.FC<DictTypeFormProps> = ({ open, onOpenChange }) => {
    const {
        form,
        getState,
        handleSaveOrUpdate,
    } = useCrud<SysDictType>({
        entityName: '字典类型',
        pathname: '/system/dict',
        baseUrl: '/api/system/dict/type',
        onOpenChange,
    });

    const state = getState('/system/dict');

    useEffect(() => {
        if (open) {
            if (state.editData) {
                form.setFieldsValue({ ...state.editData });
            } else {
                form.resetFields();
            }
        }
    }, [open, state.editData, form]);

    return (
        <ModalForm
            title={state.dialogTitle}
            open={open}
            onOpenChange={onOpenChange}
            form={form}
            modalProps={{ destroyOnClose: true, width: 520 }}
            onFinish={handleSaveOrUpdate}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
        >
            <ProFormText
                name="name"
                label="字典名称"
                placeholder="请输入字典名称"
                rules={[{ required: true, message: '请输入字典名称' }]}
            />
            <ProFormText name="id" hidden />
            <ProFormText
                name="type"
                label="字典类型"
                placeholder="请输入字典类型"
                rules={[{ required: true, message: '请输入字典类型' }]}
                disabled={!!state.editData?.id}
            />
            <ProFormRadio.Group
                name="status"
                label="状态"
                initialValue="0"
                options={[
                    { label: '正常', value: '0' },
                    { label: '停用', value: '1' },
                ]}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
            />
        </ModalForm>
    );
};

export default DictTypeForm;
