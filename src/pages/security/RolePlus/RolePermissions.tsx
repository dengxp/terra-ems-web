import React, { useEffect, useState } from 'react';
import { Button, message, Typography, Space, Divider, Skeleton, Checkbox } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useParams, history } from '@umijs/max';
import { ProPageContainer } from '@/components/container';
import { findRoleById, getRolePermissions, updateRolePermissions } from '@/apis/role';
import { findModuleTree } from '@/apis/module';
import ModulePermission from './ModulePermission';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const { Title } = Typography;

const RolePermissions = () => {
    const { roleId: roleIdStr } = useParams<{ roleId: string }>();
    const roleId = parseInt(roleIdStr || '');

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [roleName, setRoleName] = useState('');
    const [moduleList, setModuleList] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roleRes, permRes, treeRes] = await Promise.all([
                findRoleById(roleId),
                getRolePermissions(roleId),
                findModuleTree()
            ]);

            if (roleRes.success && roleRes.data) {
                setRoleName(roleRes.data.name || '');
            }

            const checkedIds = permRes.success ? permRes.data || [] : [];

            if (treeRes.success && treeRes.data) {
                // 将树形结构平铺并注入勾选状态
                const transformed = treeRes.data.map((mod: any) => {
                    const modPerms = mod.permissions?.map((p: any) => ({
                        ...p,
                        checked: checkedIds.includes(p.id)
                    })) || [];

                    const checkedCount = modPerms.filter((p: any) => p.checked).length;

                    return {
                        ...mod,
                        permissions: modPerms,
                        checked: modPerms.length > 0 && checkedCount === modPerms.length,
                        indeterminate: checkedCount > 0 && checkedCount < modPerms.length
                    };
                });
                setModuleList(transformed);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (roleId) {
            fetchData();
        }
    }, [roleId]);

    const onModuleChange = (e: CheckboxChangeEvent, mod: any) => {
        const isChecked = e.target.checked;
        const updatedList = moduleList.map(m => {
            if (m.id === mod.id) {
                const updatedPerms = m.permissions?.map((p: any) => ({ ...p, checked: isChecked })) || [];
                return {
                    ...m,
                    permissions: updatedPerms,
                    checked: isChecked,
                    indeterminate: false
                };
            }
            return m;
        });
        setModuleList(updatedList);
    };

    const onPermissionChange = (e: CheckboxChangeEvent, mod: any, permission: any) => {
        const isChecked = e.target.checked;
        const updatedList = moduleList.map(m => {
            if (m.id === mod.id) {
                const updatedPerms = m.permissions?.map((p: any) =>
                    p.id === permission.id ? { ...p, checked: isChecked } : p
                ) || [];
                const checkedCount = updatedPerms.filter((p: any) => p.checked).length;
                return {
                    ...m,
                    permissions: updatedPerms,
                    checked: updatedPerms.length > 0 && checkedCount === updatedPerms.length,
                    indeterminate: checkedCount > 0 && checkedCount < updatedPerms.length
                };
            }
            return m;
        });
        setModuleList(updatedList);
    };

    const totalPermissions = moduleList.reduce((acc, m) => acc + (m.permissions?.length || 0), 0);
    const checkedPermissions = moduleList.reduce((acc, m) => acc + (m.permissions?.filter((p: any) => p.checked).length || 0), 0);

    const isAllChecked = totalPermissions > 0 && checkedPermissions === totalPermissions;
    const isIndeterminate = checkedPermissions > 0 && checkedPermissions < totalPermissions;

    const onSelectAllChange = (e: CheckboxChangeEvent) => {
        const isChecked = e.target.checked;
        const updatedList = moduleList.map(m => {
            const updatedPerms = m.permissions?.map((p: any) => ({ ...p, checked: isChecked })) || [];
            return {
                ...m,
                permissions: updatedPerms,
                checked: isChecked,
                indeterminate: false
            };
        });
        setModuleList(updatedList);
    };

    const handleSave = async () => {
        const permissionIds = moduleList.flatMap(m =>
            m.permissions?.filter((p: any) => p.checked).map((p: any) => p.id) || []
        );

        setSaving(true);
        try {
            await updateRolePermissions(roleId, permissionIds);
            void message.success('权限配置已保存');
            history.back();
        } catch (error) {
            // Error handled by interceptor
        } finally {
            setSaving(false);
        }
    };

    if (!roleId || isNaN(roleId)) {
        history.replace('/404');
        return null;
    }

    return (
        <ProPageContainer className={'pt-1'}>
            <div className={'bg-white h-[calc(100vh-160px)] flex flex-col'}>
                <div className={'flex justify-between items-center border-b mb-4 pt-4 px-4'}>
                    <Title level={5} style={{ margin: 0, paddingBottom: 8 }}>
                        {`角色权限配置 (Plus) - ${roleName || '加载中...'}`}
                    </Title>
                    <Checkbox
                        className={'font-bold !text-base pb-2'}
                        checked={isAllChecked}
                        indeterminate={isIndeterminate}
                        onChange={onSelectAllChange}
                    >
                        全选
                    </Checkbox>
                </div>

                <div className={'px-4 flex-1 overflow-y-auto'}>
                    <Skeleton active loading={loading} paragraph={{ rows: 10 }}>
                        {moduleList.map(mod => (
                            <ModulePermission
                                key={mod.id}
                                mod={mod}
                                onModuleChange={onModuleChange}
                                onPermissionChange={onPermissionChange}
                            />
                        ))}
                    </Skeleton>
                </div>

                <Divider className={'mt-4 mb-0'} />
                <div className="mt-4 px-4 pb-4">
                    <Space size={8}>
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            loading={saving}
                            onClick={handleSave}
                        >
                            保存配置
                        </Button>
                        <Button
                            onClick={() => history.back()}
                        >
                            取消
                        </Button>
                        <Button
                            type="primary"
                            variant="outlined"
                            color="primary"
                            className={'ml-2'}
                            onClick={() => history.push(`/security/role-plus/members/${roleId}`)}
                        >
                            成员列表
                        </Button>
                    </Space>
                </div>
            </div>
        </ProPageContainer>
    );
};

export default RolePermissions;
