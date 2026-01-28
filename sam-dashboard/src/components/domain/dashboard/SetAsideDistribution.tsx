/**
 * Set-Aside Distribution Chart
 * Stacked/grouped bar chart showing opportunities by set-aside type
 */

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

import type {SetAsideDistributionProps} from './Dashboard.types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

// Set-aside type colors
const SET_ASIDE_COLORS: Record<string, string> = {
  '8(a)': '#3b82f6', // blue
  HUBZone: '#10b981', // emerald
  SDVOSB: '#f59e0b', // amber
  WOSB: '#ec4899', // pink
  EDWOSB: '#8b5cf6', // violet
  SBA: '#06b6d4', // cyan
  'Small Business': '#84cc16', // lime
  'Full & Open': '#71717a', // gray
  default: '#9ca3af',
};

// Studio theme colors
const STUDIO_COLORS = {
  black: '#050505',
  white: '#ffffff',
  gray: '#71717a',
  light: '#f4f4f5',
  border: '#e4e4e7',
};

function getSetAsideColor(setAside: string): string {
  // Check for partial matches
  for (const [key, color] of Object.entries(SET_ASIDE_COLORS)) {
    if (setAside.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return SET_ASIDE_COLORS.default;
}

export function SetAsideDistribution({
  data,
  total,
  maxItems = 8,
  className,
}: SetAsideDistributionProps): React.ReactElement {
  const {isDark} = useDarkMode();

  // Sort by count descending and limit
  const sorted = [...data]
    .sort((a, b) => b.count - a.count)
    .slice(0, maxItems);

  if (sorted.length === 0) {
    return (
      <Flex align="center" justify="center" className="h-[300px] text-studio-gray">
        No set-aside data available
      </Flex>
    );
  }

  const labels = sorted.map((d) => d.label);
  const counts = sorted.map((d) => d.count);
  const colors = sorted.map((d) => getSetAsideColor(d.setAside));

  // Dynamic colors based on dark mode
  const gridColor = isDark ? 'rgba(228, 228, 231, 0.2)' : STUDIO_COLORS.border;
  const tickColor = isDark ? STUDIO_COLORS.light : STUDIO_COLORS.gray;
  const labelColor = isDark ? STUDIO_COLORS.white : STUDIO_COLORS.black;

  const chartData = {
    labels,
    datasets: [
      {
        data: counts,
        backgroundColor: colors,
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
        displayColors: true,
        callbacks: {
          label: (item: {raw: unknown}) => {
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
          stepSize: 1,
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
            size: 11,
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

export default SetAsideDistribution;
