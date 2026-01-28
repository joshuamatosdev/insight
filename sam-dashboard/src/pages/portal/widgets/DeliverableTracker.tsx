import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Card, CardBody, Stack, Flex, Box } from '../../../components/catalyst/layout';
import { Text, Button } from '../../../components/catalyst/primitives';

interface Deliverable {
  id: string;
  title: string;
  contractNumber: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'review' | 'submitted' | 'accepted';
  progressPercent: number;
}

/**
 * Widget tracking deliverable status across contracts.
 */
export function DeliverableTracker(): React.ReactElement {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeliverables = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setDeliverables([
        {
          id: '1',
          title: 'Monthly Status Report - January',
          contractNumber: 'FA8773-24-C-0001',
          dueDate: '2024-02-05',
          status: 'in-progress',
          progressPercent: 75,
        },
        {
          id: '2',
          title: 'System Design Document v2.0',
          contractNumber: 'GS-35F-0123X',
          dueDate: '2024-02-10',
          status: 'review',
          progressPercent: 95,
        },
        {
          id: '3',
          title: 'Quarterly Financial Report',
          contractNumber: 'W912DQ-23-D-0045',
          dueDate: '2024-02-15',
          status: 'not-started',
          progressPercent: 0,
        },
        {
          id: '4',
          title: 'Security Assessment Report',
          contractNumber: 'FA8773-24-C-0001',
          dueDate: '2024-02-20',
          status: 'in-progress',
          progressPercent: 40,
        },
      ]);
      setLoading(false);
    };
    loadDeliverables();
  }, []);

  const getStatusClasses = (status: Deliverable['status']): { text: string; progressBg: string } => {
    switch (status) {
      case 'not-started':
        return { text: 'text-zinc-500', progressBg: 'bg-zinc-500' };
      case 'in-progress':
        return { text: 'text-blue-600', progressBg: 'bg-blue-600' };
      case 'review':
        return { text: 'text-amber-500', progressBg: 'bg-amber-500' };
      case 'submitted':
        return { text: 'text-emerald-500', progressBg: 'bg-emerald-500' };
      case 'accepted':
        return { text: 'text-emerald-500', progressBg: 'bg-emerald-500' };
    }
  };

  const getStatusLabel = (status: Deliverable['status']): string => {
    switch (status) {
      case 'not-started':
        return 'Not Started';
      case 'in-progress':
        return 'In Progress';
      case 'review':
        return 'In Review';
      case 'submitted':
        return 'Submitted';
      case 'accepted':
        return 'Accepted';
    }
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <Card variant="bordered">
      <CardBody padding="md">
        <Stack spacing="md">
          <Flex justify="space-between" align="center">
            <Text variant="heading5">Deliverable Tracker</Text>
            <Button variant="ghost" size="sm">View All</Button>
          </Flex>

          {loading === true ? (
            <Text variant="caption" color="muted">Loading deliverables...</Text>
          ) : (
            <Stack spacing="md">
              {deliverables.map((deliverable) => {
                const daysUntil = getDaysUntilDue(deliverable.dueDate);
                const isUrgent = daysUntil <= 7 && deliverable.status !== 'submitted' && deliverable.status !== 'accepted';
                const statusClasses = getStatusClasses(deliverable.status);

                return (
                  <Box
                    key={deliverable.id}
                    className={clsx(
                      'p-3 rounded-lg',
                      isUrgent ? 'bg-red-50 dark:bg-red-900/20' : 'bg-zinc-50 dark:bg-zinc-800'
                    )}
                  >
                    <Flex justify="space-between" align="flex-start">
                      <Stack spacing="xs" className="flex-1">
                        <Text variant="body" weight="semibold">{deliverable.title}</Text>
                        <Text variant="caption" color="muted">{deliverable.contractNumber}</Text>
                      </Stack>
                      <Stack spacing="0" className="text-right">
                        <Text
                          variant="caption"
                          weight={isUrgent ? 'semibold' : 'normal'}
                          className={isUrgent ? 'text-red-500' : 'text-zinc-600 dark:text-zinc-400'}
                        >
                          {daysUntil <= 0 ? 'Overdue!' : `${daysUntil} days left`}
                        </Text>
                        <Text variant="caption" color="muted">Due {deliverable.dueDate}</Text>
                      </Stack>
                    </Flex>

                    {/* Progress Bar */}
                    <Flex align="center" gap="sm" className="mt-2">
                      <Box className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-sm overflow-hidden">
                        <Box
                          className={clsx('h-full', statusClasses.progressBg)}
                          style={{ width: `${deliverable.progressPercent}%` }}
                        />
                      </Box>
                      <Text
                        variant="caption"
                        weight="medium"
                        className={clsx('min-w-20 text-right', statusClasses.text)}
                      >
                        {getStatusLabel(deliverable.status)}
                      </Text>
                    </Flex>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default DeliverableTracker;
