/*
 * Copyright (c) 2024 泰若科技（广州）有限公司. All rights reserved.
 */

import { request } from '@umijs/max';

/**
 * 知识库API
 */

export interface KnowledgeArticle {
    id?: number;
    title: string;
    energyTypeId?: number;
    category?: string;
    summary?: string;
    content?: string;
    author?: string;
    viewCount?: number;
    sortOrder?: number;
    status?: number;
    createdAt?: string;
    updatedAt?: string;
}

/**
 * 创建文章
 */
export async function createKnowledgeArticle(data: KnowledgeArticle) {
    return request<API.Result<KnowledgeArticle>>('/api/ems/knowledge', {
        method: 'POST',
        data,
    });
}

/**
 * 更新文章
 */
export async function updateKnowledgeArticle(id: number, data: KnowledgeArticle) {
    return request<API.Result<KnowledgeArticle>>('/api/ems/knowledge', {
        method: 'POST',
        data: { ...data, id },
    });
}

/**
 * 删除文章
 */
export async function deleteKnowledgeArticle(id: number) {
    return request<API.Result<void>>(`/api/ems/knowledge/${id}`, {
        method: 'DELETE',
    });
}

/**
 * 批量删除文章
 */
export async function batchDeleteKnowledgeArticles(ids: number[]) {
    return request<API.Result<void>>('/api/ems/knowledge', {
        method: 'DELETE',
        data: ids,
    });
}

/**
 * 获取文章详情（会增加阅读次数）
 */
export async function getKnowledgeArticle(id: number) {
    return request<API.Result<KnowledgeArticle>>(`/api/ems/knowledge/${id}`, {
        method: 'GET',
    });
}

/**
 * 分页查询文章
 */
export async function getKnowledgeArticles(params: {
    keyword?: string;
    title?: string;
    author?: string;
    energyTypeId?: number;
    category?: string;
    status?: number;
    current?: number;
    pageNumber?: number;
    pageSize?: number;
}) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<KnowledgeArticle>>>('/api/ems/knowledge', {
        method: 'GET',
        params: {
            pageNumber: pageNumber ?? (current ? current - 1 : 0),
            pageSize: pageSize ?? 10,
            ...rest,
        },
    });
}

/**
 * 搜索文章
 */
export async function searchKnowledgeArticles(params: {
    keyword: string;
    current?: number;
    pageNumber?: number;
    pageSize?: number;
}) {
    const { current, pageNumber, pageSize, ...rest } = params;
    return request<API.Result<API.PageResult<KnowledgeArticle>>>('/api/ems/knowledge/search', {
        method: 'GET',
        params: {
            pageNumber: pageNumber ?? (current ? current - 1 : 0),
            pageSize: pageSize ?? 10,
            ...rest,
        },
    });
}

/**
 * 获取所有分类
 */
export async function getKnowledgeCategories() {
    return request<API.Result<string[]>>('/api/ems/knowledge/categories', {
        method: 'GET',
    });
}

/**
 * 获取热门文章
 */
export async function getHotKnowledgeArticles() {
    return request<API.Result<KnowledgeArticle[]>>('/api/ems/knowledge/hot', {
        method: 'GET',
    });
}

/**
 * 更新文章状态
 */
export async function updateKnowledgeArticleStatus(id: number, status: 'ENABLE' | 'DISABLE') {
    return request<API.Result<void>>(`/api/ems/knowledge/${id}/status`, {
        method: 'POST',
        params: { status },
    });
}
