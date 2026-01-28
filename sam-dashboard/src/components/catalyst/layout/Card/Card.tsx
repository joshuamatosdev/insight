import clsx from 'clsx';
import {CardProps, CardVariant} from './Card.types';

/**
 * Card - A container component with variants
 *
 * Follows Catalyst styling pattern:
 * - Uses Tailwind classes for all styling
 * - Uses clsx for class composition
 * - Supports dark mode via dark: prefix
 */

const variantClasses: Record<CardVariant, string> = {
    elevated: clsx(
        'bg-white shadow-md',
        'dark:bg-zinc-900 dark:shadow-lg dark:shadow-black/20'
    ),
    // 'default' is an alias for 'elevated' for backwards compatibility
    default: clsx(
        'bg-white shadow-md',
        'dark:bg-zinc-900 dark:shadow-lg dark:shadow-black/20'
    ),
    outlined: clsx(
        'bg-white border border-zinc-950/10',
        'dark:bg-zinc-900 dark:border-white/10'
    ),
    filled: clsx(
        'bg-zinc-50',
        'dark:bg-zinc-800'
    ),
    bordered: clsx(
        'bg-white border-2 border-zinc-200',
        'dark:bg-zinc-900 dark:border-zinc-700'
    ),
};

export function Card({
                         variant = 'elevated',
                         className,
                         children,
                         as = 'article',
                         style,
                         'aria-label': ariaLabel,
                         'aria-labelledby': ariaLabelledBy,
                         ...rest
                     }: CardProps) {
    // Only apply role if not 'none' (allows opting out)
    const role = as !== 'none' ? as : undefined;

    return (
        <div
            className={clsx(
                // Base styles
                'rounded-xl overflow-hidden transition-all duration-200',
                // Variant styles
                variantClasses[variant],
                // Custom classes
                className
            )}
            style={style}
            role={role}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            {...rest}
        >
            {children}
        </div>
    );
}

export default Card;
