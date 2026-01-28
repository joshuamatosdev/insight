import {Box} from '../../catalyst/layout';
import {NAICSBadgeProps} from './NAICS.types';

export function NAICSBadge({code, className, style}: NAICSBadgeProps) {
    const badgeClasses = `inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset whitespace-nowrap text-zinc-600 bg-zinc-100 ring-zinc-500/10 dark:bg-zinc-400/10 dark:text-zinc-400 dark:ring-zinc-400/20 ${className || ''}`;

    return (
        <Box as="span" style={style}>
            {code || 'N/A'}
        </Box>
    );
}

export default NAICSBadge;
