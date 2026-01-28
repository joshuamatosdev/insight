import {CSSProperties, ReactNode} from 'react';
import {ActivityItem, MetricName, TopPerformer, TrendPoint,} from '../../../types/analytics.types';

/**
 * MetricCard component props
 */
export interface MetricCardProps {
    title: string;
    value: string | number;
    previousValue?: number | null;
    changePercent?: number | null;
    icon?: ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'danger';
    loading?: boolean;
    className?: string;
    style?: CSSProperties;
}

/**
 * TrendChart component props
 */
export interface TrendChartProps {
    title: string;
    data: TrendPoint[];
    metricName?: MetricName;
    color?: string;
    height?: number;
    showLegend?: boolean;
    loading?: boolean;
    className?: string;
    style?: CSSProperties;
}

/**
 * ActivityFeed component props
 */
export interface ActivityFeedProps {
    activities: ActivityItem[];
    maxItems?: number;
    loading?: boolean;
    onLoadMore?: () => void;
    hasMore?: boolean;
    className?: string;
    style?: CSSProperties;
}

/**
 * TopPerformersTable component props
 */
export interface TopPerformersTableProps {
    performers: TopPerformer[];
    title?: string;
    loading?: boolean;
    className?: string;
    style?: CSSProperties;
}

/**
 * AnalyticsDashboard component props
 */
export interface AnalyticsDashboardProps {
    className?: string;
    style?: CSSProperties;
}
