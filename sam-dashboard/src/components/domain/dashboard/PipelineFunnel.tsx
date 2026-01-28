/**
 * Pipeline Funnel Chart
 * Shows opportunity progression through pipeline stages
 */

import {useMemo} from 'react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';
import {Bar} from 'react-chartjs-2';

import {Box, Flex} from '@/components/catalyst';
import {useDarkMode} from '@/hooks/useDarkMode';

import type {PipelineFunnelProps} from './Dashboard.types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Default stage colors
const STAGE_COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#ef4444', // red-500
  '#6366f1', // indigo-500
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

export function PipelineFunnel({
  stages,
  className,
}: PipelineFunnelProps): React.ReactElement {
  const {isDark} = useDarkMode();

  const sortedStages = useMemo(() => {
    return [...stages].sort((a, b) => b.value - a.value);
  }, [stages]);

  if (sortedStages.length === 0) {
    return (
      <Flex align="center" justify="center" className="h-[300px] text-studio-gray">
        No pipeline data available
      </Flex>
    );
  }

  const labels = sortedStages.map((s) => s.stageName);
  const data = sortedStages.map((s) => s.value);
  const colors = sortedStages.map((s, i) => s.color ?? STAGE_COLORS[i % STAGE_COLORS.length]);
  const counts = sortedStages.map((s) => s.count);

  // Dynamic colors based on dark mode
  const gridColor = isDark ? 'rgba(228, 228, 231, 0.2)' : STUDIO_COLORS.border;
  const tickColor = isDark ? STUDIO_COLORS.light : STUDIO_COLORS.gray;
  const labelColor = isDark ? STUDIO_COLORS.white : STUDIO_COLORS.black;

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: colors,
        borderRadius: 4,
        barThickness: 24,
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
        displayColors: true,
        callbacks: {
          title: (items: Array<{dataIndex: number}>) => {
            const index = items.at(0)?.dataIndex;
            if (index === undefined) return '';
            return labels[index] ?? '';
          },
          label: (item: {raw: unknown; dataIndex: number}) => {
            const value = item.raw as number;
            const count = counts[item.dataIndex] ?? 0;
            return `${formatCurrency(value)} (${count} opportunities)`;
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
          callback: (value: string | number) => formatCurrency(Number(value)),
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
    <Box className={`h-[300px] w-full ${className ?? ''}`}>
      <Bar data={chartData} options={options} />
    </Box>
  );
}

export default PipelineFunnel;
