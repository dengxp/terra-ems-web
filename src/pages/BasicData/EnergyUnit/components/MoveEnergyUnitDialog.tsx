import React, { useMemo } from 'react';
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import { ProFormText, ProFormTreeSelect } from "@ant-design/pro-components";
import { filterTree } from "@/utils/tree";
import useCrud from "@/hooks/common/useCrud";
import { moveEnergyUnit, EnergyUnit } from "@/apis/energyUnit";
import { message, TreeDataNode } from "antd";

type Props = ProModalFormProps & {
    energyUnit: EnergyUnit;
    treeData: TreeDataNode[];
    onSuccess?: () => void;
}

function MoveEnergyUnitDialog(props: Props) {
    const { energyUnit, treeData, ...rest } = props;
    const [messageApi, contextHolder] = message.useMessage();

    const {
        setShouldRefresh,
    } = useCrud<EnergyUnit>({
        pathname: '/basic-data/energy-unit',
        entityName: '用能单元',
        baseUrl: '/api/energy-units',
    });

    const onFinish = async (values: Record<string, any>) => {
        // 如果 parentId 没有变化，直接关闭
        if ((!values.parentId && !energyUnit.parentId) || values.parentId == energyUnit.parentId) {
            props.onOpenChange?.(false);
            return;
        }

        if (energyUnit.id) {
            try {
                const res = await moveEnergyUnit(energyUnit.id, values.parentId);
                if (res.success) {
                    messageApi.success(res.message || '移动成功');
                    setShouldRefresh(true);
                    props.onSuccess?.();
                    props.onOpenChange?.(false);
                } else {
                    messageApi.error(res.message || '移动失败');
                }
            } catch (error: any) {
                messageApi.error(error.message || '移动请求失败');
            }
        }
    };

    const filteredTreeData = useMemo(() => {
        if (props.open) {
            // 注意：treeData 中的节点使用的是 key 而不是 id
            const filterNodeByKey = (nodes: any[], targetKey: number): any[] => {
                return nodes
                    .filter(node => node.key !== targetKey)
                    .map(node => ({
                        ...node,
                        children: node.children ? filterNodeByKey(node.children, targetKey) : undefined
                    }));
            };

            return energyUnit.id
                ? filterNodeByKey(props.treeData, energyUnit.id)
                : props.treeData;
        }
        return [];
    }, [props.treeData, energyUnit.id, props.open]);

    return (
        <ProModalForm {...rest} title={'移动用能单元'} onFinish={onFinish} width={480}>
            {contextHolder}
            <ProFormText label={'用能单元名称'} name={'name'} readonly initialValue={energyUnit.name} />
            <ProFormTreeSelect
                label={'目标父级节点'}
                name={'parentId'}
                allowClear={true}
                placeholder={'请选择新的上级节点，不选则移动到根级别'}
                initialValue={energyUnit.parentId}
                fieldProps={{
                    showSearch: true,
                    treeNodeFilterProp: 'title',
                    treeDefaultExpandAll: true,
                    treeData: filteredTreeData,
                    fieldNames: {
                        label: 'title',
                        value: 'key',
                        children: 'children'
                    }
                }}
            />
        </ProModalForm>
    );
}

export default MoveEnergyUnitDialog;
