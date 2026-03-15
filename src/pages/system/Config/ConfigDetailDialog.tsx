/*
 * Copyright (c) 2025-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2025-2026 泰若科技（广州）有限公司.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

import { SysConfig } from "@/apis/system/config";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { OperationEnum } from "@/enums";
import useCrud from "@/hooks/common/useCrud";
import { ProFormRadio, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useEffect } from 'react';

type Props = ProModalFormProps;

const defaultValue = {
    configName: '',
    configKey: '',
    configValue: '',
    configType: 'N',
    remark: ''
}

const ConfigDetailDialog = (props: Props) => {
    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<SysConfig>({
        pathname: '/system/config',
        entityName: '参数配置',
        baseUrl: '/api/system/config',
        onOpenChange: props.onOpenChange
    });

    const state = getState('/system/config');

    const onFinish = async (values: Record<string, any>) => {
        const data = values.id ? { ...state.editData, ...values } : { ...values };
        await handleSaveOrUpdate(data);
    }

    useEffect(() => {
        if (props.open) {
            if (state.operation === OperationEnum.EDIT) {
                form.setFieldsValue({ ...state.editData });
            } else {
                form.setFieldsValue({ ...defaultValue });
            }
        }
    }, [props.open, state.operation]);

    return (
        <ProModalForm {...props}
            title={state.dialogTitle}
            width={600}
            form={form}
            labelCol={{ span: 5 }}
            loading={state.loading} onFinish={onFinish}>
            <ProFormText label={'ID'}
                name={'id'}
                hidden={true} />
            <ProFormText label={'参数名称'}
                name={'configName'}
                placeholder={'请输入参数名称'}
                rules={[
                    {
                        required: true,
                        message: '参数名称不能为空'
                    }
                ]} />
            <ProFormText label={'参数键名'}
                name={'configKey'}
                placeholder={'请输入参数键名'}
                rules={[
                    {
                        required: true,
                        message: '参数键名不能为空'
                    }
                ]} />
            <ProFormTextArea label={'参数键值'}
                name={'configValue'}
                placeholder={'请输入参数键值'}
                rules={[
                    {
                        required: true,
                        message: '参数键值不能为空'
                    }
                ]} />
            <ProFormRadio.Group label={'系统内置'} name={'configType'}
                options={[
                    { label: '是', value: 'Y' },
                    { label: '否', value: 'N' }
                ]}
                rules={[
                    { required: true, message: '请选择是否系统内置' }
                ]}
            />
            <ProFormTextArea label={'备注'}
                name={'remark'}
                placeholder={'请输入备注信息'}
            />
        </ProModalForm>
    )
}

export default ConfigDetailDialog;
