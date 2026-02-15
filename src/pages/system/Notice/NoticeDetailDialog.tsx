import { noticeApi, SysNotice } from "@/apis/system/notice";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { DataItemStatus, OperationEnum } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import { ProForm, ProFormRadio, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import React, { useEffect } from 'react';

import { MdEditor, MdPreview } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';

interface NoticeDetailDialogProps extends Omit<ProModalFormProps, 'title'> {
    record?: SysNotice;
    operation?: OperationEnum;
    onSuccess?: () => void;
    title?: React.ReactNode;
}

const defaultValue = {
    noticeTitle: '',
    noticeType: '1',
    status: DataItemStatus.ENABLE,
    noticeContent: '',
    remark: ''
}

const NoticeDetailDialog = (props: NoticeDetailDialogProps) => {
    // 1. 严格隔离自定义 Props，防止 antd v6 与 Pro-Components v2 产生类型污染
    const {
        record: propsRecord,
        operation: propsOperation,
        onSuccess,
        open,
        onOpenChange,
        title: propsTitle,
    } = props;

    const {
        form: crudForm,
        handleSaveOrUpdate,
        getState
    } = useCrud<SysNotice>({
        pathname: '/system/notice',
        entityName: '通知公告',
        baseUrl: '/api/system/notice',
        onOpenChange
    });

    const state = getState('/system/notice');

    // 优先使用 props 传入的操作类型和数据，如果没有则使用 useCrud 内部状态
    const operation = propsOperation || state.operation;
    const record = (propsRecord || state.editData) as SysNotice | null;
    const isDetail = operation === OperationEnum.DETAIL;

    // 强转 form 实例为 any 以避开 antd v6 在 ProComponents v2 下的 NamePath 冲突
    const formInstance = crudForm as any;

    const onFinish = async (values: Record<string, any>) => {
        const data = (values.id || record?.id) ? { ...record, ...values } : { ...values };
        await handleSaveOrUpdate(data);
        onSuccess?.();
    }

    useEffect(() => {
        if (open) {
            if (operation === OperationEnum.EDIT || operation === OperationEnum.DETAIL) {
                formInstance?.setFieldsValue({ ...record });

                // 如果是详情模式，标记为已读
                if (operation === OperationEnum.DETAIL && record?.id && !record.readFlag) {
                    noticeApi.markAsRead(record.id).then(() => {
                        onSuccess?.(); // 标记成功后通知父组件刷新
                    }).catch(err => console.error('Mark as read failed:', err));
                }
            } else {
                formInstance?.setFieldsValue({ ...defaultValue });
            }
        }
    }, [open, operation, record, formInstance, onSuccess]);

    return (
        <ProModalForm
            open={open}
            onOpenChange={onOpenChange}
            title={isDetail ? '查看公告' : (propsTitle || state.dialogTitle)}
            width={1100}
            form={formInstance}
            layout="vertical"
            loading={state.loading}
            onFinish={onFinish}
            submitter={isDetail ? false : undefined}
            grid={true}
            modalProps={{
                bodyStyle: { padding: '24px 32px 12px 32px' },
                destroyOnClose: true,
                centered: true
            }}
        >
            <ProFormText label={'ID'}
                name="id"
                hidden={true} />

            {isDetail ? (
                <div className="notice-view-container" style={{ gridColumn: 'span 24' }}>
                    <div style={{
                        marginBottom: '24px',
                        paddingBottom: '16px',
                        borderBottom: '1px solid #f0f0f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        color: '#8c8c8c'
                    }}>
                        <span>类型：{record?.noticeType === '1' ? '通知' : '公告'}</span>
                        <span>发布时间：{record?.createdAt}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '24px', textAlign: 'center' }}>
                        {record?.noticeTitle}
                    </div>
                    <div className="md-preview-wrapper" style={{ minHeight: '300px' }}>
                        <MdPreview modelValue={record?.noticeContent || ''} />
                    </div>
                    {record?.remark && (
                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px dashed #e8e8e8', color: '#8c8c8c' }}>
                            备注：{record.remark}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <ProFormText label={'公告标题'}
                        name="noticeTitle"
                        placeholder={'请输入公告标题'}
                        colProps={{ span: 24 }}
                        rules={[{ required: true, message: '公告标题不能为空' }]}
                    />
                    <ProFormRadio.Group label={'公告类型'} name="noticeType"
                        colProps={{ span: 12 }}
                        options={[
                            { label: '通知', value: '1' },
                            { label: '公告', value: '2' }
                        ]}
                        rules={[{ required: true, message: '请选择公告类型' }]}
                    />
                    <ProFormRadio.Group label={'状态'} name="status"
                        colProps={{ span: 12 }}
                        options={[
                            { label: '正常', value: DataItemStatus.ENABLE },
                            { label: '停用', value: DataItemStatus.DISABLE }
                        ]}
                        rules={[{ required: true, message: '请选择状态' }]}
                    />

                    <ProForm.Item
                        label="公告内容 (Markdown)"
                        name="noticeContent"
                        colProps={{ span: 24 }}
                        rules={[{ required: true, message: '公告内容不能为空' }]}
                        required
                    >
                        <MdEditor
                            modelValue={formInstance?.getFieldValue('noticeContent')}
                            onChange={(val) => formInstance?.setFieldsValue({ noticeContent: val })}
                            style={{ height: '450px', width: 960, overflow: 'hidden' }}
                            toolbars={[
                                'bold', 'underline', 'italic', '-', 'title', 'strikeThrough', 'quote', 'unorderedList', 'orderedList', 'task', '-',
                                'codeRow', 'code', 'link', 'image', 'table', 'mermaid', '-',
                                'revoke', 'next', '=', 'pageFullscreen', 'fullscreen', 'preview', 'catalog'
                            ]}
                        />
                    </ProForm.Item>

                    <ProFormTextArea label={'备注'}
                        name="remark"
                        colProps={{ span: 24 }}
                        placeholder={'请输入备注信息'}
                        // 对 fieldProps 使用 as any 避开 v6 环境下的 TextArea 属性校验冲突
                        fieldProps={{ autoSize: { minRows: 2, maxRows: 3 } } as any}
                    />
                </>
            )}

            <style>{`
                .md-editor-rt-content {
                    font-size: 14px;
                }
                .md-preview-wrapper .md-editor-preview {
                    padding: 0;
                }
            `}</style>
        </ProModalForm>
    )
}

export default NoticeDetailDialog;
