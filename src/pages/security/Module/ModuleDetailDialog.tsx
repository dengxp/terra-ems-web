/*
 * Copyright (c) 2024-2026 Terra Technology (Guangzhou) Co., Ltd.
 * Copyright (c) 2024-2026 泰若科技（广州）有限公司.
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

import { saveOrUpdateModule } from "@/apis/module";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormDigit, ProFormText } from "@ant-design/pro-components";
import { useEffect } from 'react';

type Props = ProModalFormProps;

const ModuleDetailDialog = (props: Props) => {
    const {
        open,
        onOpenChange,
    } = props;

    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<SysModule>({
        pathname: '/security/module',
        entityName: '模块',
        baseUrl: '/api/system/module'
    });

    const state = getState('/security/module');
    const record = state.editData as SysModule | null;

    const handleFinish = async (values: Record<string, any>) => {
        await handleSaveOrUpdate(values);
    }

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({ ...record });
            } else {
                form.resetFields();
            }
        }
    }, [open, record, form]);

    return (
        <ProModalForm {...props}
            title={state.dialogTitle}
            form={form}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 18 }}
            width={500}
            modalProps={{
                destroyOnClose: true,
                centered: true
            }}
            loading={state.loading} onFinish={handleFinish}>
            <ProFormText label={'ID'}
                name={'id'}
                hidden={true} />
            <ProFormText label={'模块名称'}
                name={'name'}
                placeholder={'请输入模块名称'}
                rules={[
                    {
                        required: true,
                        message: '模块名称不能为空'
                    }
                ]} />
            <ProFormText name={'code'}
                label={'模块代码'}
                placeholder={'请输入模块代码'}
                rules={[
                    {
                        required: true,
                        message: '模块代码不能为空'
                    }
                ]}
            />
            <ProFormDigit label={'显示顺序'}
                name={'sortOrder'}
                min={0}
                max={1000}
                fieldProps={{ precision: 0 }}
                initialValue={0}
                placeholder={'请输入显示顺序'}
                rules={[
                    {
                        required: true,
                        message: '显示顺序不能为空'
                    },
                ]}
            />
        </ProModalForm>
    )
}

export default ModuleDetailDialog;
