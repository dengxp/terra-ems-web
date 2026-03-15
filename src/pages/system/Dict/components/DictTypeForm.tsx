/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

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
