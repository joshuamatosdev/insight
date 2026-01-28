/**
 * Deadline Timeline Chart
 * Gantt-style timeline showing upcoming deadlines
 */

import {useMemo} from 'react';

import {Box, Flex, Stack} from '@/components/catalyst';
import {Text} from '@/components/catalyst/primitives';

import type {DeadlineTimelineProps} from './Dashboard.types';

// Type badge colors
const TYPE_COLORS: Record<string, string> = {
  solicitation: 'bg-blue-500',
  'sources-sought': 'bg-amber-500',
  presolicitation: 'bg-violet-500',
  'special-notice': 'bg-emerald-500',
  combined: 'bg-cyan-500',
  award: 'bg-green-500',
  default: 'bg-gray-500',
};

function getTypeColor(type: string): string {
  const normalizedType = type.toLowerCase().replace(/\s+/g, '-');
  return TYPE_COLORS[normalizedType] ?? TYPE_COLORS.default;
}

function getDaysUntil(deadline: string): number {
  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = deadlineDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function getUrgencyColor(daysRemaining: number): string {
  if (daysRemaining <= 3) return 'text-danger';
  if (daysRemaining <= 7) return 'text-warning';
  return 'text-on-surface-muted';
}

function truncateTitle(title: string, maxLength: number = 40): string {
  if (title.length <= maxLength) return title;
  return `${title.substring(0, maxLength)}...`;
}

export function DeadlineTimeline({
  deadlines,
  maxItems = 8,
  className,
}: DeadlineTimelineProps): React.ReactElement {
  const sortedDeadlines = useMemo(() => {
    return [...deadlines]
      .map((d) => ({
        ...d,
        daysRemaining: getDaysUntil(d.deadline),
      }))
      .filter((d) => d.daysRemaining >= 0)
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, maxItems);
  }, [deadlines, maxItems]);

  if (sortedDeadlines.length === 0) {
    return (
      <Flex align="center" justify="center" className="h-[300px] text-studio-gray">
        No upcoming deadlines
      </Flex>
    );
  }

  // Calculate the max days for the timeline scale
  const maxDays = Math.max(...sortedDeadlines.map((d) => d.daysRemaining), 30);

  return (
    <Box className={`h-[300px] w-full overflow-y-auto ${className ?? ''}`}>
      <Stack gap="xs">
        {sortedDeadlines.map((deadline, index) => {
          const barWidth = ((deadline.daysRemaining / maxDays) * 100).toFixed(1);
          const urgencyColor = getUrgencyColor(deadline.daysRemaining);

          return (
            <Flex
              key={deadline.id ?? `deadline-${index}`}
              align="center"
              gap="sm"
              className="py-2 px-1 hover:bg-surface-container rounded"
            >
              {/* Type indicator */}
              <Box className={`w-1 h-8 rounded-full ${getTypeColor(deadline.type)}`} />

              {/* Title and details */}
              <Stack gap="none" className="flex-1 min-w-0">
                <Text variant="bodySmall" className="truncate font-medium">
                  {truncateTitle(deadline.title)}
                </Text>
                <Flex gap="xs" align="center">
                  <Text variant="caption" color="muted">
                    {deadline.agency ?? 'Unknown Agency'}
                  </Text>
                  <Text variant="caption" color="muted">
                    •
                  </Text>
                  <Text variant="caption" color="muted" className="capitalize">
                    {deadline.type.replace(/-/g, ' ')}
                  </Text>
                </Flex>
              </Stack>

              {/* Timeline bar */}
              <Box className="w-24 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <Box
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${barWidth}%` }}
                />
              </Box>

              {/* Date and days */}
              <Stack gap="none" className="text-right w-16">
                <Text variant="bodySmall" className="font-medium">
                  {formatDate(deadline.deadline)}
                </Text>
                <Text variant="caption" className={urgencyColor}>
                  {deadline.daysRemaining === 0
                    ? 'Today'
                    : deadline.daysRemaining === 1
                    ? '1 day'
                    : `${deadline.daysRemaining} days`}
                </Text>
              </Stack>
            </Flex>
          );
        })}
      </Stack>
    </Box>
  );
}

export default DeadlineTimeline;
