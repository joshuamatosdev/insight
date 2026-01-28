import {OpportunityType, TypeBadgeProps} from './Opportunity.types';
import {Box} from '../../catalyst/layout';

const typeClasses: Record<OpportunityType, string> = {
    'sources-sought': 'text-blue-600 bg-blue-50 ring-blue-500/10 dark:bg-blue-400/10 dark:text-blue-400 dark:ring-blue-400/20',
    presolicitation: 'text-warning bg-warning-bg ring-warning/10',
    solicitation: 'text-success bg-success-bg ring-success/10',
    sbir: 'text-success bg-success-bg ring-success/10',
    sttr: 'text-success bg-success-bg ring-success/10',
    other: 'text-zinc-600 bg-zinc-50 ring-zinc-500/10 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/20',
};

export function TypeBadge({type, label, className, style}: TypeBadgeProps) {
    const displayLabel = label || type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    const badgeClasses = `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap ${typeClasses[type]} ${className || ''}`;

    return (
        <Box as="span" style={style}>
            {displayLabel}
        </Box>
    );
}

export default TypeBadge;
