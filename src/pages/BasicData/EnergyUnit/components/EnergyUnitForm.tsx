import { EnergyUnit } from '@/apis/energyUnit';
import { ProModalForm } from "@/components/container";
import { OperationEnum } from '@/enums';
import useCrud from "@/hooks/common/useCrud";
import {
  ProFormDependency, ProFormDigit,
  ProFormRadio, ProFormSelect, ProFormText, ProFormTextArea
} from '@ant-design/pro-components';
import React, { useEffect } from 'react';

interface EnergyUnitFormProps {
    visible: boolean;
    onOpenChange: (visible: boolean) => void;
    onSuccess: () => void;
}

const EnergyUnitForm: React.FC<EnergyUnitFormProps> = ({
    visible,
    onOpenChange,
    onSuccess,
}) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<EnergyUnit>({
        pathname: '/basic-data/energy-unit',
        entityName: '用能单元',
        baseUrl: '/api/energy-units',
        onOpenChange: onOpenChange,
    });

    const state = getState('/basic-data/energy-unit');

    useEffect(() => {
        if (visible) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({ ...state.editData });
            } else {
                form.resetFields();
                form.setFieldsValue({
                    status: 0,
                    sortOrder: 0,
                    parentId: state.editData?.parentId
                });
            }
        }
    }, [visible, state.operation, state.editData, form]);

    return (
        <ProModalForm
            title={state?.dialogTitle}
            open={visible}
            onOpenChange={onOpenChange}
            form={form}
            onFinish={async (values) => {
                await handleSaveOrUpdate(values);
                onSuccess();
                return true;
            }}
            width={700}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 16 }}
            modalProps={{
                destroyOnHidden: true,
                maskClosable: false,
            }}
            loading={state.loading}
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
            <ProFormSelect
                name="unitType"
                label="类型"
                placeholder="请选择类型"
                rules={[{ required: true, message: '请选择类型' }]}
                options={[
                    { label: '普通单元', value: 'GENERAL' },
                    { label: '电力支路', value: 'BRANCH' },
                    { label: '工序', value: 'PROCESS' },
                    { label: '设备', value: 'EQUIPMENT' },
                ]}
                initialValue="GENERAL"
            />
            <ProFormDependency name={['unitType']}>
                {({ unitType }) => {
                    if (unitType === 'BRANCH') {
                        return (
                            <>
                                <ProFormText
                                    name="voltageLevel"
                                    label="电压等级"
                                    placeholder="请输入电压等级"
                                />
                                <ProFormDigit
                                    name="ratedCurrent"
                                    label="额定电流"
                                    placeholder="请输入额定电流(A)"
                                    fieldProps={{ precision: 2 }}
                                />
                                <ProFormDigit
                                    name="ratedPower"
                                    label="额定功率"
                                    placeholder="请输入额定功率(kW)"
                                    fieldProps={{ precision: 2 }}
                                />
                            </>
                        );
                    }
                    return null;
                }}
            </ProFormDependency>
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
