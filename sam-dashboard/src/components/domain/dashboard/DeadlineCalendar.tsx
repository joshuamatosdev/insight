import { useMemo } from 'react';
import { Card, CardBody, CardHeader, Stack, Flex, Box } from '../../../components/layout';
import { Text, Badge } from '../../../components/primitives';

interface Deadline {
  id: string;
  title: string;
  date: Date;
  type: 'opportunity' | 'contract' | 'proposal';
  priority: 'high' | 'medium' | 'low';
}

interface DeadlineCalendarProps {
  deadlines: Deadline[];
  daysToShow?: number;
}

/**
 * Upcoming deadlines calendar widget
 */
export function DeadlineCalendar({
  deadlines,
  daysToShow = 14,
}: DeadlineCalendarProps): React.ReactElement {
  const groupedDeadlines = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysToShow * 24 * 60 * 60 * 1000);

    const upcoming = deadlines
      .filter((d) => d.date >= now && d.date <= cutoff)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const grouped = new Map<string, Deadline[]>();
    
    for (const deadline of upcoming) {
      const dateKey = formatDateKey(deadline.date);
      const existing = grouped.get(dateKey) ?? [];
      grouped.set(dateKey, [...existing, deadline]);
    }

    return grouped;
  }, [deadlines, daysToShow]);

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0] ?? '';
  };

  const formatDisplayDate = (dateKey: string): string => {
    const date = new Date(dateKey);
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    if (formatDateKey(date) === formatDateKey(today)) {
      return 'Today';
    }
    if (formatDateKey(date) === formatDateKey(tomorrow)) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityColor = (priority: Deadline['priority']): string => {
    switch (priority) {
      case 'high':
        return 'var(--color-danger)';
      case 'medium':
        return 'var(--color-warning)';
      case 'low':
        return 'var(--color-success)';
    }
  };

  return (
    <Card>
      <CardHeader>
        <Flex justify="space-between" align="center">
          <Text variant="heading5">Upcoming Deadlines</Text>
          <Badge variant="info">{deadlines.length}</Badge>
        </Flex>
      </CardHeader>
      <CardBody style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {groupedDeadlines.size === 0 ? (
          <Text variant="body" color="muted" style={{ textAlign: 'center' }}>
            No upcoming deadlines
          </Text>
        ) : (
          <Stack spacing="var(--spacing-4)">
            {Array.from(groupedDeadlines.entries()).map(([dateKey, items]) => (
              <Stack key={dateKey} spacing="var(--spacing-2)">
                <Text variant="caption" style={{ fontWeight: 600, color: 'var(--color-gray-600)' }}>
                  {formatDisplayDate(dateKey)}
                </Text>
                {items.map((item) => (
                  <Flex
                    key={item.id}
                    align="center"
                    gap="sm"
                    style={{
                      padding: 'var(--spacing-2)',
                      backgroundColor: 'var(--color-gray-50)',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${getPriorityColor(item.priority)}`,
                    }}
                  >
                    <Box style={{ flex: 1 }}>
                      <Text variant="body" style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '200px',
                      }}>
                        {item.title}
                      </Text>
                    </Box>
                    <Badge variant={item.type === 'opportunity' ? 'primary' : 'secondary'}>
                      {item.type}
                    </Badge>
                  </Flex>
                ))}
              </Stack>
            ))}
          </Stack>
        )}
      </CardBody>
    </Card>
  );
}

export default DeadlineCalendar;
