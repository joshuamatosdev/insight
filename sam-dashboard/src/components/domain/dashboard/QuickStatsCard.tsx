import {Text} from '../../catalyst/primitives';

interface QuickStatsCardProps {
    title: string;
    value: string | number;
    change?: number;
    changeLabel?: string;
    icon?: React.ReactNode;
}

/**
 * Quick stats card for key metrics - Pocket design aesthetic
 */
export function QuickStatsCard({
                                   title,
                                   value,
                                   change,
                                   changeLabel,
                                   icon,
                               }: QuickStatsCardProps): React.ReactElement {
    const getChangeColor = (): string => {
        if (change === undefined) {
            return 'text-on-surface-muted';
        }
        if (change > 0) {
            return 'text-success';
        }
        if (change < 0) {
            return 'text-danger';
        }
        return 'text-on-surface-muted';
    };

    const formatChange = (): string => {
        if (change === undefined) {
            return '';
        }
        const sign = change > 0 ? '+' : '';
        return `${sign}${change}%`;
    };

    return (
        <div
        >
            <div>
                <div>
                    <Text as="div" variant="bodySmall" weight="medium">
                        {title}
                    </Text>
                    <Text as="div" color="primary">
                        {value}
                    </Text>
                    {(change !== undefined || changeLabel !== undefined) && (
                        <div>
                            {change !== undefined && (
                                <Text as="span" variant="caption" weight="medium">
                                    {formatChange()}
                                </Text>
                            )}
                            {changeLabel !== undefined && (
                                <Text as="span" variant="caption">
                                    {changeLabel}
                                </Text>
                            )}
                        </div>
                    )}
                </div>
                {icon !== undefined && (
                    <div>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuickStatsCard;
