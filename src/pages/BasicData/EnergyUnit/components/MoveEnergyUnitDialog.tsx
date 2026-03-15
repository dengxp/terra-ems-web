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

import { EnergyUnit, moveEnergyUnit } from "@/apis/energyUnit";
import { ProModalForm } from "@/components/container";
import { ProModalFormProps } from "@/components/container/ProModalForm";
import useCrud from "@/hooks/common/useCrud";
import { ProFormText, ProFormTreeSelect } from "@ant-design/pro-components";
import { message, TreeDataNode } from "antd";
import { useMemo } from 'react';

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
