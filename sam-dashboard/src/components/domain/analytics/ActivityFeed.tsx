import {CSSProperties} from 'react';
import {ActivityFeedProps} from './Analytics.types';
import {Button, Text, UserIcon} from '../../catalyst/primitives';
import {Box, Card, CardBody, CardHeader, HStack, Stack} from '../../catalyst/layout';
import {formatEventType} from '../../../types/analytics.types';

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Get icon color based on event type
 */
function getEventColor(eventType: string): string {
    if (eventType.includes('VIEWED')) return '#0ea5e9';
    if (eventType.includes('SAVED') || eventType.includes('CREATED')) return '#10b981';
    if (eventType.includes('REMOVED') || eventType.includes('DELETED')) return '#ef4444';
    if (eventType.includes('MOVED') || eventType.includes('UPDATED')) return '#f59e0b';
    return '#2563eb';
}

/**
 * ActivityFeed displays a list of recent activities.
 */
export function ActivityFeed({
                                 activities,
                                 maxItems = 10,
                                 loading = false,
                                 onLoadMore,
                                 hasMore = false,
                                 className,
                                 style,
                             }: ActivityFeedProps) {
    const containerStyles: CSSProperties = {
        ...style,
    };

    const displayedActivities = activities.slice(0, maxItems);

    if (loading) {
        return (
            <Card style={containerStyles}>
                <CardHeader>
                    <Text variant="heading5">Recent Activity</Text>
                </CardHeader>
                <CardBody>
                    <Stack spacing="md">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <HStack key={i} spacing="md" align="start">
                                <Box
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: '#f4f4f5',
                                    }}
                                />
                                <Stack spacing="xs" style={{flex: 1}}>
                                    <Box
                                        style={{
                                            width: '60%',
                                            height: '14px',
                                            background: '#f4f4f5',
                                            borderRadius: '0.25rem',
                                        }}
                                    />
                                    <Box
                                        style={{
                                            width: '40%',
                                            height: '12px',
                                            background: '#f4f4f5',
                                            borderRadius: '0.25rem',
                                        }}
                                    />
                                </Stack>
                            </HStack>
                        ))}
                    </Stack>
                </CardBody>
            </Card>
        );
    }

    if (activities.length === 0) {
        return (
            <Card style={containerStyles}>
                <CardHeader>
                    <Text variant="heading5">Recent Activity</Text>
                </CardHeader>
                <CardBody>
                    <Box
                        style={{
                            textAlign: 'center',
                            padding: '2rem',
                        }}
                    >
                        <Text variant="body" color="secondary">
                            No recent activity
                        </Text>
                    </Box>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card style={containerStyles}>
            <CardHeader>
                <Text variant="heading5">Recent Activity</Text>
            </CardHeader>
            <CardBody padding="none">
                <Stack spacing="0">
                    {displayedActivities.map((activity, index) => (
                        <HStack
                            key={activity.id}
                            spacing="md"
                            align="start"
                            style={{
                                padding: '1rem',
                                borderBottom:
                                    index < displayedActivities.length - 1
                                        ? '1px solid #e4e4e7'
                                        : undefined,
                            }}
                        >
                            <Box
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: getEventColor(activity.eventType),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <UserIcon size="sm" color="white"/>
                            </Box>
                            <Stack spacing="xs" style={{flex: 1, minWidth: 0}}>
                                <HStack justify="between" align="start">
                                    <Text
                                        variant="body"
                                        style={{
                                            fontWeight: 500,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {activity.userName}
                                    </Text>
                                    <Text
                                        variant="caption"
                                        color="secondary"
                                    >
                                        {formatTimestamp(activity.timestamp)}
                                    </Text>
                                </HStack>
                                <Text variant="caption" color="secondary">
                                    {activity.description !== null && activity.description !== undefined && activity.description !== ''
                                        ? activity.description
                                        : formatEventType(activity.eventType)}
                                </Text>
                                {activity.entityId !== null && activity.entityId !== undefined && (
                                    <Text
                                        variant="caption"
                                        style={{
                                            color: '#2563eb',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {activity.entityType}: {activity.entityId}
                                    </Text>
                                )}
                            </Stack>
                        </HStack>
                    ))}
                </Stack>
                {hasMore && onLoadMore !== undefined && (
                    <Box
                        style={{
                            padding: '1rem',
                            textAlign: 'center',
                            borderTop: '1px solid #e4e4e7',
                        }}
                    >
                        <Button variant="ghost" size="sm" onClick={onLoadMore}>
                            Load More
                        </Button>
                    </Box>
                )}
            </CardBody>
        </Card>
    );
}

export default ActivityFeed;
