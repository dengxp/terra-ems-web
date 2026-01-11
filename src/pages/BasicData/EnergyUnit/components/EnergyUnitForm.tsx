import React from 'react';
import {
    ModalForm,
    ProFormText,
    ProFormDigit,
    ProFormRadio,
    ProFormTextArea,
} from '@ant-design/pro-components';
import { message } from 'antd';
import { EnergyUnit, createEnergyUnit, updateEnergyUnit } from '@/apis/energyUnit';

interface EnergyUnitFormProps {
    visible: boolean;
    onVisibleChange: (visible: boolean) => void;
    onSuccess: () => void;
    currentNode?: EnergyUnit;
    parentNode?: EnergyUnit | null;
    mode: 'add' | 'addChild' | 'edit';
}

const EnergyUnitForm: React.FC<EnergyUnitFormProps> = ({
    visible,
    onVisibleChange,
    onSuccess,
    currentNode,
    parentNode,
    mode,
}) => {
    const isEdit = mode === 'edit';
    const title = isEdit ? '编辑用能单元' : (mode === 'addChild' ? '新增子节点' : '新增根节点');
    const parentId = mode === 'addChild' ? parentNode?.id : undefined;

    return (
        <ModalForm
            title={title}
            open={visible}
            onOpenChange={onVisibleChange}
            initialValues={isEdit ? currentNode : { status: 0, sortOrder: 0 }}
            onFinish={async (values) => {
                try {
                    if (isEdit && currentNode) {
                        await updateEnergyUnit(currentNode.id, values);
                        message.success('更新成功');
                    } else {
                        await createEnergyUnit(values, parentId);
                        message.success('创建成功');
                    }
                    onSuccess();
                    return true;
                } catch (error) {
                    message.error('操作失败');
                    return false;
                }
            }}
            width={500}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            modalProps={{
                destroyOnClose: true,
            }}
        >
            {parentNode && mode === 'addChild' && (
                <ProFormText
                    name="parentName"
                    label="父节点"
                    initialValue={parentNode.name}
                    disabled
                />
            )}
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
        </ModalForm>
    );
};

export default EnergyUnitForm;
