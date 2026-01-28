import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {Badge, Button, Code, Input, Select, Text,} from '../components/catalyst/primitives';
import {ChevronDownIcon, ChevronUpIcon, ListIcon, SearchIcon,} from '../components/catalyst/primitives/Icon';
import {
    Box,
    Card,
    CardBody,
    CardHeader,
    Grid,
    GridItem,
    HStack,
    Section,
    SectionHeader,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
} from '../components/catalyst/layout';
import {AUDIT_ACTION_CATEGORIES, AuditAction, AuditLog, AuditLogFilterState, ENTITY_TYPES,} from '../types';
import {fetchMyAuditLogs} from '../services';
import {AuditLogPageProps} from './AuditLogPage.types';

/**
 * Formats an ISO timestamp to a human-readable format
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Formats an action type to a human-readable string
 */
function formatAction(action: AuditAction): string {
  return action
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Gets the badge color for an action type
 */
function getActionColor(action: AuditAction): 'blue' | 'green' | 'amber' | 'red' | 'cyan' | 'zinc' {
  if (action.includes('CREATED') || action.includes('LOGIN')) {
    return 'green';
  }
  if (action.includes('DELETED') || action.includes('FAILED') || action.includes('SUSPENDED')) {
    return 'red';
  }
  if (action.includes('UPDATED') || action.includes('CHANGED')) {
    return 'amber';
  }
  if (action.includes('VIEWED') || action.includes('DOWNLOADED')) {
    return 'cyan';
  }
  return 'zinc';
}

/**
 * Parses JSON details string safely
 */
function parseDetails(details: string | null): Record<string, unknown> | null {
  if (details === null || details === '') {
    return null;
  }
  try {
    return JSON.parse(details);
  } catch {
    return null;
  }
}

/**
 * Formats parsed details for display
 */
function formatDetailsForDisplay(details: Record<string, unknown>): string {
  return JSON.stringify(details, null, 2);
}

/**
 * Gets all unique actions from categories
 */
function getAllActions(): AuditAction[] {
  const actions: AuditAction[] = [];
  Object.values(AUDIT_ACTION_CATEGORIES).forEach((categoryActions) => {
    categoryActions.forEach((action) => {
      if (actions.includes(action) === false) {
        actions.push(action);
      }
    });
  });
  return actions.sort();
}

const ALL_ACTIONS = getAllActions();

export function AuditLogPage({ tenantId: _tenantId }: AuditLogPageProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [filters, setFilters] = useState<AuditLogFilterState>({
    search: '',
    actionType: '',
    entityType: '',
    dateFrom: '',
    dateTo: '',
  });

  const loadAuditLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchMyAuditLogs(0, 100);
      setLogs(response.content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load audit logs';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAuditLogs();
  }, [loadAuditLogs]);

  const handleToggleExpand = useCallback((id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleFilterChange = useCallback(
    (field: keyof AuditLogFilterState, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      actionType: '',
      entityType: '',
      dateFrom: '',
      dateTo: '',
    });
  }, []);

  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Filter by search term
    if (filters.search !== '') {
      const query = filters.search.toLowerCase();
      result = result.filter(
        (log) =>
          (log.description !== null && log.description.toLowerCase().includes(query)) ||
          (log.entityType !== null && log.entityType.toLowerCase().includes(query)) ||
          (log.entityId !== null && log.entityId.toLowerCase().includes(query)) ||
          log.action.toLowerCase().includes(query)
      );
    }

    // Filter by action type
    if (filters.actionType !== '') {
      result = result.filter((log) => log.action === filters.actionType);
    }

    // Filter by entity type
    if (filters.entityType !== '') {
      result = result.filter((log) => log.entityType === filters.entityType);
    }

    // Filter by date range
    if (filters.dateFrom !== '') {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter((log) => new Date(log.createdAt) >= fromDate);
    }

    if (filters.dateTo !== '') {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((log) => new Date(log.createdAt) <= toDate);
    }

    return result;
  }, [logs, filters]);

  const actionOptions = useMemo(
    () => [
      { value: '', label: 'All Actions' },
      ...ALL_ACTIONS.map((action) => ({
        value: action,
        label: formatAction(action),
      })),
    ],
    []
  );

  const entityTypeOptions = useMemo(
    () => [
      { value: '', label: 'All Entity Types' },
      ...ENTITY_TYPES.map((type) => ({
        value: type,
        label: type,
      })),
    ],
    []
  );

  const hasActiveFilters =
    filters.search !== '' ||
    filters.actionType !== '' ||
    filters.entityType !== '' ||
    filters.dateFrom !== '' ||
    filters.dateTo !== '';

  return (
    <Section id="audit-log">
      <SectionHeader title="Audit Log" icon={<ListIcon size="lg" />} />

      <Card>
        <CardHeader>
          <Stack spacing="md">
            <Text variant="heading5">Filters</Text>
            <Grid columns="1fr 1fr 1fr 1fr" gap="md">
              <GridItem>
                <Input
                  placeholder="Search..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  leftIcon={<SearchIcon size="sm" color="muted" />}
                  fullWidth
                  aria-label="Search audit logs"
                />
              </GridItem>
              <GridItem>
                <Select
                  options={actionOptions}
                  value={filters.actionType}
                  onChange={(e) => handleFilterChange('actionType', e.target.value)}
                  fullWidth
                  aria-label="Filter by action type"
                />
              </GridItem>
              <GridItem>
                <Select
                  options={entityTypeOptions}
                  value={filters.entityType}
                  onChange={(e) => handleFilterChange('entityType', e.target.value)}
                  fullWidth
                  aria-label="Filter by entity type"
                />
              </GridItem>
              <GridItem>
                <HStack spacing="sm" align="center">
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    aria-label="Start date"
                  />
                  <Text variant="body">to</Text>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    aria-label="End date"
                  />
                </HStack>
              </GridItem>
            </Grid>
            {hasActiveFilters && (
              <HStack justify="end">
                <Button variant="outline" size="sm" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </HStack>
            )}
          </Stack>
        </CardHeader>
        <CardBody padding="none">
          {isLoading && (
            <Stack spacing="md">
              <Text variant="body" color="muted">
                Loading audit logs...
              </Text>
            </Stack>
          )}

          {error !== null && isLoading === false && (
            <Stack spacing="md">
              <Text variant="body" color="danger">
                {error}
              </Text>
              <Button variant="outline" size="sm" onClick={loadAuditLogs}>
                Retry
              </Button>
            </Stack>
          )}

          {isLoading === false && error === null && filteredLogs.length === 0 && (
            <Stack spacing="md">
              <Text variant="body" color="muted">
                No audit logs found.
              </Text>
            </Stack>
          )}

          {isLoading === false && error === null && filteredLogs.length > 0 && (
            <Table striped>
              <TableHead>
                <TableRow>
                  <TableHeaderCell>Timestamp</TableHeaderCell>
                  <TableHeaderCell>Action</TableHeaderCell>
                  <TableHeaderCell>Entity</TableHeaderCell>
                  <TableHeaderCell>Description</TableHeaderCell>
                  <TableHeaderCell>IP Address</TableHeaderCell>
                  <TableHeaderCell>Details</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => {
                  const isExpanded = expandedRowId === log.id;
                  const parsedDetails = parseDetails(log.details);
                  const hasDetails = parsedDetails !== null;

                  return (
                    <Fragment key={log.id}>
                      <TableRow>
                        <TableCell>
                          <Text variant="caption" color="muted">
                            {formatTimestamp(log.createdAt)}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Badge color={getActionColor(log.action)}>
                            {formatAction(log.action)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.entityType !== null ? (
                            <Stack spacing="xs">
                              <Text variant="caption" weight="medium">
                                {log.entityType}
                              </Text>
                              {log.entityId !== null && (
                                <Text variant="caption" color="muted">
                                  {log.entityId}
                                </Text>
                              )}
                            </Stack>
                          ) : (
                            <Text variant="caption" color="muted">
                              -
                            </Text>
                          )}
                        </TableCell>
                        <TableCell>
                          <Text variant="body">
                            {log.description ?? '-'}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Text variant="caption" color="muted">
                            {log.ipAddress ?? '-'}
                          </Text>
                        </TableCell>
                        <TableCell>
                          {hasDetails ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpand(log.id)}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                            >
                              {isExpanded ? (
                                <ChevronUpIcon size="sm" />
                              ) : (
                                <ChevronDownIcon size="sm" />
                              )}
                            </Button>
                          ) : (
                            <Text variant="caption" color="muted">
                              -
                            </Text>
                          )}
                        </TableCell>
                      </TableRow>
                      {isExpanded && parsedDetails !== null && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Box>
                              <Code>
                                {formatDetailsForDisplay(parsedDetails)}
                              </Code>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <HStack justify="between">
        <Text variant="caption" color="muted">
          Showing {filteredLogs.length} of {logs.length} entries
        </Text>
      </HStack>
    </Section>
  );
}

export default AuditLogPage;
