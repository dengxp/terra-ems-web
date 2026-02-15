import { logApi, SysLog } from "@/apis/system/log";
import { ProPageContainer } from "@/components/container";
import LogDetailDialog from "@/pages/monitor/Log/LogDetailDialog";
import { EyeOutlined } from "@ant-design/icons";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import { Button } from "antd";
import { useRef, useState } from 'react';

const Index = () => {
    const actionRef = useRef<ActionType>();
    const [params] = useState<Record<string, any>>({});
    const [showDetail, setShowDetail] = useState<boolean>(false);
    const [currentRow, setCurrentRow] = useState<SysLog>();

    const columns: ProColumns<SysLog>[] = [
        {
            title: '日志ID',
            dataIndex: 'id',
            key: 'id',
            hideInSearch: true,
            hideInTable: true,
        },
        {
            title: '模块标题',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: '业务类型',
            dataIndex: 'businessType',
            key: 'businessType',
            valueType: 'select',
            valueEnum: {
                0: { text: '其它', status: 'Default' },
                1: { text: '新增', status: 'Success' },
                2: { text: '修改', status: 'Warning' },
                3: { text: '删除', status: 'Error' },
            },
        },
        {
            title: '请求方式',
            dataIndex: 'requestMethod',
            key: 'requestMethod',
            hideInSearch: true,
        },
        {
            title: '操作人员',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: '操作地址',
            dataIndex: 'ip',
            key: 'ip',
            hideInSearch: true,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            valueType: 'select',
            valueEnum: {
                0: { text: '正常', status: 'Success' },
                1: { text: '异常', status: 'Error' },
            },
        },
        {
            title: '消耗时间',
            dataIndex: 'costTime',
            key: 'costTime',
            hideInSearch: true,
            render: (_, record) => `${record.costTime}ms`,
        },
        {
            title: '操作时间',
            dataIndex: 'createdAt',
            key: 'createdAt',
            valueType: 'dateTime',
            hideInSearch: true,
        },
        {
            title: '操作',
            dataIndex: 'option',
            valueType: 'option',
            render: (_, record) => [
                <Button
                    key="detail"
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                        setCurrentRow(record);
                        setShowDetail(true);
                    }}
                >
                    详情
                </Button>,
            ],
        },
    ];

    return (
        <ProPageContainer className={'pt-1'}>
            <ProTable<SysLog>
                headerTitle="操作日志"
                actionRef={actionRef}
                rowKey="id"
                search={{
                    labelWidth: 120,
                }}
                request={async (params) => {
                    const { current, pageSize, ...rest } = params;
                    const res = await logApi.findByPage({
                        current,
                        pageSize,
                        ...rest
                    });
                    return {
                        data: res.data.list,
                        success: res.success,
                        total: res.data.total
                    };
                }}
                columns={columns}
                params={params}
                cardProps={{ variant: 'borderless' } as any}
            />
            <LogDetailDialog
                open={showDetail}
                onClose={() => {
                    setCurrentRow(undefined);
                    setShowDetail(false);
                }}
                currentRow={currentRow}
            />
        </ProPageContainer>
    );
};

export default Index;
