import React from 'react';
import { message, ColorPicker, Form, Col } from 'antd';
import type { Color } from 'antd/es/color-picker';
import {
    ProFormText,
    ProFormSelect,
    ProFormDigit,
    ProFormSwitch,
    ProFormTextArea,
    ProFormRadio,
} from '@ant-design/pro-components';
import { ProModalForm } from '@/components/container';
import {
    EnergyType,
    EnergyCategory,
    EnergyCategoryLabel,
    createEnergyType,
    updateEnergyType,
} from '@/apis/energyType';

interface EnergyTypeFormProps {
    visible: boolean;
    record?: EnergyType;
    onCancel: () => void;
    onSuccess: () => void;
}

/**
 * 能源类型新增/编辑表单
 */
const EnergyTypeForm: React.FC<EnergyTypeFormProps> = ({
    visible,
    record,
    onCancel,
    onSuccess,
}) => {
    const isEdit = !!record;

    const onFinish = async (values: any) => {
        try {
            // 统一使用 saveOrUpdate (POST)，编辑时携带 id 并合并旧数据
            const payload = isEdit ? { ...record, ...values, id: record!.id } : values;
            await createEnergyType(payload);
            message.success(isEdit ? '更新成功' : '创建成功');
            onSuccess();
            return true;
        } catch (error: any) {
            // 全局错误处理已显示错误消息，此处仅返回 false 阻止表单关闭
            return false;
        }
    };

    return (
        <ProModalForm
            title={isEdit ? '编辑能源类型' : '新增能源类型'}
            open={visible}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
            onFinish={onFinish}
            grid={true}
            rowProps={{
                gutter: 0,
            }}
            labelCol={{ span: 6 }}
            initialValues={record || {
                storable: false,
                sortOrder: 0,
                status: 0,
            }}
            modalProps={{
                destroyOnHidden: true,
                width: 800,
            }}
        >
            <ProFormText
                name="code"
                label="编码"
                colProps={{ span: 12 }}
                placeholder="如：ELECTRIC、NATURAL_GAS"
                disabled={isEdit}
                rules={[
                    { required: true, message: '请输入编码' },
                    { pattern: /^[A-Z_]+$/, message: '编码只能包含大写字母和下划线' },
                ]}
            />

            <ProFormText
                name="name"
                label="名称"
                colProps={{ span: 12 }}
                placeholder="如：电力、天然气"
                rules={[{ required: true, message: '请输入名称' }]}
            />

            <ProFormText
                name="unit"
                label="计量单位"
                colProps={{ span: 12 }}
                placeholder="如：kWh、m³、t"
                rules={[{ required: true, message: '请输入计量单位' }]}
            />

            <ProFormSelect
                name="category"
                label="类别"
                colProps={{ span: 12 }}
                options={Object.values(EnergyCategory).map((value) => ({
                    label: EnergyCategoryLabel[value],
                    value,
                }))}
                placeholder="请选择类别"
            />

            <ProFormDigit
                name="coefficient"
                label="折标系数"
                colProps={{ span: 12 }}
                fieldProps={{
                    min: 0,
                    step: 0.0001,
                    precision: 4,
                    addonAfter: 'kgce/单位',
                    style: { width: '100%' },
                }}
            />

            <ProFormDigit
                name="emissionFactor"
                label="碳排放因子"
                colProps={{ span: 12 }}
                fieldProps={{
                    min: 0,
                    step: 0.0001,
                    precision: 4,
                    addonAfter: 'kgCO2/单位',
                    style: { width: '100%' },
                }}
            />

            <ProFormDigit
                name="defaultPrice"
                label="默认单价"
                colProps={{ span: 12 }}
                fieldProps={{
                    min: 0,
                    step: 0.01,
                    precision: 4,
                    prefix: '¥',
                    style: { width: '100%' },
                }}
            />

            <Col span={12}>
                <Form.Item
                    name="color"
                    label="展示颜色"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    getValueFromEvent={(color: Color) => color?.toHexString()}
                    getValueProps={(value: string) => ({ value: value || undefined })}
                >
                    <ColorPicker
                        showText
                        allowClear
                        presets={[
                            {
                                label: '推荐颜色',
                                colors: [
                                    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
                                    '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#2f54eb',
                                ],
                            },
                        ]}
                    />
                </Form.Item>
            </Col>

            <ProFormDigit
                name="sortOrder"
                label="排序"
                colProps={{ span: 12 }}
                fieldProps={{
                    min: 0,
                    style: { width: '100%' },
                }}
            />

            <ProFormSwitch
                name="storable"
                label="是否可存储"
                colProps={{ span: 12 }}
            />

            <ProFormRadio.Group
                name="status"
                label="状态"
                colProps={{ span: 12 }}
                options={[
                    { label: '启用', value: 0 },
                    { label: '停用', value: 1 },
                ]}
            />

            <ProFormTextArea
                name="remark"
                label="备注"
                placeholder="备注信息"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
                fieldProps={{
                    rows: 2,
                }}
            />
        </ProModalForm>
    );
};

export default EnergyTypeForm;
