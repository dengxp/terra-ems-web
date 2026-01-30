import React, { useEffect } from 'react';
import {
    ProFormText,
    ProFormSelect,
    ProFormTextArea,
    ProFormDigit,
} from '@ant-design/pro-components';
import { ProModalForm } from '@/components/container';
import {
    KnowledgeArticle,
    getKnowledgeCategories,
} from '@/apis/knowledge';
import { getEnergyTypes } from '@/apis/energyType';
import useCrud from '@/hooks/common/useCrud';
import { OperationEnum } from '@/enums';

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
                await handleSaveOrUpdate(values);
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
        </ProModalForm>
    );
};

export default KnowledgeArticleForm;
