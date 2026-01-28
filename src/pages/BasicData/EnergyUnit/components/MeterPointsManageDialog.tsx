import React, { useEffect, useState } from 'react';
import { Modal, Transfer, message, Spin, Tag, Alert } from 'antd';
import type { TransferProps } from 'antd';
import { getMeterPointPage, MeterPoint } from '@/apis/meterPoint';
import { EnergyUnit } from '@/apis/energyUnit';
import { request } from '@umijs/max';

interface MeterPointsManageDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    energyUnit: EnergyUnit;
    currentPoints: MeterPoint[];
    onSuccess: () => void;
}

interface TransferItem {
    key: string;
    title: string;
    description: string;
    energyType?: string;
}

/**
 * 为用能单元批量更新关联的采集点位
 * 注意：这个接口会遍历所有相关点位，分别更新它们的关联
 */
async function updateEnergyUnitMeterPoints(
    energyUnitId: number,
    meterPointIds: number[],
    originalPointIds: number[]
) {
    // 计算需要添加和移除的点位
    const toAdd = meterPointIds.filter((id) => !originalPointIds.includes(id));
    const toRemove = originalPointIds.filter((id) => !meterPointIds.includes(id));

    // 对于需要添加关联的点位
    for (const pointId of toAdd) {
        // 获取该点位当前关联的用能单元
        const res = await request<API.Result<MeterPoint>>(`/api/meter-points/${pointId}`, {
            method: 'GET',
        });
        if (res.success && res.data) {
            const currentUnitIds = res.data.energyUnits?.map((u) => u.id) || [];
            // 添加当前用能单元
            if (!currentUnitIds.includes(energyUnitId)) {
                await request(`/api/meter-points/${pointId}/energy-units`, {
                    method: 'POST',
                    data: [...currentUnitIds, energyUnitId],
                });
            }
        }
    }

    // 对于需要解除关联的点位
    for (const pointId of toRemove) {
        const res = await request<API.Result<MeterPoint>>(`/api/meter-points/${pointId}`, {
            method: 'GET',
        });
        if (res.success && res.data) {
            const currentUnitIds = res.data.energyUnits?.map((u) => u.id) || [];
            // 移除当前用能单元
            const newUnitIds = currentUnitIds.filter((id) => id !== energyUnitId);
            await request(`/api/meter-points/${pointId}/energy-units`, {
                method: 'POST',
                data: newUnitIds,
            });
        }
    }
}

/**
 * 采集点位管理对话框
 * 使用穿梭框批量管理用能单元关联的采集点位
 */
const MeterPointsManageDialog: React.FC<MeterPointsManageDialogProps> = ({
    open,
    onOpenChange,
    energyUnit,
    currentPoints,
    onSuccess,
}) => {
    const [allPoints, setAllPoints] = useState<TransferItem[]>([]);
    const [targetKeys, setTargetKeys] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // 加载所有采集点位
    useEffect(() => {
        if (open) {
            setLoading(true);
            getMeterPointPage({ pageNumber: 0, pageSize: 1000 })
                .then((res) => {
                    if (res.success && res.data?.content) {
                        const items = res.data.content.map((point: MeterPoint) => ({
                            key: String(point.id),
                            title: point.name,
                            description: point.code,
                            energyType: point.energyType?.name,
                        }));
                        setAllPoints(items);
                    }
                })
                .finally(() => setLoading(false));

            // 设置已选中的点位
            setTargetKeys(currentPoints.map((p) => String(p.id)));
        }
    }, [open, currentPoints]);

    const handleChange: TransferProps['onChange'] = (newTargetKeys) => {
        setTargetKeys(newTargetKeys as string[]);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const selectedIds = targetKeys.map((k) => Number(k));
            const originalIds = currentPoints.map((p) => p.id);

            await updateEnergyUnitMeterPoints(energyUnit.id, selectedIds, originalIds);

            message.success('关联更新成功');
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            message.error('操作失败');
        } finally {
            setSubmitting(false);
        }
    };

    const filterOption = (inputValue: string, option: TransferItem) =>
        option.title.toLowerCase().includes(inputValue.toLowerCase()) ||
        option.description.toLowerCase().includes(inputValue.toLowerCase());

    return (
        <Modal
            title={`管理采集点位 - ${energyUnit.name}`}
            open={open}
            onCancel={() => onOpenChange(false)}
            onOk={handleSubmit}
            okText="保存"
            cancelText="取消"
            confirmLoading={submitting}
            width={700}
            destroyOnHidden
        >
            <Alert
                message="选择要关联到此用能单元的采集点位"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <Spin spinning={loading}>
                <Transfer
                    dataSource={allPoints}
                    showSearch
                    filterOption={filterOption}
                    targetKeys={targetKeys}
                    onChange={handleChange}
                    render={(item) => (
                        <span>
                            {item.energyType && (
                                <Tag color="blue" style={{ marginRight: 4 }}>
                                    {item.energyType}
                                </Tag>
                            )}
                            {item.title}
                            <span style={{ color: '#999', marginLeft: 4 }}>
                                ({item.description})
                            </span>
                        </span>
                    )}
                    titles={['可选点位', '已关联']}
                    listStyle={{
                        width: 300,
                        height: 400,
                    }}
                    locale={{
                        itemUnit: '项',
                        itemsUnit: '项',
                        searchPlaceholder: '搜索点位',
                    }}
                />
            </Spin>
        </Modal>
    );
};

export default MeterPointsManageDialog;
