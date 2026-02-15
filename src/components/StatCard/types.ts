export interface StatCardProps {
    title: string;
    value?: number | string;
    unit?: string;

    // gradient 模式专用
    mode?: 'gradient' | 'simple';
    icon?: React.ReactNode;
    gradient?: string;
    color?: string;
    trend?: 'up' | 'down';
    trendValue?: string;

    // simple 模式专用
    yoy?: number;  // 同比
    mom?: number;  // 环比
    diff?: number; // 差值
}
