import React, { useEffect, useMemo, useState } from 'react';
import { ProPageContainer } from '@/components/container';
import { Card, Col, Row, Tree, Button, message, Space, DatePicker, Tabs } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined, ApartmentOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import useCrud from '@/hooks/common/useCrud';
import { DeleteButton, EditButton } from '@/components/button';
import {
    ProductionRecord,
    getProductionRecords,
    batchDeleteProductionRecords,
} from '@/apis/productionRecord';
import ProductionRecordForm from './components/ProductionRecordForm';
import ModalConfirm from '@/components/ModalConfirm';
import dayjs from 'dayjs';
import { getEnabledEnergyUnitTree, EnergyUnit as EnergyUnitEntity } from '@/apis/energyUnit';

const { RangePicker } = DatePicker;

/**
 * 产品产量记录管理页面
 */
const Index: React.FC = () => {
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [selectedRows, setSelectedRows] = useState<ProductionRecord[]>([]);
    const [formVisible, setFormVisible] = useState(false);
    const [currentRecord, setCurrentRecord] = useState<ProductionRecord | undefined>();
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month'),
    ]);
    const [treeData, setTreeData] = useState<any[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);
    const [dataType, setDataType] = useState<string>('1');

    const {
        getState,
        formRef,
        actionRef,
        toDelete,
        setShouldRefresh,
    } = useCrud<ProductionRecord>({
        pathname: '/production/record',
        entityName: '产量记录',
        baseUrl: '/api/ems/production-records',
    });

    const state = getState('/production/record');

    const handleAdd = () => {
        setCurrentRecord(undefined);
        setFormVisible(true);
    };

    const handleEdit = (record: ProductionRecord) => {
        setCurrentRecord(record);
        setFormVisible(true);
    };

    const toEditSelected = () => {
        if (editDisabled) return;
        if (!selectedRows || selectedRows.length !== 1) return;
        handleEdit(selectedRows[0]);
    };

    const toDeleteBatch = () => {
        if (deleteDisabled) return;
        if (!selectedRowKeys || selectedRowKeys.length === 0) return;

        ModalConfirm({
            title: '删除产量记录',
            content: '产量记录删除后将无法恢复，请确认是否删除？',
            onOk: async () => {
                try {
                    await batchDeleteProductionRecords(selectedRowKeys as number[]);
                    message.success('删除成功');
                    setSelectedRowKeys([]);
                    setSelectedRows([]);
                    actionRef.current?.reload();
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    const handleFormSuccess = () => {
        setFormVisible(false);
        actionRef.current?.reload();
    };

    const editDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length !== 1;
    }, [selectedRowKeys]);

    const deleteDisabled = useMemo(() => {
        return !selectedRowKeys || selectedRowKeys.length === 0;
    }, [selectedRowKeys]);

    useEffect(() => {
        if (state?.shouldRefresh) {
            actionRef.current?.reload();
            setShouldRefresh(false);
        }
    }, [state?.shouldRefresh]);

    const fetchTree = async () => {
        const res = await getEnabledEnergyUnitTree();
        if (res.success) {
            const mapTree = (data: EnergyUnitEntity[]): any[] =>
                data.map((item) => ({
                    title: item.name,
                    key: item.id,
                    children: item.children && item.children.length > 0 ? mapTree(item.children) : undefined,
                }));
            const mappedData = mapTree(res.data || []);
            setTreeData(mappedData);
            if (mappedData.length > 0 && !selectedUnitId) {
                setSelectedUnitId(mappedData[0].key);
            }
        }
    };

    useEffect(() => {
        fetchTree();
    }, []);

    useEffect(() => {
        actionRef.current?.reload();
    }, [selectedUnitId, dataType]);

    const columns: ProColumns<ProductionRecord>[] = [
        {
            title: '记录日期',
            dataIndex: 'recordDate',
            key: 'recordDate',
            width: 120,
            hideInSearch: true,
        },
        {
            title: () => {
                switch (dataType) {
                    case '2': return '仪表名称';
                    case '3': return '指标名称';
                    default: return '产品名称';
                }
            },
            dataIndex: 'productName',
            key: 'productName',
            width: 150,
        },
        {
            title: () => {
                switch (dataType) {
                    case '2': return '读数';
                    case '3': return '指标值';
                    default: return '产量';
                }
            },
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            hideInSearch: true,
            render: (_, record) => `${record.quantity} ${record.unit || ''}`,
        },
        {
            title: '时间粒度',
            dataIndex: 'granularity',
            key: 'granularity',
            width: 100,
            hideInSearch: true,
            valueEnum: {
                HOUR: { text: '小时' },
                DAY: { text: '日' },
                MONTH: { text: '月' },
                YEAR: { text: '年' },
            },
        },
        {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
            width: 200,
            hideInSearch: true,
            ellipsis: true,
        },
        {
            title: '操作',
            dataIndex: 'actions',
            key: 'actions',
            width: 120,
            hideInSearch: true,
            render: (_, record) => (
                <Space>
                    <EditButton onClick={() => handleEdit(record)} />
                    <DeleteButton onClick={() => record.id && toDelete(record.id, true)} />
                </Space>
            ),
        },
    ];

    return (
        <>
            <ProPageContainer title={false} className={'pt-1'}>
                <Row gutter={12}>
                    <Col span={5}>
                        <Card
                            title={<><ApartmentOutlined /> 用能单元</>}
                            size="small"
                            style={{ height: 'calc(100vh - 180px)', overflow: 'auto' }}
                        >
                            <Tree
                                treeData={treeData}
                                onSelect={(keys) => {
                                    if (keys.length > 0) setSelectedUnitId(keys[0] as number);
                                }}
                                defaultExpandAll
                                selectedKeys={selectedUnitId ? [selectedUnitId] : []}
                            />
                        </Card>
                    </Col>
                    <Col span={19}>
                        <ProTable<ProductionRecord>
                            columns={columns}
                            rowKey="id"
                            formRef={formRef}
                            actionRef={actionRef}
                            tableAlertRender={false}
                            tableAlertOptionRender={false}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: (keys, rows) => {
                                    setSelectedRowKeys(keys);
                                    setSelectedRows(rows);
                                },
                            }}
                            form={{ span: 12 }}
                            cardProps={{ bordered: false }}
                            search={{
                                collapseRender: false,
                                defaultCollapsed: false,
                                span: 12,
                            }}
                            toolbar={{
                                title: (
                                    <Space>
                                        <Button
                                            color={'primary'}
                                            icon={<PlusOutlined />}
                                            variant={'outlined'}
                                            size={'small'}
                                            onClick={handleAdd}
                                        >
                                            新建
                                        </Button>
                                        <Button
                                            color={'green'}
                                            icon={<EditOutlined />}
                                            disabled={editDisabled}
                                            size={'small'}
                                            variant={'outlined'}
                                            onClick={toEditSelected}
                                        >
                                            修改
                                        </Button>
                                        <Button
                                            color={'danger'}
                                            icon={<DeleteOutlined />}
                                            disabled={deleteDisabled}
                                            size={'small'}
                                            variant={'outlined'}
                                            onClick={toDeleteBatch}
                                        >
                                            删除
                                        </Button>
                                    </Space>
                                ),
                                actions: [
                                    <Tabs
                                        key="dataType"
                                        activeKey={dataType}
                                        onChange={setDataType}
                                        size="small"
                                        items={[
                                            { label: '产品产量', key: '1' },
                                            { label: '仪表数据', key: '2' },
                                            { label: '能耗指标', key: '3' },
                                        ]}
                                    />,
                                    <RangePicker
                                        key="dateRange"
                                        value={dateRange}
                                        onChange={(dates) => {
                                            if (dates) {
                                                setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                                                actionRef.current?.reload();
                                            }
                                        }}
                                    />,
                                ],
                            }}
                            request={async (params) => {
                                const { current, pageSize, energyUnitId: paramsUnitId, ...rest } = params;
                                const finalUnitId = selectedUnitId || paramsUnitId || 1;
                                const res = await getProductionRecords({
                                    ...rest,
                                    energyUnitId: finalUnitId,
                                    dataType,
                                    startDate: dateRange[0].format('YYYY-MM-DD'),
                                    endDate: dateRange[1].format('YYYY-MM-DD'),
                                    pageNumber: (current || 1) - 1,
                                    pageSize: pageSize,
                                });
                                return {
                                    data: res.data?.content || [],
                                    total: res.data?.totalElements || 0,
                                    success: res.success,
                                };
                            }}
                        />
                    </Col>
                </Row>
            </ProPageContainer>

            <ProductionRecordForm
                visible={formVisible}
                record={currentRecord}
                defaultUnitId={selectedUnitId}
                defaultDataType={dataType}
                onCancel={() => setFormVisible(false)}
                onSuccess={handleFormSuccess}
            />
        </>
    );
};

export default Index;
