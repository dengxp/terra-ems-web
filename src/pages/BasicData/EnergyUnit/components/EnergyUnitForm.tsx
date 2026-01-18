import React from 'react';
import {
    ProFormText,
    ProFormDigit,
    ProFormRadio,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { EnergyUnit } from '@/apis/energyUnit';
import { ProModalForm } from "@/components/container";
import useCrud from "@/hooks/common/useCrud";

interface EnergyUnitFormProps {
    visible: boolean;
    onOpenChange: (visible: boolean) => void;
    onSuccess: () => void;
    record?: EnergyUnit;
}

const EnergyUnitForm: React.FC<EnergyUnitFormProps> = ({
    visible,
    onOpenChange,
    onSuccess,
    record,
}) => {
    const { handleSaveOrUpdate } = useCrud<EnergyUnit>({
        pathname: '/basic-data/energy-unit',
        baseUrl: '/api/energy-units',
    });

    return (
        <ProModalForm
            title={record?.id ? '编辑用能单元' : '新增用能单元'}
            open={visible}
            onOpenChange={onOpenChange}
            initialValues={{ status: 0, sortOrder: 0, ...record }}
            onFinish={async (values) => {
                await handleSaveOrUpdate(values);
                onSuccess();
                return true;
            }}
            width={500}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            modalProps={{
                destroyOnClose: true,
            }}
        >
            <ProFormText name="id" hidden />
            <ProFormText name="parentId" hidden />
            <ProFormText
                name="code"
                label="编码"
                placeholder="请输入编码"
                rules={[
                    { required: true, message: '请输入编码' },
                    { max: 50, message: '编码最多50个字符' },
                ]}
            />
            <ProFormText
                name="name"
                label="名称"
                placeholder="请输入名称"
                rules={[
                    { required: true, message: '请输入名称' },
                    { max: 100, message: '名称最多100个字符' },
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
                fieldProps={{ rows: 3 }}
            />
        </ProModalForm>
    );
};

export default EnergyUnitForm;
