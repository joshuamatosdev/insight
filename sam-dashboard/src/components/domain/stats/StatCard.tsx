import {StatCardProps} from './Stats.types';


export function StatCard({value, label, icon, change, className}: StatCardProps) {
    const getChangeColor = (type: 'positive' | 'negative' | 'neutral'): string => {
        if (type === 'positive') {
            return 'text-success';
        }
        if (type === 'negative') {
            return 'text-danger';
        }
        return 'text-on-surface-muted';
    };

    return (
        <div
        >
            <dt>
                {label}
            </dt>

            {change !== undefined && change !== null && (
                <dd>
                    {change.value}
                </dd>
            )}

            <dd>
                <div>
                    <span>{value}</span>
                    {icon !== undefined && icon !== null && (
                        <span>
              {icon}
            </span>
                    )}
                </div>
            </dd>
        </div>
    );
}

export default StatCard;
