import { findModuleOptions } from "@/apis/module";
import { saveOrUpdatePermission } from "@/apis/permission";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormSelect, ProFormSwitch, ProFormText, ProFormTextArea } from "@ant-design/pro-components";
import { useEffect } from 'react';

type Props = ProModalFormProps;

const PermissionDetailDialog = (props: Props) => {
    const {
        open,
        onOpenChange,
    } = props;

    const {
        form,
        handleSaveOrUpdate,
        getState
    } = useCrud<SysPermission>({
        pathname: '/security/permission',
        entityName: '权限',
        baseUrl: '/api/system/permission'
    });

    const state = getState('/security/permission');
    const record = state.editData as SysPermission | null;

    const handleFinish = async (values: Record<string, any>) => {
        // Ensure moduleId is number
        if (values.moduleId) {
            values.moduleId = Number(values.moduleId);
        }

        const data = { ...values, id: values.id || record?.id };
        await handleSaveOrUpdate(data);
    }

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({
                    ...record,
                    moduleId: record.module?.id || record.moduleId // Handle nested object or direct ID
                });
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
            width={600}
            modalProps={{
                destroyOnClose: true,
                centered: true
            }}
            loading={state.loading} onFinish={handleFinish}>
            <ProFormText label={'ID'}
                name={'id'}
                hidden={true} />

            <ProFormSelect
                name="moduleId"
                label="所属模块"
                placeholder="请选择所属模块"
                rules={[{ required: true, message: '请选择所属模块' }]}
                request={async () => {
                    const res = await findModuleOptions();
                    return res.data || [];
                }}
            />

            <ProFormText label={'权限名称'}
                name={'name'}
                placeholder={'请输入权限名称'}
                rules={[
                    {
                        required: true,
                        message: '权限名称不能为空'
                    }
                ]} />

            <ProFormText name={'code'}
                label={'权限代码'}
                placeholder={'请输入权限代码 (例如 system:user:list)'}
                tooltip={'控制器中定义的权限字符，如：@PreAuthorize("hasPerm(\'system:user:list\')")'}
                rules={[
                    {
                        required: true,
                        message: '权限代码不能为空'
                    }
                ]}
            />

            <ProFormSwitch
                name="superPermission"
                label="超级权限"
                tooltip="超级权限通常仅用于系统内部或超级管理员，普通用户无法分配"
            />

            <ProFormTextArea label={'描述'}
                name={'description'}
                placeholder={'请输入权限描述'}
            />
        </ProModalForm>
    )
}

export default PermissionDetailDialog;
