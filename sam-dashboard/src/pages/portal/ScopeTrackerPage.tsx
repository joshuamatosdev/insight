import { useState, useEffect } from 'react';
import { Text, Button, Badge } from '../../components/catalyst/primitives';
import { Flex, Stack, Grid, Box, Card, CardBody, CardHeader } from '../../components/catalyst/layout';
import { ScopeItemList, ScopeChangeTracker } from '../../components/domain/portal';
import { useScope } from '../../hooks';
import type { ScopeItem, ScopeChange, ScopeItemStatus } from '../../types/portal';

type TabView = 'wbs' | 'changes';

/**
 * Scope tracker page for WBS and change management.
 */
export function ScopeTrackerPage(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<TabView>('wbs');
  const [statusFilter, setStatusFilter] = useState<ScopeItemStatus | 'ALL'>('ALL');
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [showCreateItemModal, setShowCreateItemModal] = useState(false);
  const [showCreateChangeModal, setShowCreateChangeModal] = useState(false);

  const {
    scopeItems,
    scopeChanges,
    summary,
    isLoading,
    error,
    refresh,
    loadSummary,
    createScopeItem,
    updateScopeItem,
    deleteScopeItem,
    createScopeChange,
    approveScopeChange,
    rejectScopeChange,
  } = useScope();

  // Load summary when we have scope items
  useEffect(() => {
    if (scopeItems.length > 0) {
      const contractId = scopeItems.at(0)?.contractId;
      if (contractId !== undefined) {
        loadSummary(contractId);
      }
    }
  }, [scopeItems, loadSummary]);

  const handleToggleExpand = (itemId: string) => {
    setExpandedIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const handleExpandAll = () => {
    setExpandedIds(scopeItems.map((item) => item.id));
  };

  const handleCollapseAll = () => {
    setExpandedIds([]);
  };

  const handleApproveChange = async (id: string) => {
    try {
      await approveScopeChange(id);
    } catch (err) {
      console.error('Failed to approve change:', err);
    }
  };

  const handleRejectChange = async (id: string) => {
    try {
      await rejectScopeChange(id);
    } catch (err) {
      console.error('Failed to reject change:', err);
    }
  };

  // Filter scope items
  const filteredItems =
    statusFilter === 'ALL'
      ? scopeItems
      : scopeItems.filter((item) => item.status === statusFilter);

  // Stats calculations
  const pendingChanges = scopeChanges.filter(
    (c) => c.status === 'PROPOSED' || c.status === 'UNDER_REVIEW'
  ).length;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
        <Text variant="body" color="muted">
          Loading scope data...
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
          Error loading scope data: {error.message}
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
          <Text variant="heading2">Scope Tracker</Text>
          <Text variant="body" color="muted">
            Manage work breakdown structure and scope changes
          </Text>
        </Stack>
        <Flex gap="sm">
          <Button variant="secondary" onClick={refresh}>
            Refresh
          </Button>
          {activeTab === 'wbs' ? (
            <Button variant="primary" onClick={() => setShowCreateItemModal(true)}>
              Add Scope Item
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setShowCreateChangeModal(true)}>
              Request Change
            </Button>
          )}
        </Flex>
      </Flex>

      {/* Summary Stats */}
      {summary !== null && (
        <Grid columns={6} gap="md">
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Total Items
                </Text>
                <Text variant="heading3">{summary.totalItems}</Text>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Completed
                </Text>
                <Text variant="heading3" color="success">
                  {summary.completedItems}
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Progress
                </Text>
                <Text variant="heading3">{summary.overallPercentComplete}%</Text>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Est. Hours
                </Text>
                <Text variant="heading3">{summary.totalEstimatedHours}</Text>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Actual Hours
                </Text>
                <Text variant="heading3">{summary.totalActualHours}</Text>
              </Stack>
            </CardBody>
          </Card>
          <Card variant="outlined">
            <CardBody padding="md">
              <Stack spacing="0">
                <Text variant="caption" color="muted">
                  Pending Changes
                </Text>
                <Flex align="center" gap="sm">
                  <Text variant="heading3">{summary.pendingChanges}</Text>
                  {summary.pendingChanges > 0 && (
                    <Badge variant="warning" size="sm">
                      !
                    </Badge>
                  )}
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
      )}

      {/* Tabs */}
      <Flex gap="sm">
        <Button
          variant={activeTab === 'wbs' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('wbs')}
        >
          Work Breakdown Structure
        </Button>
        <Button
          variant={activeTab === 'changes' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('changes')}
        >
          Scope Changes
          {pendingChanges > 0 && (
            <Badge
              variant="warning"
              size="sm"
              className="ml-2"
            >
              {pendingChanges}
            </Badge>
          )}
        </Button>
      </Flex>

      {/* Content */}
      {activeTab === 'wbs' ? (
        <Box>
          {/* WBS Controls */}
          <Card className="mb-4">
            <CardBody>
              <Flex justify="space-between" align="center">
                {/* Expand/Collapse */}
                <Flex gap="sm">
                  <Button size="sm" variant="ghost" onClick={handleExpandAll}>
                    Expand All
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCollapseAll}>
                    Collapse All
                  </Button>
                </Flex>

                {/* Status Filter */}
                <Flex align="center" gap="sm">
                  <Text variant="bodySmall" color="muted">
                    Status:
                  </Text>
                  <Box
                    as="select"
                    value={statusFilter}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setStatusFilter(e.target.value as ScopeItemStatus | 'ALL')
                    }
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d4d4d8',
                      fontSize: '0.875rem',
                    }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="REMOVED">Removed</option>
                  </Box>
                </Flex>
              </Flex>
            </CardBody>
          </Card>

          {/* Scope Item List */}
          {filteredItems.length === 0 ? (
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
                No scope items found
              </Text>
              <Text variant="body" color="muted">
                {statusFilter !== 'ALL'
                  ? 'Try changing the status filter'
                  : 'Add your first scope item to get started'}
              </Text>
            </Flex>
          ) : (
            <ScopeItemList
              scopeItems={filteredItems}
              showHierarchy
              expandedIds={expandedIds}
              onToggleExpand={handleToggleExpand}
              onItemEdit={(item) => console.log('Edit item:', item)}
              onItemDelete={(item) => console.log('Delete item:', item)}
            />
          )}
        </Box>
      ) : (
        <Box>
          {scopeChanges.length === 0 ? (
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
                No scope changes
              </Text>
              <Text variant="body" color="muted">
                All scope change requests will appear here
              </Text>
            </Flex>
          ) : (
            <ScopeChangeTracker
              scopeChanges={scopeChanges}
              onApprove={handleApproveChange}
              onReject={handleRejectChange}
              onClick={(change) => console.log('View change:', change)}
            />
          )}
        </Box>
      )}
    </Stack>
  );
}

export default ScopeTrackerPage;
