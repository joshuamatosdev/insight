import { CSSProperties } from 'react';
import { TopPerformersTableProps } from './Analytics.types';
import { Text, Badge, UserIcon } from '../../primitives';
import { Box, Stack, HStack, Card, CardHeader, CardBody, Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell } from '../../layout';

/**
 * TopPerformersTable displays top performers ranked by action count.
 */
export function TopPerformersTable({
  performers,
  title = 'Top Performers',
  loading = false,
  className,
  style,
}: TopPerformersTableProps) {
  const containerStyles: CSSProperties = {
    ...style,
  };

  if (loading) {
    return (
      <Card className={className} style={containerStyles}>
        <CardHeader>
          <Text variant="heading5">{title}</Text>
        </CardHeader>
        <CardBody>
          <Stack spacing="var(--spacing-3)">
            {[1, 2, 3, 4, 5].map((i) => (
              <HStack key={i} spacing="var(--spacing-3)" align="center">
                <Box
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--color-surface-container)',
                  }}
                />
                <Box
                  style={{
                    width: '100px',
                    height: '14px',
                    background: 'var(--color-surface-container)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
                <Box style={{ flex: 1 }} />
                <Box
                  style={{
                    width: '40px',
                    height: '14px',
                    background: 'var(--color-surface-container)',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              </HStack>
            ))}
          </Stack>
        </CardBody>
      </Card>
    );
  }

  if (performers.length === 0) {
    return (
      <Card className={className} style={containerStyles}>
        <CardHeader>
          <Text variant="heading5">{title}</Text>
        </CardHeader>
        <CardBody>
          <Box
            style={{
              textAlign: 'center',
              padding: 'var(--spacing-8)',
            }}
          >
            <Text variant="body" color="secondary">
              No data available
            </Text>
          </Box>
        </CardBody>
      </Card>
    );
  }

  /**
   * Get rank badge variant based on position
   */
  function getRankBadgeVariant(rank: number): 'success' | 'warning' | 'info' | 'secondary' {
    if (rank === 1) return 'success';
    if (rank === 2) return 'warning';
    if (rank === 3) return 'info';
    return 'secondary';
  }

  return (
    <Card className={className} style={containerStyles}>
      <CardHeader>
        <Text variant="heading5">{title}</Text>
      </CardHeader>
      <CardBody padding="none">
        <Table>
          <TableHead>
            <TableRow>
              <TableHeaderCell style={{ width: '50px' }}>Rank</TableHeaderCell>
              <TableHeaderCell>User</TableHeaderCell>
              <TableHeaderCell style={{ textAlign: 'right' }}>Actions</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {performers.map((performer, index) => (
              <TableRow key={performer.userId}>
                <TableCell>
                  <Badge
                    variant={getRankBadgeVariant(index + 1)}
                    size="sm"
                  >
                    #{index + 1}
                  </Badge>
                </TableCell>
                <TableCell>
                  <HStack spacing="var(--spacing-2)" align="center">
                    <Box
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <UserIcon size="sm" color="white" />
                    </Box>
                    <Text variant="body" style={{ fontWeight: 500 }}>
                      {performer.userName}
                    </Text>
                  </HStack>
                </TableCell>
                <TableCell style={{ textAlign: 'right' }}>
                  <Text variant="body" style={{ fontWeight: 600 }}>
                    {performer.actionCount.toLocaleString()}
                  </Text>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}

export default TopPerformersTable;
