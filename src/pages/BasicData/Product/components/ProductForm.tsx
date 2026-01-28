import { TextAreaProps } from 'antd/es/input';
import { Product, ProductType } from '@/apis/product';
import { ProModalForm } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";
import { ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea, ProFormRadio } from "@ant-design/pro-components";
import React from "react";

// ... (existing code)

interface ProductFormProps {
    visible: boolean;
    onOpenChange: (visible: boolean) => void;
    onSuccess: () => void;
    record?: Product;
}

const ProductForm: React.FC<ProductFormProps> = ({
    visible,
    onOpenChange,
    onSuccess,
    record,
}) => {
    const { handleSaveOrUpdate } = useCrud<Product>({
        pathname: '/basic-data/product',
        baseUrl: '/api/products',
    });

    return (
        <ProModalForm
            title={record?.id ? '编辑产品' : '新增产品'}
            open={visible}
            onOpenChange={onOpenChange}
            initialValues={{ status: 0, sortOrder: 0, productType: record?.type, ...record }}
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
                name="code"
                label="产品编码"
                placeholder="请输入产品编码"
                rules={[
                    { required: true, message: '请输入产品编码' },
                    { max: 50, message: '编码最多50个字符' },
                ]}
            />
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
                label="排序"
                placeholder="请输入排序号"
                min={0}
                fieldProps={{ precision: 0 }}
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
                fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } } as TextAreaProps}
            />
        </ProModalForm>
    );
};

export default ProductForm;
