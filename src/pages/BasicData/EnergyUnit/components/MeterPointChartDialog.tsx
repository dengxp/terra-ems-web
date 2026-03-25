import { EnergyData, getMeterPointEnergyData, MeterPoint, getMeterPointsByMeterId } from '@/apis/meterPoint';
import { Column } from '@ant-design/plots';
import { Meter } from '@/apis/meter';
import { DatePicker, Modal, Radio, Space, Spin, message, Segmented, Row, Col, Statistic, Empty, Typography, Table, Select } from 'antd';
import { LineChartOutlined, DashboardOutlined, TableOutlined, BarChartOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import React, { useEffect, useState, useMemo } from 'react';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface MeterPointChartDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    point?: MeterPoint | null;
    meter?: Meter | null;
}

const MeterPointChartDialog: React.FC<MeterPointChartDialogProps> = ({ open, onOpenChange, point, meter }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<EnergyData[]>([]);
    const [currentPoint, setCurrentPoint] = useState<MeterPoint | null>(null);
    const [pointsList, setPointsList] = useState<MeterPoint[]>([]);
    
    // 查询条件
    const [viewMode, setViewMode] = useState<'chart' | 'data'>('chart');
    const [timeType, setTimeType] = useState('HOUR');
    const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(24, 'hour').startOf('hour'),
        dayjs().startOf('hour'),
    ]);

    useEffect(() => {
        if (!open) {
            setCurrentPoint(null);
            setPointsList([]);
            setData([]);
            return;
        }
        
        if (point) {
            setCurrentPoint(point);
            setPointsList([point]);
        } else if (meter) {
            getMeterPointsByMeterId(meter.id).then(res => {
                if (res.success && res.data) {
                    setPointsList(res.data);
                    if (res.data.length > 0) {
                        setCurrentPoint(res.data[0]);
                    }
                }
            });
        }
    }, [open, point, meter]);

    useEffect(() => {
        if (open && currentPoint) {
            loadData();
        }
    }, [open, currentPoint, timeType, timeRange]);

    const loadData = async () => {
        if (!currentPoint) return;
        setLoading(true);
        try {
            const startStr = timeRange[0].format('YYYY-MM-DD HH:mm:ss');
            const endStr = timeRange[1].format('YYYY-MM-DD HH:mm:ss');
            const res = await getMeterPointEnergyData(currentPoint.id, timeType, startStr, endStr);
            if (res.success) {
                // 按时间排序并根据时间粒度格式化显示的时间
                const formattedData = (res.data || [])
                    .sort((a, b) => new Date(a.dataTime).getTime() - new Date(b.dataTime).getTime())
                    .map(d => {
                        let displayTime = d.dataTime;
                        if (timeType === 'HOUR') {
                            // 保留日和小时，分秒为0
                            displayTime = dayjs(d.dataTime).format('DD日 HH:00');
                        } else if (timeType === 'DAY') {
                            displayTime = dayjs(d.dataTime).format('MM-DD');
                        } else if (timeType === 'MONTH') {
                            displayTime = dayjs(d.dataTime).format('YYYY-MM');
                        } else if (timeType === 'YEAR') {
                            displayTime = dayjs(d.dataTime).format('YYYY年');
                        }
                        return { ...d, dataTime: displayTime };
                    });
                setData(formattedData);
            } else {
                message.error(res.message || '获取数据失败');
            }
        } catch (error) {
            console.error(error);
            message.error('获取历史记录失败');
        } finally {
            setLoading(false);
        }
    };

    const handleTimeTypeChange = (value: string) => {
        setTimeType(value);
        if (value === 'HOUR') {
            setTimeRange([dayjs().subtract(24, 'hour').startOf('hour'), dayjs().startOf('hour')]);
        } else if (value === 'DAY') {
            setTimeRange([dayjs().subtract(30, 'day').startOf('day'), dayjs().startOf('day')]);
        } else if (value === 'MONTH') {
            setTimeRange([dayjs().subtract(12, 'month').startOf('month'), dayjs().startOf('month')]);
        } else if (value === 'YEAR') {
            setTimeRange([dayjs().subtract(5, 'year').startOf('year'), dayjs().startOf('year')]);
        }
    };

    // 判断是否为非累加型指标 (电压、电流、频率、温度等不展示区间总和)
    const showTotal = useMemo(() => {
        if (!currentPoint) return true;
        const name = currentPoint.name || '';
        const unit = (currentPoint.unit || '').toUpperCase();
        if (
            name.includes('电压') || name.includes('电流') || name.includes('功率因数') || 
            name.includes('频率') || name.includes('温度') || name.includes('湿度') ||
            ['V', 'KV', 'A', 'KA', 'HZ', '℃', '°C', '%'].includes(unit)
        ) {
            return false;
        }
        return true;
    }, [currentPoint]);

    // 计算统计数据
    const stats = useMemo(() => {
        if (data.length === 0) return { max: 0, min: 0, avg: 0, total: 0 };
        let max = data[0].value;
        let min = data[0].value;
        let sum = 0;
        data.forEach(d => {
            if (d.value > max) max = d.value;
            if (d.value < min) min = d.value;
            sum += Number(d.value);
        });
        return {
            max,
            min,
            avg: Number((sum / data.length).toFixed(2)),
            total: Number(sum.toFixed(2))
        };
    }, [data]);

    const config = {
        data,
        padding: 'auto',
        xField: 'dataTime',
        yField: 'value',
        height: 320,
        style: {
            // 给柱子加上轻微的圆角，以及设置最大宽度避免单点时太粗
            radiusTopLeft: 4,
            radiusTopRight: 4,
            maxWidth: 40,
            fill: '#1890ff',
            fillOpacity: 0.85,
        },
        axis: {
            x: {
                labelAutoRotate: true,
                labelAutoHide: true,
                // 空间不足时倾斜，避免垂直（G2/plots内部会自动根据密集程度尝试 45 度）
            }
        },
        tooltip: {
            title: 'dataTime',
            formatter: (datum: any) => {
                return { name: '能耗值', value: `${datum.value} ${currentPoint?.unit || ''}` };
            },
        },
    };

    return (
        <Modal
            title={
                <Space>
                    <LineChartOutlined style={{ color: '#1677ff', fontSize: 20 }} />
                    历史数据分析 - <Text type="secondary">{meter?.name || currentPoint?.name || ''}</Text>
                </Space>
            }
            open={open}
            onCancel={() => onOpenChange(false)}
            footer={null}
            width={1050}
            destroyOnClose
            styles={{
                body: { padding: '20px 0' }
            }}
        >
            <div className="flex flex-col gap-5 px-6">
                <div className="flex w-full justify-between items-center bg-gray-50/70 p-3 rounded-lg border border-gray-100 gap-2 flex-wrap">
                    <Space size="small">
                        {pointsList.length > 1 && (
                            <Select 
                                value={currentPoint?.id}
                                onChange={(val) => {
                                    const p = pointsList.find(c => c.id === val);
                                    if(p) setCurrentPoint(p);
                                }}
                                options={pointsList.map(p => ({ label: p.name, value: p.id }))}
                                style={{ width: 230 }}
                                size="large"
                            />
                        )}
                        <Segmented
                            value={timeType}
                            onChange={handleTimeTypeChange as any}
                            options={[
                                { label: '每小时', value: 'HOUR' },
                                { label: '每天', value: 'DAY' },
                                { label: '每月', value: 'MONTH' },
                                { label: '每年', value: 'YEAR' },
                            ]}
                            size="large"
                        />
                    </Space>
                    <RangePicker
                        value={timeRange}
                        onChange={(dates) => {
                            if (dates && dates[0] && dates[1]) {
                                setTimeRange([dates[0], dates[1]]);
                            }
                        }}
                        showTime={timeType === 'HOUR' ? { format: 'HH:00:00' } : false}
                        format={timeType === 'HOUR' ? 'YYYY-MM-DD HH:00:00' : 'YYYY-MM-DD'}
                        allowClear={false}
                        size="large"
                    />
                </div>

                <Row gutter={16}>
                    <Col span={showTotal ? 6 : 8}>
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-center hover:shadow-sm transition-all">
                            <Statistic title={<span style={{fontSize: 13}}>最高读数</span>} value={stats.max} precision={2} valueStyle={{ color: '#cf1322', fontSize: 20 }} suffix={<span style={{fontSize: 14}}>{currentPoint?.unit || ''}</span>} />
                        </div>
                    </Col>
                    <Col span={showTotal ? 6 : 8}>
                        <div className="bg-green-50/50 border border-green-100 rounded-lg p-3 text-center hover:shadow-sm transition-all">
                            <Statistic title={<span style={{fontSize: 13}}>最低读数</span>} value={stats.min} precision={2} valueStyle={{ color: '#3f8600', fontSize: 20 }} suffix={<span style={{fontSize: 14}}>{currentPoint?.unit || ''}</span>} />
                        </div>
                    </Col>
                    <Col span={showTotal ? 6 : 8}>
                        <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 text-center hover:shadow-sm transition-all">
                            <Statistic title={<span style={{fontSize: 13}}>平均读数</span>} value={stats.avg} precision={2} valueStyle={{ color: '#722ed1', fontSize: 20 }} suffix={<span style={{fontSize: 14}}>{currentPoint?.unit || ''}</span>} />
                        </div>
                    </Col>
                    {showTotal && (
                        <Col span={6}>
                            <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-3 text-center hover:shadow-sm transition-all">
                                <Statistic title={<span style={{fontSize: 13}}>区间总和</span>} value={stats.total} precision={2} valueStyle={{ color: '#fa8c16', fontSize: 20 }} suffix={<span style={{fontSize: 14}}>{currentPoint?.unit || ''}</span>} />
                            </div>
                        </Col>
                    )}
                </Row>

                <div className="flex justify-between items-center w-full pt-2">
                    <span className="font-semibold text-gray-800 text-sm">能耗走势明细</span>
                    <Segmented
                        value={viewMode}
                        onChange={(value) => setViewMode(value as any)}
                        options={[
                            { label: '图表', value: 'chart', icon: <BarChartOutlined /> },
                            { label: '数据', value: 'data', icon: <TableOutlined /> },
                        ]}
                    />
                </div>

                <div className="w-full pt-2">
                    {loading ? (
                        <div className="flex h-[320px] w-full items-center justify-center">
                            <Spin size="large" tip="全面加载中..." />
                        </div>
                    ) : data.length > 0 ? (
                        viewMode === 'chart' ? (
                            <Column {...config as any} />
                        ) : (
                            <div className="h-[320px] overflow-auto border border-gray-100 rounded bg-white">
                                <Table
                                    dataSource={data}
                                    rowKey="id"
                                    pagination={false}
                                    size="small"
                                    sticky
                                    columns={[
                                        { title: '时间节点', dataIndex: 'dataTime', key: 'dataTime', width: '50%' },
                                        { 
                                            title: `综合能耗值 (${currentPoint?.unit || '-'})`, 
                                            dataIndex: 'value', 
                                            key: 'value', 
                                            align: 'right',
                                            render: (val) => <span className="font-semibold text-gray-700">{val}</span>
                                        },
                                    ]}
                                />
                            </div>
                        )
                    ) : (
                        <div className="flex h-[320px] w-full items-center justify-center border border-dashed border-gray-200 rounded-lg">
                            <Empty 
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                description="在所选时间范围内未记录到数据" 
                            />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default MeterPointChartDialog;
