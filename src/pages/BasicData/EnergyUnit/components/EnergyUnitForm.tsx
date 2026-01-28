import React from 'react';
import {
    ProFormText,
    ProFormDigit,
    ProFormRadio,
    ProFormTextArea,
    ProFormSelect,
    ProFormDependency,
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
                destroyOnHidden: true,
                width: 800,
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
