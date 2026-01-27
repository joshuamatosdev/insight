import { useState, useEffect } from 'react';
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

  const getStatusColor = (status: Contract['status']): string => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'completed':
        return '#2563eb';
      case 'at-risk':
        return '#ef4444';
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
              {contracts.map((contract) => (
                <Box
                  key={contract.id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#fafafa',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${getStatusColor(contract.status)}`,
                  }}
                >
                  <Flex justify="space-between" align="flex-start">
                    <Stack spacing="xs">
                      <Text variant="caption" color="muted">{contract.contractNumber}</Text>
                      <Text variant="body" style={{ fontWeight: 600 }}>{contract.title}</Text>
                      <Flex gap="md" align="center">
                        <Text variant="caption">{formatCurrency(contract.value)}</Text>
                        <Text variant="caption" color="muted">•</Text>
                        <Text variant="caption" color="muted">Ends {contract.endDate}</Text>
                      </Flex>
                    </Stack>
                    <Box
                      style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: `${getStatusColor(contract.status)}20`,
                        borderRadius: '4px',
                      }}
                    >
                      <Text
                        variant="caption"
                        style={{
                          color: getStatusColor(contract.status),
                          fontWeight: 600,
                          textTransform: 'uppercase',
                        }}
                      >
                        {contract.status}
                      </Text>
                    </Box>
                  </Flex>

                  {/* Progress Bar */}
                  <Box className="mt-2">
                    <Flex justify="space-between" style={{ marginBottom: '4px' }}>
                      <Text variant="caption" color="muted">Progress</Text>
                      <Text variant="caption" style={{ fontWeight: 600 }}>{contract.progressPercent}%</Text>
                    </Flex>
                    <Box
                      style={{
                        height: '6px',
                        backgroundColor: '#e4e4e7',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        style={{
                          width: `${contract.progressPercent}%`,
                          height: '100%',
                          backgroundColor: getStatusColor(contract.status),
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Stack>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default ContractStatusCards;
