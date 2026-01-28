import {Fragment, useCallback, useEffect, useMemo, useState} from 'react';
import {Badge, Button, Code, Input, Select, Text,} from '../components/catalyst/primitives';
import {ChevronDownIcon, ChevronUpIcon, DownloadIcon, ListIcon, SearchIcon,} from '../components/catalyst/primitives/Icon';
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
import {Drawer, DrawerBody, DrawerFooter, DrawerHeader} from '../components/catalyst/blocks/drawer';
import {AUDIT_ACTION_CATEGORIES, AuditAction, AuditLog, AuditLogFilterState, ENTITY_TYPES,} from '../types';
import {fetchMyAuditLogs, exportAuditLogs} from '../services';
import {useIsAdmin, useIsPortalUser} from '../hooks';
import {AuditLogPageProps} from './AuditLogPage.types';

/**
 * Actions relevant to Intelligence users (opportunity discovery)
 */
const INTEL_USER_ACTIONS: AuditAction[] = [
    'OPPORTUNITY_VIEWED',
    'OPPORTUNITY_SAVED',
    'OPPORTUNITY_REMOVED_FROM_SAVED',
    'OPPORTUNITY_ADDED_TO_PIPELINE',
    'OPPORTUNITY_STAGE_CHANGED',
    'PIPELINE_CREATED',
    'PIPELINE_UPDATED',
    'PIPELINE_DELETED',
    'PIPELINE_ARCHIVED',
    'PIPELINE_DEFAULT_SET',
    'OPPORTUNITY_REMOVED_FROM_PIPELINE',
    'BID_DECISION_SET',
    'SEARCH_CREATED',
    'SEARCH_UPDATED',
    'SEARCH_DELETED',
    'ALERT_CREATED',
    'ALERT_UPDATED',
    'ALERT_DELETED',
    'ALERT_TRIGGERED',
];

/**
 * Actions relevant to Portal users (contract execution)
 */
const PORTAL_USER_ACTIONS: AuditAction[] = [
    'CONTRACT_CREATED',
    'CONTRACT_UPDATED',
    'CONTRACT_DELETED',
    'CONTRACT_STATUS_CHANGED',
    'CLIN_CREATED',
    'CLIN_UPDATED',
    'MODIFICATION_CREATED',
    'OPTION_EXERCISED',
    'DELIVERABLE_CREATED',
    'DELIVERABLE_COMPLETED',
    'INVOICE_CREATED',
    'INVOICE_SUBMITTED',
    'INVOICE_PAID',
    'BUDGET_ITEM_CREATED',
    'LABOR_RATE_CREATED',
    'LABOR_RATE_UPDATED',
    'LABOR_RATE_DELETED',
    'CERTIFICATION_CREATED',
    'CERTIFICATION_UPDATED',
    'CERTIFICATION_DELETED',
    'CERTIFICATION_EXPIRED',
    'CLEARANCE_CREATED',
    'CLEARANCE_UPDATED',
    'COMPLIANCE_ITEM_CREATED',
    'COMPLIANCE_STATUS_CHANGED',
];

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

/**
 * Audit Entry Detail Drawer Component
 */
function AuditDetailDrawer({
    entry,
    isOpen,
    onClose,
}: {
    entry: AuditLog | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    if (entry === null) {
        return null;
    }

    const parsedDetails = parseDetails(entry.details);

    return (
        <Drawer open={isOpen} onClose={onClose} size="lg" position="right">
            <DrawerHeader>Audit Entry Details</DrawerHeader>
            <DrawerBody>
                <Stack spacing="lg">
                    <Grid columns="1fr 1fr" gap="md">
                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Action
                            </Text>
                            <Badge color={getActionColor(entry.action)}>
                                {formatAction(entry.action)}
                            </Badge>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Timestamp
                            </Text>
                            <Text variant="body">
                                {formatTimestamp(entry.createdAt)}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Entity Type
                            </Text>
                            <Text variant="body">
                                {entry.entityType ?? 'N/A'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Entity ID
                            </Text>
                            <Text variant="body" style={{wordBreak: 'break-all'}}>
                                {entry.entityId ?? 'N/A'}
                            </Text>
                        </GridItem>

                        <GridItem colSpan={2}>
                            <Text variant="caption" color="muted" weight="medium">
                                Description
                            </Text>
                            <Text variant="body">
                                {entry.description ?? 'No description'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                User ID
                            </Text>
                            <Text variant="body" style={{wordBreak: 'break-all'}}>
                                {entry.userId ?? 'System'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                Tenant ID
                            </Text>
                            <Text variant="body" style={{wordBreak: 'break-all'}}>
                                {entry.tenantId ?? 'N/A'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                IP Address
                            </Text>
                            <Text variant="body">
                                {entry.ipAddress ?? 'N/A'}
                            </Text>
                        </GridItem>

                        <GridItem>
                            <Text variant="caption" color="muted" weight="medium">
                                User Agent
                            </Text>
                            <Text variant="caption" style={{wordBreak: 'break-all'}}>
                                {entry.userAgent ?? 'N/A'}
                            </Text>
                        </GridItem>
                    </Grid>

                    {parsedDetails !== null && (
                        <Box>
                            <Text variant="caption" color="muted" weight="medium">
                                Details
                            </Text>
                            <Box>
                                <Code>
                                    {formatDetailsForDisplay(parsedDetails)}
                                </Code>
                            </Box>
                        </Box>
                    )}
                </Stack>
            </DrawerBody>
            <DrawerFooter>
                <Button variant="outline" onClick={onClose}>
                    Close
                </Button>
            </DrawerFooter>
        </Drawer>
    );
}

export function AuditLogPage({tenantId: _tenantId}: AuditLogPageProps) {
    const isAdmin = useIsAdmin();
    const isPortalUser = useIsPortalUser();

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [selectedEntry, setSelectedEntry] = useState<AuditLog | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [filters, setFilters] = useState<AuditLogFilterState>({
        search: '',
        actionType: '',
        entityType: '',
        dateFrom: '',
        dateTo: '',
    });

    /**
     * Gets the role-based actions for filtering
     * Admins see all actions, others see role-specific actions
     */
    const roleBasedActions = useMemo((): AuditAction[] | null => {
        if (isAdmin) {
            return null; // Admin sees all
        }
        if (isPortalUser) {
            return PORTAL_USER_ACTIONS;
        }
        return INTEL_USER_ACTIONS; // Default to Intel user
    }, [isAdmin, isPortalUser]);

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

    const handleRowClick = useCallback((entry: AuditLog) => {
        setSelectedEntry(entry);
        setIsDrawerOpen(true);
    }, []);

    const handleCloseDrawer = useCallback(() => {
        setIsDrawerOpen(false);
        setSelectedEntry(null);
    }, []);

    const handleFilterChange = useCallback(
        (field: keyof AuditLogFilterState, value: string) => {
            setFilters((prev) => ({...prev, [field]: value}));
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

    const handleExport = useCallback(async () => {
        setIsExporting(true);
        try {
            await exportAuditLogs(filteredLogs, 'CSV');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export audit logs');
        } finally {
            setIsExporting(false);
        }
    }, []);

    const filteredLogs = useMemo(() => {
        let result = [...logs];

        // Apply role-based default filtering (only if no specific action filter is set)
        if (roleBasedActions !== null && filters.actionType === '') {
            result = result.filter((log) => roleBasedActions.includes(log.action));
        }

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
    }, [logs, filters, roleBasedActions]);

    const actionOptions = useMemo(
        () => {
            // For non-admin users, show role-relevant actions at the top
            const allActionsLabel = roleBasedActions !== null
                ? `All ${isPortalUser ? 'Contract' : 'Opportunity'} Actions`
                : 'All Actions';

            const actionsToShow = roleBasedActions !== null
                ? roleBasedActions.sort()
                : ALL_ACTIONS;

            return [
                {value: '', label: allActionsLabel},
                ...actionsToShow.map((action) => ({
                    value: action,
                    label: formatAction(action),
                })),
            ];
        },
        [roleBasedActions, isPortalUser]
    );

    const entityTypeOptions = useMemo(
        () => [
            {value: '', label: 'All Entity Types'},
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
            <SectionHeader
                title="Audit Log"
                icon={<ListIcon size="lg"/>}
                actions={
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting || filteredLogs.length === 0}
                    >
                        <HStack spacing="xs" align="center">
                            <DownloadIcon size="sm"/>
                            <Text as="span" variant="bodySmall">
                                {isExporting ? 'Exporting...' : 'Export CSV'}
                            </Text>
                        </HStack>
                    </Button>
                }
            />

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
                                    leftIcon={<SearchIcon size="sm" color="muted"/>}
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
                                            <TableRow
                                                data-testid="audit-entry"
                                                onClick={() => handleRowClick(log)}
                                                style={{cursor: 'pointer'}}
                                            >
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleExpand(log.id);
                                                            }}
                                                            aria-expanded={isExpanded}
                                                            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronUpIcon size="sm"/>
                                                            ) : (
                                                                <ChevronDownIcon size="sm"/>
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

            <AuditDetailDrawer
                entry={selectedEntry}
                isOpen={isDrawerOpen}
                onClose={handleCloseDrawer}
            />
        </Section>
    );
}

export default AuditLogPage;
