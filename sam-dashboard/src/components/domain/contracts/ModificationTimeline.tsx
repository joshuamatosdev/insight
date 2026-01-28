import {CSSProperties} from 'react';
import {Badge, Button, Text} from '../../catalyst/primitives';
import {Box, Card, CardBody, Grid, HStack, Stack} from '../../catalyst/layout';
import type {ContractModification, ModificationStatus, ModificationTimelineProps,} from './Contract.types';
import {formatCurrency, formatDate, getModificationTypeLabel} from './Contract.types';

type BadgeColor = 'zinc' | 'amber' | 'cyan' | 'blue' | 'green' | 'red';

function getStatusColor(status: ModificationStatus): BadgeColor {
    const colorMap: Record<ModificationStatus, BadgeColor> = {
        DRAFT: 'zinc',
        PENDING: 'amber',
        UNDER_REVIEW: 'cyan',
        APPROVED: 'blue',
        EXECUTED: 'green',
        REJECTED: 'red',
        CANCELLED: 'zinc',
    };
    return colorMap[status];
}

function getStatusLabel(status: ModificationStatus): string {
    const labels: Record<ModificationStatus, string> = {
        DRAFT: 'Draft',
        PENDING: 'Pending',
        UNDER_REVIEW: 'Under Review',
        APPROVED: 'Approved',
        EXECUTED: 'Executed',
        REJECTED: 'Rejected',
        CANCELLED: 'Cancelled',
    };
    return labels[status];
}

interface ModificationItemProps {
    modification: ContractModification;
    onExecute?: (modificationId: string) => void;
    isFirst: boolean;
    isLast: boolean;
}

function ModificationItem({
                              modification,
                              onExecute,
                              isFirst,
                              isLast,
                          }: ModificationItemProps) {
    const hasValueChange =
        modification.valueChange !== null && modification.valueChange !== 0;
    const hasFundingChange =
        modification.fundingChange !== null && modification.fundingChange !== 0;
    const hasPopChange =
        modification.popExtensionDays !== null || modification.newPopEndDate !== null;

    const canExecute =
        modification.status === 'APPROVED' && onExecute !== undefined;

    return (
        <Box>
            <Box
            />
            {isFirst === false && (
                <Box/>
            )}
            <Box/>

            <Card>
                <CardBody>
                    <HStack justify="between" align="start">
                        <Box>
                            <HStack spacing="sm" align="center">
                                <Text variant="heading5">{modification.modificationNumber}</Text>
                                <Badge color="cyan">
                                    {getModificationTypeLabel(modification.modificationType)}
                                </Badge>
                                <Badge color={getStatusColor(modification.status)}>
                                    {getStatusLabel(modification.status)}
                                </Badge>
                            </HStack>
                            {modification.title !== null && (
                                <Text variant="body">
                                    {modification.title}
                                </Text>
                            )}
                        </Box>
                        {canExecute && (
                            <Button
                                size="sm"
                                variant="primary"
                                onClick={() => onExecute(modification.id)}
                            >
                                Execute
                            </Button>
                        )}
                    </HStack>

                    <Grid columns={3} gap="md">
                        <Stack spacing="xs">
                            <Text variant="caption" color="muted">
                                Effective Date
                            </Text>
                            <Text variant="bodySmall">
                                {formatDate(modification.effectiveDate)}
                            </Text>
                        </Stack>
                        {modification.executedDate !== null && (
                            <Stack spacing="xs">
                                <Text variant="caption" color="muted">
                                    Executed Date
                                </Text>
                                <Text variant="bodySmall">
                                    {formatDate(modification.executedDate)}
                                </Text>
                            </Stack>
                        )}
                        {modification.contractingOfficerName !== null && (
                            <Stack spacing="xs">
                                <Text variant="caption" color="muted">
                                    Contracting Officer
                                </Text>
                                <Text variant="bodySmall">
                                    {modification.contractingOfficerName}
                                </Text>
                            </Stack>
                        )}
                    </Grid>

                    {(hasValueChange || hasFundingChange || hasPopChange) && (
                        <Box>
                            <Text
                                variant="caption"
                                color="muted"
                            >
                                Changes
                            </Text>
                            <Grid columns={3} gap="md">
                                {hasValueChange && (
                                    <Stack spacing="xs">
                                        <Text variant="caption" color="muted">
                                            Value Change
                                        </Text>
                                        <Text
                                            variant="body"
                                            weight="semibold"
                                            color={
                                                modification.valueChange !== null && modification.valueChange > 0
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                        >
                                            {modification.valueChange !== null && modification.valueChange > 0
                                                ? '+'
                                                : ''}
                                            {formatCurrency(modification.valueChange)}
                                        </Text>
                                    </Stack>
                                )}
                                {hasFundingChange && (
                                    <Stack spacing="xs">
                                        <Text variant="caption" color="muted">
                                            Funding Change
                                        </Text>
                                        <Text
                                            variant="body"
                                            weight="semibold"
                                            color={
                                                modification.fundingChange !== null &&
                                                modification.fundingChange > 0
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                        >
                                            {modification.fundingChange !== null && modification.fundingChange > 0
                                                ? '+'
                                                : ''}
                                            {formatCurrency(modification.fundingChange)}
                                        </Text>
                                    </Stack>
                                )}
                                {modification.newTotalValue !== null && (
                                    <Stack spacing="xs">
                                        <Text variant="caption" color="muted">
                                            New Total Value
                                        </Text>
                                        <Text variant="body" weight="semibold">
                                            {formatCurrency(modification.newTotalValue)}
                                        </Text>
                                    </Stack>
                                )}
                                {modification.popExtensionDays !== null && (
                                    <Stack spacing="xs">
                                        <Text variant="caption" color="muted">
                                            PoP Extension
                                        </Text>
                                        <Text variant="body" weight="semibold">
                                            +{modification.popExtensionDays} days
                                        </Text>
                                    </Stack>
                                )}
                                {modification.newPopEndDate !== null && (
                                    <Stack spacing="xs">
                                        <Text variant="caption" color="muted">
                                            New PoP End Date
                                        </Text>
                                        <Text variant="body" weight="semibold">
                                            {formatDate(modification.newPopEndDate)}
                                        </Text>
                                    </Stack>
                                )}
                            </Grid>
                        </Box>
                    )}

                    {modification.scopeChangeSummary !== null && (
                        <Box>
                            <Text
                                variant="caption"
                                color="muted"
                            >
                                Scope Change Summary
                            </Text>
                            <Text variant="bodySmall">{modification.scopeChangeSummary}</Text>
                        </Box>
                    )}

                    {modification.reason !== null && (
                        <Box>
                            <Text
                                variant="caption"
                                color="muted"
                            >
                                Reason
                            </Text>
                            <Text variant="bodySmall">{modification.reason}</Text>
                        </Box>
                    )}
                </CardBody>
            </Card>
        </Box>
    );
}

export function ModificationTimeline({
                                         modifications,
                                         onExecuteModification,
                                         className,
                                         style,
                                     }: ModificationTimelineProps) {
    const timelineStyles: CSSProperties = {
        ...style,
    };

    if (modifications.length === 0) {
        return (
            <Box
                style={timelineStyles}
            >
                <Text variant="body" color="muted">
                    No modifications for this contract
                </Text>
            </Box>
        );
    }

    return (
        <Stack spacing="0" style={timelineStyles}>
            {modifications.map((modification, index) => (
                <ModificationItem
                    key={modification.id}
                    modification={modification}
                    onExecute={onExecuteModification}
                    isFirst={index === 0}
                    isLast={index === modifications.length - 1}
                />
            ))}
        </Stack>
    );
}

export default ModificationTimeline;
