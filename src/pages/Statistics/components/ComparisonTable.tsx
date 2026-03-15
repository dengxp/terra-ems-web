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

import { ComparisonAnalysis } from '@/apis/statistics';
import { ArrowDownOutlined, ArrowUpOutlined, MinusOutlined } from '@ant-design/icons';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

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
