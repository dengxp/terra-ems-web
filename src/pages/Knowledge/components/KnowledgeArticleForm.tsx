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

import { getEnergyTypes } from '@/apis/energyType';
import {
  getKnowledgeCategories, KnowledgeArticle
} from '@/apis/knowledge';
import { ProModalForm } from '@/components/container';
import { OperationEnum } from '@/enums';
import useCrud from '@/hooks/common/useCrud';
import { getToken } from "@/utils/auth";
import {
  ProFormDigit, ProFormSelect, ProFormText, ProFormTextArea
} from '@ant-design/pro-components';
import React, { useEffect } from 'react';

interface KnowledgeArticleFormProps {
    visible: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

const KnowledgeArticleForm: React.FC<KnowledgeArticleFormProps> = ({
    visible,
    onCancel,
    onSuccess,
}) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<KnowledgeArticle>({
        pathname: '/knowledge',
        entityName: '知识库文章',
        baseUrl: '/api/ems/knowledge',
        onOpenChange: (open) => !open && onCancel()
    });

    const state = getState('/knowledge');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({ ...state.editData });
            } else {
                form.resetFields();
            }
        }
    }, [visible, state.operation, state.editData, form]);

    return (
        <ProModalForm
            title={state?.dialogTitle}
            open={visible}
            onOpenChange={(open) => !open && onCancel()}
            form={form}
            onFinish={async (values) => {
                // 处理 category，如果是 tags 模式（数组），取第一个值
                const submitValues = { ...values };
                if (Array.isArray(values.category)) {
                    submitValues.category = values.category[0];
                }
                await handleSaveOrUpdate(submitValues);
                onSuccess();
                return true;
            }}
            width={800}
            layout="horizontal"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 18 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
            }}
            loading={state.loading}
        >
            <ProFormText name="id" hidden />
            <ProFormText
                name="title"
                label="标题"
                rules={[{ required: true, message: '请输入标题' }]}
                placeholder="请输入文章标题"
            />
            <ProFormSelect
                name="energyTypeId"
                label="能源类型"
                placeholder="选择能源类型（可选，留空表示通用知识）"
                request={async () => {
                    if (!getToken()) return [];
                    const res = await getEnergyTypes({});
                    return (res.data?.content || []).map((item: any) => ({
                        label: item.name,
                        value: item.id,
                    }));
                }}
            />
            <ProFormSelect
                name="category"
                label="分类"
                placeholder="请选择或输入分类"
                fieldProps={{
                    mode: 'tags',
                    maxCount: 1,
                    showSearch: true,
                    allowClear: true,
                }}
                request={async () => {
                    if (!getToken()) return [];
                    try {
                        const res = await getKnowledgeCategories();
                        return (res.data || []).map((cat: string) => ({
                            label: cat,
                            value: cat,
                        }));
                    } catch {
                        return [];
                    }
                }}
            />
            <ProFormText
                name="author"
                label="作者"
                placeholder="请输入作者"
            />
            <ProFormTextArea
                name="summary"
                label="摘要"
                placeholder="请输入文章摘要"
                fieldProps={{ rows: 2 }}
            />
            <ProFormTextArea
                name="content"
                label="内容"
                rules={[{ required: true, message: '请输入内容' }]}
                placeholder="请输入文章内容"
                fieldProps={{ rows: 10 }}
            />
            <ProFormDigit
                name="sortOrder"
                label="排序权重"
                placeholder="值越大越靠前"
                min={0}
                fieldProps={{ precision: 0 }}
            />
        </ProModalForm>
    );
};

export default KnowledgeArticleForm;
