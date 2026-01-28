/**
 * Contract Value By Type Chart
 * Donut chart showing contract value breakdown by type (FFP, T&M, Cost-Plus, etc.)
 */

import {ArcElement, Chart as ChartJS, Legend, Tooltip,} from 'chart.js';
import {Doughnut} from 'react-chartjs-2';

import {Box, Flex} from '@/components/catalyst';
import {useDarkMode} from '@/hooks/useDarkMode';

import type {ContractValueByTypeProps} from './Dashboard.types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Contract type colors
const TYPE_COLORS = [
    '#3b82f6', // FFP - blue
    '#f59e0b', // T&M - amber
    '#10b981', // Cost-Plus - emerald
    '#8b5cf6', // IDIQ - violet
    '#ec4899', // Other - pink
    '#06b6d4', // Cyan
];

// Studio theme colors
const STUDIO_COLORS = {
    black: '#050505',
    white: '#ffffff',
    gray: '#71717a',
    light: '#f4f4f5',
    border: '#e4e4e7',
};

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
}

export function ContractValueByType({
                                        data,
                                        total,
                                        className,
                                    }: ContractValueByTypeProps): React.ReactElement {
    const {isDark} = useDarkMode();

    // Sort by value descending
    const sorted = [...data].sort((a, b) => b.value - a.value);

    if (sorted.length === 0) {
        return (
            <Flex align="center" justify="center" className="h-[300px] text-studio-gray">
                No contract data available
            </Flex>
        );
    }

    const labels = sorted.map((d) => d.label);
    const values = sorted.map((d) => d.value);
    const counts = sorted.map((d) => d.count);

    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: TYPE_COLORS.slice(0, sorted.length),
                borderColor: isDark ? STUDIO_COLORS.black : STUDIO_COLORS.white,
                borderWidth: 2,
                hoverOffset: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        animation: {
            duration: 750,
            easing: 'easeOutQuart' as const,
        },
        plugins: {
            legend: {
                display: true,
                position: 'right' as const,
                labels: {
                    color: isDark ? STUDIO_COLORS.white : STUDIO_COLORS.black,
                    font: {
                        size: 11,
                    },
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
            tooltip: {
                backgroundColor: isDark ? STUDIO_COLORS.light : STUDIO_COLORS.black,
                titleColor: isDark ? STUDIO_COLORS.black : STUDIO_COLORS.white,
                bodyColor: isDark ? STUDIO_COLORS.black : STUDIO_COLORS.white,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (item: { raw: unknown; dataIndex: number }) => {
                        const value = item.raw as number;
                        const count = counts[item.dataIndex] ?? 0;
                        const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                        return `${formatCurrency(value)} (${pct}%) - ${count} contracts`;
                    },
                },
            },
        },
    };

    return (
        <Box className={`h-[300px] w-full ${className ?? ''}`}>
            <Doughnut data={chartData} options={options}/>
        </Box>
    );
}

export default ContractValueByType;
