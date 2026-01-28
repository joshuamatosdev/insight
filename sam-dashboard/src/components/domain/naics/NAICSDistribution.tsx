import {BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip,} from 'chart.js';
import {Bar} from 'react-chartjs-2';

import {Box, Flex} from '@/components/catalyst';
import {useDarkMode} from '@/hooks/useDarkMode';

import {getNAICSDescription, NAICSDistributionProps} from './NAICS.types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Studio theme colors
const STUDIO_COLORS = {
    black: '#050505',
    white: '#ffffff',
    gray: '#71717a',
    light: '#f4f4f5',
    border: '#e4e4e7',
};

export function NAICSDistribution({
                                      distribution,
                                      total,
                                      maxItems = 8,
                                  }: NAICSDistributionProps) {
    const {isDark} = useDarkMode();

    const sorted = Object.entries(distribution)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxItems);

    if (sorted.length === 0) {
        return (
            <Flex align="center" justify="center" className="h-[300px] text-studio-gray">
                No NAICS data available
            </Flex>
        );
    }

    const labels = sorted.map(([code]) => getNAICSDescription(code));
    const data = sorted.map(([, count]) => count);
    const codes = sorted.map(([code]) => code);

    // Dynamic colors based on dark mode
    const barColor = isDark ? STUDIO_COLORS.white : STUDIO_COLORS.black;
    const gridColor = isDark ? 'rgba(228, 228, 231, 0.2)' : STUDIO_COLORS.border;
    const tickColor = isDark ? STUDIO_COLORS.light : STUDIO_COLORS.gray;
    const labelColor = isDark ? STUDIO_COLORS.white : STUDIO_COLORS.black;

    const chartData = {
        labels,
        datasets: [
            {
                data,
                backgroundColor: barColor,
                borderRadius: 4,
                barThickness: 20,
            },
        ],
    };

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 750,
            easing: 'easeOutQuart' as const,
        },
        plugins: {
            legend: {display: false},
            tooltip: {
                backgroundColor: isDark ? STUDIO_COLORS.light : STUDIO_COLORS.black,
                titleColor: isDark ? STUDIO_COLORS.black : STUDIO_COLORS.white,
                bodyColor: isDark ? STUDIO_COLORS.black : STUDIO_COLORS.white,
                padding: 12,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: (items: { dataIndex: number }[]) => {
                        const index = items.at(0)?.dataIndex;
                        if (index === undefined) return '';
                        return codes.at(index) ?? '';
                    },
                    label: (item: { raw: unknown }) => {
                        const count = item.raw as number;
                        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                        return `${count} opportunities (${pct}%)`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: gridColor,
                    lineWidth: 1,
                },
                ticks: {
                    color: tickColor,
                    font: {
                        size: 11,
                    },
                },
                border: {
                    display: false,
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: labelColor,
                    font: {
                        size: 12,
                        weight: 500 as const,
                    },
                    padding: 8,
                },
                border: {
                    display: false,
                },
            },
        },
    };

    return (
        <Box className="h-[300px] w-full">
            <Bar data={chartData} options={options}/>
        </Box>
    );
}

export default NAICSDistribution;
