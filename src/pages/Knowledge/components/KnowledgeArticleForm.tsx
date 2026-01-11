import React from 'react';
import {
    ModalForm,
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    ProFormDigit,
} from '@ant-design/pro-components';
import { message } from 'antd';
import {
    KnowledgeArticle,
    createKnowledgeArticle,
    updateKnowledgeArticle,
    getKnowledgeCategories,
} from '@/apis/knowledge';
import { getEnergyTypes } from '@/apis/energyType';

interface KnowledgeArticleFormProps {
    visible: boolean;
    record?: KnowledgeArticle;
    onCancel: () => void;
    onSuccess: () => void;
}

const KnowledgeArticleForm: React.FC<KnowledgeArticleFormProps> = ({
    visible,
    record,
    onCancel,
    onSuccess,
}) => {
    const isEdit = !!record?.id;

    const handleSubmit = async (values: KnowledgeArticle) => {
        try {
            if (isEdit && record?.id) {
                await updateKnowledgeArticle(record.id, values);
                message.success('更新成功');
            } else {
                await createKnowledgeArticle(values);
                message.success('创建成功');
            }
            onSuccess();
            return true;
        } catch (error) {
            message.error(isEdit ? '更新失败' : '创建失败');
            return false;
        }
    };

    return (
        <ModalForm<KnowledgeArticle>
            title={isEdit ? '编辑文章' : '新建文章'}
            open={visible}
            modalProps={{
                destroyOnClose: true,
                onCancel,
                width: 800,
            }}
            initialValues={record || {}}
            onFinish={handleSubmit}
        >
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
                    const res = await getEnergyTypes();
                    return (res.data || []).map((item: any) => ({
                        label: item.name,
                        value: item.id,
                    }));
                }}
            />
            <ProFormSelect
                name="category"
                label="分类"
                placeholder="选择或输入分类"
                fieldProps={{
                    showSearch: true,
                    allowClear: true,
                }}
                request={async () => {
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
        </ModalForm>
    );
};

export default KnowledgeArticleForm;
