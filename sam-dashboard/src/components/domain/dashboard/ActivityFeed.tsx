import {Box, Card, CardBody, CardHeader, Flex, Stack} from '../../catalyst/layout';
import {Text} from '../../catalyst/primitives';

interface Activity {
    id: string;
    type: 'opportunity' | 'contract' | 'proposal' | 'user' | 'system';
    action: string;
    subject: string;
    actor: string;
    timestamp: Date;
}

interface ActivityFeedProps {
    activities: Activity[];
    maxItems?: number;
}

/**
 * Activity feed widget showing recent actions
 */
export function ActivityFeed({
                                 activities,
                                 maxItems = 10,
                             }: ActivityFeedProps): React.ReactElement {
    const displayActivities = activities.slice(0, maxItems);

    const getActivityIcon = (type: Activity['type']): string => {
        switch (type) {
            case 'opportunity':
                return '📋';
            case 'contract':
                return '📄';
            case 'proposal':
                return '📝';
            case 'user':
                return '👤';
            case 'system':
                return '⚙️';
        }
    };

    const formatTimestamp = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) {
            return 'Just now';
        }
        if (minutes < 60) {
            return `${minutes}m ago`;
        }
        if (hours < 24) {
            return `${hours}h ago`;
        }
        if (days < 7) {
            return `${days}d ago`;
        }
        return date.toLocaleDateString();
    };

    return (
        <Card>
            <CardHeader>
                <Text variant="heading5">Recent Activity</Text>
            </CardHeader>
            <CardBody style={{maxHeight: '400px', overflowY: 'auto'}}>
                {displayActivities.length === 0 ? (
                    <Text variant="body" color="muted" style={{textAlign: 'center'}}>
                        No recent activity
                    </Text>
                ) : (
                    <Stack spacing="md">
                        {displayActivities.map((activity) => (
                            <Flex
                                key={activity.id}
                                gap="sm"
                            >
                                <Box>
                                    {getActivityIcon(activity.type)}
                                </Box>
                                <Stack spacing="0">
                                    <Text variant="body">
                                        <Text as="span" weight="semibold">
                                            {activity.actor}
                                        </Text>{' '}
                                        {activity.action}{' '}
                                        <Text as="span" color="primary">
                                            {activity.subject}
                                        </Text>
                                    </Text>
                                    <Text variant="caption" color="muted">
                                        {formatTimestamp(activity.timestamp)}
                                    </Text>
                                </Stack>
                            </Flex>
                        ))}
                    </Stack>
                )}
            </CardBody>
        </Card>
    );
}

export default ActivityFeed;
