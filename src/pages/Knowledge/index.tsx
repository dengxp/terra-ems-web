import React, { useEffect, useMemo, useState } from 'react';
import { history } from '@umijs/max';
import { getToken } from "@/utils/auth";
import { LOGIN_PATH } from "@/config/constants";
import { ProPageContainer } from '@/components/container';
import { Button, Space, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, EyeFilled } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import useCrud from '@/hooks/common/useCrud';
import { DeleteButton, EditButton, IconButton } from '@/components/button';
import {
    KnowledgeArticle,
    getKnowledgeArticles,
    searchKnowledgeArticles,
    getKnowledgeCategories,
} from '@/apis/knowledge';
import KnowledgeArticleForm from './components/KnowledgeArticleForm';
import KnowledgeArticleDetail from './components/KnowledgeArticleDetail';
import StatusIcon from '@/components/icons/StatusIcon';
import { wrapperResult } from '@/utils';

/**
 * 知识库管理页面
 */
const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<KnowledgeArticle[]>([]);
    const [detailVisible, setDetailVisible] = useState(false);
    const [detailRecord, setDetailRecord] = useState<KnowledgeArticle | undefined>();
    const [searchKeyword, setSearchKeyword] = useState('');

    const token = getToken();
    if (!token) {
        (history as any).push(`${LOGIN_PATH}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return null;
    }

    const {
        getState,
        formRef,
        actionRef,
        toCreate,
        toEdit,
        toDelete,
        toBatchDelete,
        setDialogVisible,
        setShouldRefresh,
    } = useCrud<KnowledgeArticle>({
        pathname: '/knowledge',
        entityName: '知识库文章',
        baseUrl: '/api/ems/knowledge',
    });

    const state = getState('/knowledge');

    const handleView = (record: KnowledgeArticle) => {
        setDetailRecord(record);
        setDetailVisible(true);
    };

    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        toEdit(selectedRows[0]);
    };

    const handleBatchDelete = async () => {
        if (deleteDisabled) return;
        try {
            await toBatchDelete(selectedRowKeys as number[], true);
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            // 错误由全局处理
        }
    };

    const handleFormSuccess = () => {
        setDialogVisible(false);
        actionRef.current?.reload();
    };

    const handleSearch = (value: string) => {
        setSearchKeyword(value);
        actionRef.current?.reload();
    };

    const editDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length !== 1;
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length === 0;
    }, [selectedRowKeys]);

    useEffect(() => {
        if (state?.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state?.shouldRefresh]);

    const columns: ProColumns<KnowledgeArticle>[] = useMemo(() => [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            ellipsis: true,
            render: (_, record) => (
                <Typography.Link onClick={() => handleView(record)} style={{ fontWeight: 500 }}>
                    {record.title}
                </Typography.Link>
            ),
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 120,
            valueType: 'select',
            request: async () => {
                if (!getToken()) return [];
                const res = await getKnowledgeCategories();
                return (res.data || []).map((cat: string) => ({
                    label: cat,
                    value: cat,
                }));
            },
            render: (_, record) => record.category ? <Tag>{record.category}</Tag> : '-',
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
            width: 120,
        },
        {
            title: '阅读次数',
            dataIndex: 'viewCount',
            key: 'viewCount',
            width: 100,
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 80,
            hideInSearch: true,
            render: (_, record) => <StatusIcon value={record.status} />,
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 160,
            valueType: 'dateTime',
            hideInSearch: true,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            width: 150,
            hideInSearch: true,
            render: (_, record) => (
                <Space size={0}>
                    <IconButton
                        tooltip="查看"
                        icon={<EyeFilled />}
                        onClick={() => handleView(record)}
                    />
                    <EditButton onClick={() => toEdit(record)} />
                    <DeleteButton onClick={() => record.id && toDelete(record.id, true)} />
                </Space>
            ),
        },
    ], [selectedRowKeys, selectedRows]);

    return (
        <>
            <ProPageContainer className={'pt-1'}>
                <ProTable<KnowledgeArticle>
                    columns={columns}
                    rowKey="id"
                    formRef={formRef}
                    actionRef={actionRef}
                    tableAlertRender={false}
                    tableAlertOptionRender={false}
                    rowSelection={{
                        selectedRowKeys,
                        onChange: (keys, rows) => {
                            setSelectedRowKeys(keys);
                            setSelectedRows(rows);
                        },
                    }}
                    form={{ span: 6 }}
                    cardProps={{ variant: 'borderless' } as any}
                    search={{
                        labelWidth: 'auto',
                        defaultCollapsed: false,
                    }}
                    toolbar={{
                        title: (
                            <Space>
                                <Button
                                    key="add"
                                    color={'primary'}
                                    icon={<PlusOutlined />}
                                    variant={'outlined'}
                                    size={'small'}
                                    onClick={toCreate}
                                >
                                    新建
                                </Button>
                                <Button
                                    key="edit"
                                    color={'primary'}
                                    icon={<EditOutlined />}
                                    disabled={editDisabled}
                                    size={'small'}
                                    variant={'outlined'}
                                    onClick={toEditSelected}
                                >
                                    修改
                                </Button>
                                <Button
                                    key="danger"
                                    color={'danger'}
                                    icon={<DeleteOutlined />}
                                    disabled={deleteDisabled}
                                    size={'small'}
                                    variant={'outlined'}
                                    onClick={handleBatchDelete}
                                >
                                    删除
                                </Button>
                            </Space>
                        ),
                        search: {
                            onSearch: (value: string) => {
                                handleSearch(value);
                            },
                            placeholder: '搜索文章标题或内容',
                            allowClear: true,
                            style: { width: 350 },
                        },
                    }}
                    request={async (params) => {
                        if (!getToken()) return { data: [], success: true, total: 0 };
                        const { current, pageSize, title, author, category } = params;
                        const res = await getKnowledgeArticles({
                            keyword: searchKeyword,
                            title,
                            author,
                            category,
                            pageNumber: (current || 1) - 1,
                            pageSize: pageSize,
                        });
                        return wrapperResult(res);
                    }}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        defaultPageSize: 20,
                    }}
                />
            </ProPageContainer>

            <KnowledgeArticleForm
                visible={state?.dialogVisible || false}
                onCancel={() => setDialogVisible(false)}
                onSuccess={handleFormSuccess}
            />

            <KnowledgeArticleDetail
                visible={detailVisible}
                articleId={detailRecord?.id}
                onClose={() => setDetailVisible(false)}
            />
        </>
    );
};

export default Index;
