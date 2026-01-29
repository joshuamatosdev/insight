import {useEffect, useState} from 'react';
import {Box, Card, CardBody, Flex, Grid, Stack} from '../../components/catalyst/layout';
import {Button, Text} from '../../components/catalyst/primitives';
import {ContractStatusCards} from './widgets/ContractStatusCards';
import {InvoiceSummary} from './widgets/InvoiceSummary';
import {DeliverableTracker} from './widgets/DeliverableTracker';
import {UpcomingDeadlines} from './widgets/UpcomingDeadlines';
import {PORTAL_LABELS} from '@/constants/labels';

interface DashboardMetrics {
    activeContracts: number;
    pendingInvoices: number;
    upcomingDeadlines: number;
    totalContractValue: number;
}

/**
 * Face Two (Portal) - Client dashboard for tracking contracts DoctrineOne Labs is fulfilling.
 * Displays key metrics and widgets for client contract portfolio overview.
 */
export function ClientDashboard(): React.ReactElement {
    const [metrics, setMetrics] = useState<DashboardMetrics>({
        activeContracts: 0,
        pendingInvoices: 0,
        upcomingDeadlines: 0,
        totalContractValue: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulated data fetch
        const loadMetrics = async () => {
            setLoading(true);
            // In production, fetch from API
            await new Promise((resolve) => setTimeout(resolve, 500));
            setMetrics({
                activeContracts: 5,
                pendingInvoices: 3,
                upcomingDeadlines: 8,
                totalContractValue: 2450000,
            });
            setLoading(false);
        };
        loadMetrics();
    }, []);

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <Stack spacing="lg">
            {/* Header */}
            <Flex justify="space-between" align="center">
                <Stack spacing="0">
                    <Text variant="heading2">{PORTAL_LABELS.DASHBOARD_TITLE}</Text>
                    <Text variant="body" color="muted">
                        {PORTAL_LABELS.DASHBOARD_WELCOME}
                    </Text>
                </Stack>
                <Flex gap="sm">
                    <Button variant="secondary">{PORTAL_LABELS.EXPORT_REPORT_BUTTON}</Button>
                    <Button variant="primary">{PORTAL_LABELS.NEW_SUBMISSION_BUTTON}</Button>
                </Flex>
            </Flex>

            {/* Quick Stats */}
            <Grid columns={4} gap="md">
                <QuickStat
                    title={PORTAL_LABELS.ACTIVE_CONTRACTS}
                    value={metrics.activeContracts.toString()}
                    icon="📋"
                    loading={loading}
                />
                <QuickStat
                    title={PORTAL_LABELS.PENDING_INVOICES}
                    value={metrics.pendingInvoices.toString()}
                    icon="💰"
                    color="#f59e0b"
                    loading={loading}
                />
                <QuickStat
                    title={PORTAL_LABELS.UPCOMING_DEADLINES}
                    value={metrics.upcomingDeadlines.toString()}
                    icon="📅"
                    color="#ef4444"
                    loading={loading}
                />
                <QuickStat
                    title={PORTAL_LABELS.TOTAL_CONTRACT_VALUE}
                    value={formatCurrency(metrics.totalContractValue)}
                    icon="💵"
                    color="#10b981"
                    loading={loading}
                />
            </Grid>

            {/* Main Content Grid */}
            <Grid columns={2} gap="lg">
                {/* Left Column */}
                <Stack spacing="md">
                    <ContractStatusCards/>
                    <DeliverableTracker/>
                </Stack>

                {/* Right Column */}
                <Stack spacing="md">
                    <InvoiceSummary/>
                    <UpcomingDeadlines/>
                </Stack>
            </Grid>
        </Stack>
    );
}

interface QuickStatProps {
    title: string;
    value: string;
    icon: string;
    /** Color value for the icon background and text */
    color?: string;
    /** Optional className for text styling (alternative to color) */
    className?: string;
    loading?: boolean;
}

const DEFAULT_COLOR = '#3b82f6';

function QuickStat({title, value, icon, color, className, loading}: QuickStatProps): React.ReactElement {
    const effectiveColor = color ?? DEFAULT_COLOR;
    return (
        <Card variant="elevated">
            <CardBody padding="md">
                <Flex align="flex-start" justify="space-between">
                    <Stack spacing="xs">
                        <Text variant="caption" color="muted">{title}</Text>
                        {loading === true ? (
                            <Box/>
                        ) : (
                            <Text
                                variant="heading3"
                                style={className !== undefined ? undefined : {color: effectiveColor}}
                            >
                                {value}
                            </Text>
                        )}
                    </Stack>
                    <Box
                        style={{backgroundColor: `${effectiveColor}15`}}
                    >
                        {icon}
                    </Box>
                </Flex>
            </CardBody>
        </Card>
    );
}

export default ClientDashboard;
