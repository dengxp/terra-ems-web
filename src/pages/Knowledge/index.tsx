import React, { useEffect, useMemo, useState } from 'react';
import { ProPageContainer } from '@/components/container';
import { Button, message, Space, Input, Tag } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import useCrud from '@/hooks/common/useCrud';
import { DeleteButton, EditButton } from '@/components/button';
import {
    KnowledgeArticle,
    getKnowledgeArticles,
    batchDeleteKnowledgeArticles,
    searchKnowledgeArticles,
} from '@/apis/knowledge';
import KnowledgeArticleForm from './components/KnowledgeArticleForm';
import KnowledgeArticleDetail from './components/KnowledgeArticleDetail';
import StatusIcon from '@/components/icons/StatusIcon';
import ModalConfirm from '@/components/ModalConfirm';

const { Search } = Input;

/**
 * 知识库管理页面
 */
const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<KnowledgeArticle[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [detailVisible, setDetailVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<KnowledgeArticle | undefined>();
    const [searchKeyword, setSearchKeyword] = useState('');

    const {
        getState,
        formRef,
        actionRef,
        toDelete,
        setShouldRefresh,
    } = useCrud<KnowledgeArticle>({
        pathname: '/knowledge',
        entityName: '知识库文章',
        baseUrl: '/api/ems/knowledge',
    });

    const state = getState('/knowledge');

    const handleAdd = () => {
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: KnowledgeArticle) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const handleView = (record: KnowledgeArticle) => {
        setCurrentRecord(record);
        setDetailVisible(true);
    };

    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        handleEdit(selectedRows[0]);
    };

    const toDeleteBatch = () => {
        if (deleteDisabled) return;
        if (!selectedRowKeys || selectedRowKeys.length === 0) return;

        ModalConfirm({
            title: '删除文章',
            content: '文章删除后将无法恢复，请确认是否删除？',
            onOk: async () => {
                try {
                    await batchDeleteKnowledgeArticles(selectedRowKeys as number[]);
                    message.success('删除成功');
                    setSelectedRowKeys([]);
                    setSelectedRows([]);
                    actionRef.current?.reload();
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    const handleFormSuccess = () => {
        setFormVisible(false);
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

    const columns: ProColumns<KnowledgeArticle>[] = [
        {
            title: '标题',
            dataIndex: 'title',
            key: 'title',
            width: 250,
            ellipsis: true,
            render: (_, record) => (
                <a onClick={() => handleView(record)}>{record.title}</a>
            ),
        },
        {
            title: '分类',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            hideInSearch: true,
            render: (_, record) => record.category ? <Tag>{record.category}</Tag> : '-',
        },
        {
            title: '作者',
            dataIndex: 'author',
            key: 'author',
            width: 100,
            hideInSearch: true,
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
            render: (_, record) => <StatusIcon value={record.status === 'ENABLE' ? 0 : 1} />,
        },
        {
            title: '创建时间',
            dataIndex: 'createdTime',
            key: 'createdTime',
            width: 160,
            hideInSearch: true,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            width: 150,
            hideInSearch: true,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                    />
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => record.id && toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

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
                    cardProps={{ bordered: false }}
                    search={false}
                    toolbar={{
                        title: (
                            <Space>
                                <Button
                                    key="add"
                                    color={'primary'}
                                    icon={<PlusOutlined />}
                                    variant={'outlined'}
                                    size={'small'}
                                    onClick={handleAdd}
                                >
                                    新建
                                </Button>
                                <Button
                                    key="edit"
                                    color={'green'}
                                    icon={<EditOutlined />}
                                    disabled={editDisabled}
                                    size={'small'}
                                    variant={'outlined'}
                                    onClick={toEditSelected}
                                >
                                    修改
                                </Button>
                                <Button
                                    key="delete"
                                    color={'danger'}
                                    icon={<DeleteOutlined />}
                                    disabled={deleteDisabled}
                                    size={'small'}
                                    variant={'outlined'}
                                    onClick={toDeleteBatch}
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
                        const { current, pageSize } = params;
                        let res;
                        if (searchKeyword) {
                            res = await searchKnowledgeArticles({
                                keyword: searchKeyword,
                                page: (current || 1) - 1,
                                size: pageSize,
                            });
                        } else {
                            res = await getKnowledgeArticles({
                                page: (current || 1) - 1,
                                size: pageSize,
                            });
                        }
                        return {
                            data: res.data?.content || [],
                            total: res.data?.totalElements || 0,
                            success: res.success,
                        };
                    }}
                />
            </ProPageContainer>

            <KnowledgeArticleForm
                visible={formVisible}
                record={currentRecord}
                onCancel={() => setFormVisible(false)}
                onSuccess={handleFormSuccess}
            />

            <KnowledgeArticleDetail
                visible={detailVisible}
                articleId={currentRecord?.id}
                onClose={() => setDetailVisible(false)}
            />
        </>
    );
};

export default Index;
