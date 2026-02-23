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
