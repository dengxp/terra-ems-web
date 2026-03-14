/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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

import { Product, ProductType } from '@/apis/product';
import { ProModalForm } from "@/components/container";
import { OperationEnum } from '@/enums';
import useCrud from "@/hooks/common/useCrud";
import { ProFormDigit, ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import React, { useEffect } from "react";

interface ProductFormProps {
    visible: boolean;
    onOpenChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = (props) => {
    const { visible, onOpenChange, onSuccess } = props;
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<Product>({
        pathname: '/basic-data/product',
        entityName: '产品',
        baseUrl: '/api/products',
        onOpenChange: onOpenChange
    });

    const state = getState('/basic-data/product');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({
                    ...state.editData,
                    productType: (state.editData as any)?.type
                });
            } else {
                form.resetFields();
                form.setFieldsValue({ status: 0, sortOrder: 0 });
            }
        }
    }, [visible, state.operation, state.editData, form]);

    return (
        <ProModalForm
            title={state.dialogTitle}
            open={visible}
            onOpenChange={onOpenChange}
            form={form}
            onFinish={async (values) => {
                const { productType, ...rest } = values;
                await handleSaveOrUpdate({ ...rest, type: productType });
                onSuccess();
                return true;
            }}
            width={500}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            modalProps={{
                destroyOnHidden: true,
            }}
        >
            <ProFormText name="id" hidden />
            <ProFormText
                name="name"
                label="产品名称"
                placeholder="请输入产品名称"
                rules={[
                    { required: true, message: '请输入产品名称' },
                    { max: 100, message: '名称最多100个字符' },
                ]}
            />
            <ProFormText
                name="code"
                label="产品编码"
                placeholder="请输入产品编码"
                rules={[
                    { required: true, message: '请输入产品编码' },
                    { max: 50, message: '编码最多50个字符' },
                ]}
            />
            <ProFormText
                name="unit"
                label="计量单位"
                placeholder="请输入计量单位"
                rules={[{ max: 20, message: '单位最多20个字符' }]}
            />
            <ProFormSelect
                name="productType"
                label="产品类型"
                placeholder="请选择产品类型"
                rules={[{ required: true, message: '请选择产品类型' }]}
                fieldProps={{
                    allowClear: true
                }}
                options={[
                    { label: '成品', value: ProductType.FINISHED },
                    { label: '半成品', value: ProductType.SEMI_FINISHED },
                    { label: '原材料', value: ProductType.RAW_MATERIAL },
                ]}
            />
            <ProFormDigit
                name="sortOrder"
                hidden
            />
            <ProFormRadio.Group
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
                options={[
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ]}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
                fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }}
            />
        </ProModalForm>
    );
};

export default ProductForm;
