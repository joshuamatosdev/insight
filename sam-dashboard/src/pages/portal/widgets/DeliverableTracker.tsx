import { useState, useEffect } from 'react';
import { Card, CardBody, Stack, Flex, Box } from '../../../components/layout';
import { Text, Button } from '../../../components/primitives';

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

  const getStatusColor = (status: Deliverable['status']): string => {
    switch (status) {
      case 'not-started':
        return 'var(--color-gray-500)';
      case 'in-progress':
        return 'var(--color-primary)';
      case 'review':
        return 'var(--color-warning)';
      case 'submitted':
        return 'var(--color-success)';
      case 'accepted':
        return 'var(--color-success)';
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
        <Stack spacing="var(--spacing-4)">
          <Flex justify="space-between" align="center">
            <Text variant="heading5">Deliverable Tracker</Text>
            <Button variant="ghost" size="sm">View All</Button>
          </Flex>

          {loading === true ? (
            <Text variant="caption" color="muted">Loading deliverables...</Text>
          ) : (
            <Stack spacing="var(--spacing-3)">
              {deliverables.map((deliverable) => {
                const daysUntil = getDaysUntilDue(deliverable.dueDate);
                const isUrgent = daysUntil <= 7 && deliverable.status !== 'submitted' && deliverable.status !== 'accepted';
                
                return (
                  <Box
                    key={deliverable.id}
                    style={{
                      padding: 'var(--spacing-3)',
                      backgroundColor: isUrgent ? 'var(--color-danger-50)' : 'var(--color-gray-50)',
                      borderRadius: '8px',
                    }}
                  >
                    <Flex justify="space-between" align="flex-start">
                      <Stack spacing="var(--spacing-1)" style={{ flex: 1 }}>
                        <Text variant="body" style={{ fontWeight: 600 }}>{deliverable.title}</Text>
                        <Text variant="caption" color="muted">{deliverable.contractNumber}</Text>
                      </Stack>
                      <Stack spacing="0" style={{ textAlign: 'right' }}>
                        <Text
                          variant="caption"
                          style={{
                            color: isUrgent ? 'var(--color-danger)' : 'var(--color-gray-600)',
                            fontWeight: isUrgent ? 600 : 400,
                          }}
                        >
                          {daysUntil <= 0 ? 'Overdue!' : `${daysUntil} days left`}
                        </Text>
                        <Text variant="caption" color="muted">Due {deliverable.dueDate}</Text>
                      </Stack>
                    </Flex>

                    {/* Progress Bar */}
                    <Flex align="center" gap="sm" className="mt-2">
                      <Box
                        style={{
                          flex: 1,
                          height: '6px',
                          backgroundColor: 'var(--color-gray-200)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          style={{
                            width: `${deliverable.progressPercent}%`,
                            height: '100%',
                            backgroundColor: getStatusColor(deliverable.status),
                          }}
                        />
                      </Box>
                      <Text
                        variant="caption"
                        style={{
                          color: getStatusColor(deliverable.status),
                          fontWeight: 500,
                          minWidth: '80px',
                          textAlign: 'right',
                        }}
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
