import React, { useEffect } from 'react';
import { ModalForm, ProFormText, ProFormTextArea, ProFormRadio, ProFormDigit, ProFormSelect } from '@ant-design/pro-components';
import { Space, Badge } from 'antd';
import useCrud from '@/hooks/common/useCrud';
import { SysDictData } from '@/apis/system/dict';

interface DictDataFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    typeCode: string;
}

const DictDataForm: React.FC<DictDataFormProps> = ({ open, onOpenChange, typeCode }) => {
    const pathname = `/system/dict/data/${typeCode}`;

    const {
        form,
        getState,
        handleSaveOrUpdate,
    } = useCrud<SysDictData>({
        entityName: '字典项',
        pathname,
        baseUrl: '/api/system/dict/data',
        onOpenChange,
    });

    const state = getState(pathname);

    useEffect(() => {
        if (open) {
            if (state.editData) {
                form.setFieldsValue({ ...state.editData });
            } else {
                form.resetFields();
            }
        }
    }, [open, state.editData, form]);

    const onFinish = async (values: any) => {
        await handleSaveOrUpdate({ ...values, typeCode });
    };

    return (
        <ModalForm
            title={state.dialogTitle}
            open={open}
            onOpenChange={onOpenChange}
            form={form}
            modalProps={{ destroyOnClose: true, width: 520 }}
            onFinish={onFinish}
            layout="horizontal"
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 19 }}
        >
            <ProFormText
                name="label"
                label="字典标签"
                placeholder="请输入字典标签"
                rules={[{ required: true, message: '请输入字典标签' }]}
            />
            <ProFormText name="id" hidden />
            <ProFormText
                name="value"
                label="字典键值"
                placeholder="请输入字典键值"
                rules={[{ required: true, message: '请输入字典键值' }]}
            />
            <ProFormDigit
                name="sortOrder"
                label="排序"
                placeholder="请输入排序"
                initialValue={0}
                fieldProps={{ precision: 0 }}
            />
            <ProFormSelect
                name="tagColor"
                label="标签颜色"
                placeholder="请选择标签颜色"
                options={[
                    { label: <Space><Badge color="blue" />蓝色</Space>, value: 'blue' },
                    { label: <Space><Badge color="green" />绿色</Space>, value: 'green' },
                    { label: <Space><Badge color="red" />红色</Space>, value: 'red' },
                    { label: <Space><Badge color="orange" />橙色</Space>, value: 'orange' },
                    { label: <Space><Badge color="purple" />紫色</Space>, value: 'purple' },
                    { label: <Space><Badge color="cyan" />青色</Space>, value: 'cyan' },
                    { label: <Space><Badge color="gold" />金色</Space>, value: 'gold' },
                    { label: <Space><Badge color="magenta" />品红</Space>, value: 'magenta' },
                    { label: <Space><Badge color="lime" />青柠</Space>, value: 'lime' },
                    { label: <Space><Badge color="volcano" />火山</Space>, value: 'volcano' },
                    { label: <Space><Badge color="geekblue" />极客蓝</Space>, value: 'geekblue' },
                    { label: '无', value: '' },
                ]}
            />
            <ProFormRadio.Group
                name="status"
                label="状态"
                initialValue="0"
                options={[
                    { label: '正常', value: '0' },
                    { label: '停用', value: '1' },
                ]}
            />
            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="请输入备注"
            />
        </ModalForm>
    );
};

export default DictDataForm;
