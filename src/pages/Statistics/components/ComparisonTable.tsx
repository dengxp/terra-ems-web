import React from 'react';
import { Table, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { ComparisonAnalysis } from '@/apis/statistics';

interface ComparisonTableProps {
    data: ComparisonAnalysis[];
    type: 'yoy' | 'mom';
    loading?: boolean;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({
    data,
    type,
    loading = false,
}) => {
    const getChangeTag = (rate: number) => {
        if (rate > 0) {
            return (
                <Tag color="error" icon={<ArrowUpOutlined />}>
                    +{rate.toFixed(2)}%
                </Tag>
            );
        }
        if (rate < 0) {
            return (
                <Tag color="success" icon={<ArrowDownOutlined />}>
                    {rate.toFixed(2)}%
                </Tag>
            );
        }
        return (
            <Tag icon={<MinusOutlined />}>
                0%
            </Tag>
        );
    };

    const columns: ColumnsType<ComparisonAnalysis> = [
        {
            title: '用能单元',
            dataIndex: 'energyUnitName',
            key: 'energyUnitName',
            width: 150,
        },
        {
            title: '当期值',
            dataIndex: 'currentValue',
            key: 'currentValue',
            width: 120,
            align: 'right',
            render: (val, record) => `${val?.toFixed(2)} ${record.unit}`,
        },
        {
            title: type === 'yoy' ? '同期值' : '上期值',
            dataIndex: 'comparisonValue',
            key: 'comparisonValue',
            width: 120,
            align: 'right',
            render: (val, record) => `${val?.toFixed(2)} ${record.unit}`,
        },
        {
            title: '差值',
            dataIndex: 'difference',
            key: 'difference',
            width: 120,
            align: 'right',
            render: (val, record) => {
                const color = val > 0 ? '#cf1322' : val < 0 ? '#3f8600' : 'inherit';
                return (
                    <span style={{ color }}>
                        {val > 0 ? '+' : ''}{val?.toFixed(2)} {record.unit}
                    </span>
                );
            },
        },
        {
            title: type === 'yoy' ? '同比' : '环比',
            dataIndex: 'changeRate',
            key: 'changeRate',
            width: 100,
            align: 'center',
            render: (val) => getChangeTag(val || 0),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={data}
            rowKey="energyUnitId"
            loading={loading}
            pagination={false}
            size="small"
        />
    );
};

export default ComparisonTable;
