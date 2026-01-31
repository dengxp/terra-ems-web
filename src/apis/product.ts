import { request } from '@umijs/max';

/**
 * 产品信息 API
 */

export interface Product {
    id: number;
    code: string;
    name: string;
    unit?: string;
    type?: string;
    sortOrder: number;
    status: number;
    remark?: string;
    createdAt?: string;
    updatedAt?: string;
}

export enum ProductType {
    FINISHED = '1',
    SEMI_FINISHED = '2',
    RAW_MATERIAL = '3',
}

/**
 * 分页查询产品
 */
export async function getProducts(params: {
    name?: string;
    status?: number;
    current?: number;
    pageNumber?: number;
    pageSize?: number;
}) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<Product>>>('/api/products', {
        method: 'GET',
        params: {
            pageNumber: pageNumber ?? (current ? current - 1 : 0),
            pageSize: pageSize ?? 10,
            ...rest,
        },
    });
}

/**
 * 获取启用的产品列表
 */
export async function getEnabledProducts() {
    return request<API.Result<Product[]>>('/api/products/enabled', {
        method: 'GET',
    });
}

/**
 * 创建产品
 */
export async function createProduct(data: Partial<Product>) {
    return request<API.Result<Product>>('/api/products', {
        method: 'POST',
        data,
    });
}

/**
 * 更新产品
 */
export async function updateProduct(id: number, data: Partial<Product>) {
    return request<API.Result<Product>>('/api/products', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除产品
 */
export async function deleteProduct(id: number) {
    return request<API.Result<void>>(`/api/products/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 批量删除产品
 */
export async function batchDeleteProduct(ids: number[]) {
    return request<API.Result<void>>('/api/products', {
        method: 'DELETE',
        data: ids,
    });
}

/**
 * 修改状态
 */
export async function updateProductStatus(id: number, status: number) {
    return request<API.Result<Product>>(`/api/products/${id}/status`, {
        method: 'PATCH',
        params: { status },
    });
}

/**
 * 获取产品选项列表
 */
export async function getProductOptions() {
    return request<API.Result<API.Option[]>>('/api/products/options', {
        method: 'GET',
    });
}
