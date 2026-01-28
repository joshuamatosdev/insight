import { useState } from 'react';
import { Text, Button, Badge, Input } from '../../components/catalyst/primitives';
import { Flex, Stack, Grid, Box, Card, CardBody, CardHeader } from '../../components/catalyst/layout';
import { FeatureRequestCard } from '../../components/domain/portal';
import { useFeatureRequests } from '../../hooks';
import type {
  FeatureRequest,
  FeatureRequestStatus,
  FeatureRequestCategory,
  FeatureRequestPriority,
} from '../../types/portal';

type GroupBy = 'status' | 'category' | 'priority';

const STATUS_ORDER: FeatureRequestStatus[] = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'IN_DEVELOPMENT',
  'COMPLETED',
  'DEFERRED',
  'REJECTED',
];

const CATEGORY_LABELS: Record<FeatureRequestCategory, string> = {
  ENHANCEMENT: 'Enhancement',
  NEW_FEATURE: 'New Feature',
  BUG_FIX: 'Bug Fix',
  PERFORMANCE: 'Performance',
  USABILITY: 'Usability',
  INTEGRATION: 'Integration',
  OTHER: 'Other',
};

const PRIORITY_ORDER: FeatureRequestPriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

/**
 * Feature requests page with voting and filtering.
 */
export function FeatureRequestsPage(): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupBy>('status');
  const [statusFilter, setStatusFilter] = useState<FeatureRequestStatus | 'ALL'>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    featureRequests,
    isLoading,
    error,
    refresh,
    createFeatureRequest,
    voteFeatureRequest,
    unvoteFeatureRequest,
  } = useFeatureRequests();

  const handleVote = async (id: string) => {
    try {
      await voteFeatureRequest(id);
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleUnvote = async (id: string) => {
    try {
      await unvoteFeatureRequest(id);
    } catch (err) {
      console.error('Failed to remove vote:', err);
    }
  };

  // Filter and search
  const filteredRequests = featureRequests.filter((fr) => {
    if (statusFilter !== 'ALL' && fr.status !== statusFilter) {
      return false;
    }
    if (searchQuery !== '') {
      const query = searchQuery.toLowerCase();
      return (
        fr.title.toLowerCase().includes(query) ||
        fr.description.toLowerCase().includes(query) ||
        fr.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Group requests
  const groupedRequests = (): Record<string, FeatureRequest[]> => {
    const groups: Record<string, FeatureRequest[]> = {};

    filteredRequests.forEach((fr) => {
      let key: string;
      switch (groupBy) {
        case 'status':
          key = fr.status;
          break;
        case 'category':
          key = fr.category;
          break;
        case 'priority':
          key = fr.priority;
          break;
        default:
          key = 'Other';
      }

      if (groups[key] === undefined) {
        groups[key] = [];
      }
      groups[key].push(fr);
    });

    return groups;
  };

  const getGroupOrder = (): string[] => {
    switch (groupBy) {
      case 'status':
        return STATUS_ORDER;
      case 'priority':
        return PRIORITY_ORDER;
      case 'category':
        return Object.keys(CATEGORY_LABELS);
      default:
        return [];
    }
  };

  const getGroupLabel = (key: string): string => {
    if (groupBy === 'category') {
      return CATEGORY_LABELS[key as FeatureRequestCategory] ?? key;
    }
    return key.replace('_', ' ');
  };

  const groups = groupedRequests();
  const orderedKeys = getGroupOrder().filter((key) => groups[key] !== undefined);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
        <Text variant="body" color="muted">
          Loading feature requests...
        </Text>
      </Flex>
    );
  }

  if (error !== null) {
    return (
      <Box
        style={{
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: '#fef2f2',
          borderRadius: '0.5rem',
        }}
      >
        <Text variant="body" color="danger">
          Error loading feature requests: {error.message}
        </Text>
        <Button variant="secondary" onClick={refresh} className="mt-3">
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing="lg" className="p-6">
      {/* Header */}
      <Flex justify="space-between" align="center">
        <Stack spacing="0">
          <Text variant="heading2">Feature Requests</Text>
          <Text variant="body" color="muted">
            Vote on features and submit new requests
          </Text>
        </Stack>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Submit Request
        </Button>
      </Flex>

      {/* Filters */}
      <Card>
        <CardBody>
          <Flex justify="space-between" align="center" gap="md">
            {/* Search */}
            <Box style={{ flex: 1, maxWidth: '400px' }}>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests..."
                aria-label="Search feature requests"
              />
            </Box>

            {/* Group By */}
            <Flex align="center" gap="sm">
              <Text variant="bodySmall" color="muted">
                Group by:
              </Text>
              <Flex gap="xs">
                {(['status', 'category', 'priority'] as GroupBy[]).map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={groupBy === option ? 'primary' : 'secondary'}
                    onClick={() => setGroupBy(option)}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </Button>
                ))}
              </Flex>
            </Flex>

            {/* Status Filter */}
            <Flex align="center" gap="sm">
              <Text variant="bodySmall" color="muted">
                Status:
              </Text>
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatusFilter(e.target.value as FeatureRequestStatus | 'ALL')
                }
                className="px-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm"
              >
                <option value="ALL">All Statuses</option>
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </Flex>
          </Flex>
        </CardBody>
      </Card>

      {/* Stats */}
      <Grid columns={4} gap="md">
        <Card variant="outlined">
          <CardBody padding="md">
            <Stack spacing="0">
              <Text variant="caption" color="muted">
                Total Requests
              </Text>
              <Text variant="heading3">{featureRequests.length}</Text>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="outlined">
          <CardBody padding="md">
            <Stack spacing="0">
              <Text variant="caption" color="muted">
                In Development
              </Text>
              <Text variant="heading3">
                {featureRequests.filter((f) => f.status === 'IN_DEVELOPMENT').length}
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="outlined">
          <CardBody padding="md">
            <Stack spacing="0">
              <Text variant="caption" color="muted">
                Completed
              </Text>
              <Text variant="heading3">
                {featureRequests.filter((f) => f.status === 'COMPLETED').length}
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="outlined">
          <CardBody padding="md">
            <Stack spacing="0">
              <Text variant="caption" color="muted">
                Total Votes
              </Text>
              <Text variant="heading3">
                {featureRequests.reduce((sum, f) => sum + f.voteCount, 0)}
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {/* Grouped Feature Requests */}
      {filteredRequests.length === 0 ? (
        <Flex
          justify="center"
          align="center"
          direction="column"
          style={{
            padding: '2rem',
            backgroundColor: '#fafafa',
            borderRadius: '0.5rem',
          }}
        >
          <Text variant="heading4" color="muted">
            No feature requests found
          </Text>
          <Text variant="body" color="muted">
            {searchQuery !== ''
              ? 'Try adjusting your search or filters'
              : 'Be the first to submit a feature request'}
          </Text>
        </Flex>
      ) : (
        <Stack spacing="lg">
          {orderedKeys.map((key) => {
            const requests = groups[key] ?? [];
            if (requests.length === 0) {
              return null;
            }

            return (
              <Box key={key}>
                <Flex align="center" gap="sm" className="mb-3">
                  <Text variant="heading4">{getGroupLabel(key)}</Text>
                  <Badge color="zinc">
                    {requests.length}
                  </Badge>
                </Flex>
                <Stack spacing="md">
                  {requests
                    .sort((a, b) => b.voteCount - a.voteCount)
                    .map((fr) => (
                      <FeatureRequestCard
                        key={fr.id}
                        featureRequest={fr}
                        onVote={handleVote}
                        onUnvote={handleUnvote}
                      />
                    ))}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

export default FeatureRequestsPage;
