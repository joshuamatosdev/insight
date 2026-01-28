import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Card, CardBody, Stack, Flex, Box } from '../../../components/catalyst/layout';
import { Text, Button } from '../../../components/catalyst/primitives';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  status: 'active' | 'pending' | 'completed' | 'at-risk';
  value: number;
  endDate: string;
  progressPercent: number;
}

/**
 * Widget showing contract status cards.
 */
export function ContractStatusCards(): React.ReactElement {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated data fetch
    const loadContracts = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      setContracts([
        {
          id: '1',
          contractNumber: 'FA8773-24-C-0001',
          title: 'IT Infrastructure Support',
          status: 'active',
          value: 850000,
          endDate: '2025-12-31',
          progressPercent: 65,
        },
        {
          id: '2',
          contractNumber: 'W912DQ-23-D-0045',
          title: 'Engineering Services',
          status: 'at-risk',
          value: 1200000,
          endDate: '2024-06-30',
          progressPercent: 88,
        },
        {
          id: '3',
          contractNumber: 'GS-35F-0123X',
          title: 'Software Development',
          status: 'active',
          value: 400000,
          endDate: '2025-03-15',
          progressPercent: 45,
        },
      ]);
      setLoading(false);
    };
    loadContracts();
  }, []);

  const getStatusClasses = (status: Contract['status']): { border: string; bg: string; text: string; progressBg: string } => {
    switch (status) {
      case 'active':
        return {
          border: 'border-l-emerald-500',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-500',
          progressBg: 'bg-emerald-500',
        };
      case 'pending':
        return {
          border: 'border-l-amber-500',
          bg: 'bg-amber-500/10',
          text: 'text-amber-500',
          progressBg: 'bg-amber-500',
        };
      case 'completed':
        return {
          border: 'border-l-blue-600',
          bg: 'bg-blue-600/10',
          text: 'text-blue-600',
          progressBg: 'bg-blue-600',
        };
      case 'at-risk':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-500/10',
          text: 'text-red-500',
          progressBg: 'bg-red-500',
        };
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card variant="bordered">
      <CardBody padding="md">
        <Stack spacing="md">
          <Flex justify="space-between" align="center">
            <Text variant="heading5">Active Contracts</Text>
            <Button variant="ghost" size="sm">View All</Button>
          </Flex>

          {loading === true ? (
            <Text variant="caption" color="muted">Loading contracts...</Text>
          ) : (
            <Stack spacing="md">
              {contracts.map((contract) => {
                const statusClasses = getStatusClasses(contract.status);
                return (
                  <Box
                    key={contract.id}
                    className={clsx(
                      'p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border-l-4',
                      statusClasses.border
                    )}
                  >
                    <Flex justify="space-between" align="flex-start">
                      <Stack spacing="xs">
                        <Text variant="caption" color="muted">{contract.contractNumber}</Text>
                        <Text variant="body" weight="semibold">{contract.title}</Text>
                        <Flex gap="md" align="center">
                          <Text variant="caption">{formatCurrency(contract.value)}</Text>
                          <Text variant="caption" color="muted">•</Text>
                          <Text variant="caption" color="muted">Ends {contract.endDate}</Text>
                        </Flex>
                      </Stack>
                      <Box className={clsx('px-2 py-1 rounded', statusClasses.bg)}>
                        <Text
                          variant="caption"
                          weight="semibold"
                          className={clsx('uppercase', statusClasses.text)}
                        >
                          {contract.status}
                        </Text>
                      </Box>
                    </Flex>

                    {/* Progress Bar */}
                    <Box className="mt-2">
                      <Flex justify="space-between" className="mb-1">
                        <Text variant="caption" color="muted">Progress</Text>
                        <Text variant="caption" weight="semibold">{contract.progressPercent}%</Text>
                      </Flex>
                      <Box className="h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-sm overflow-hidden">
                        <Box
                          className={clsx('h-full', statusClasses.progressBg)}
                          style={{ width: `${contract.progressPercent}%` }}
                        />
                      </Box>
                    </Box>
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

export default ContractStatusCards;
