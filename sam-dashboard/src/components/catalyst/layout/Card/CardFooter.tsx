import clsx from 'clsx';
import {CardFooterProps} from './Card.types';

/**
 * CardFooter - Footer section of a Card
 *
 * Follows Catalyst styling pattern
 */
export function CardFooter({className, children, ...rest}: CardFooterProps) {
    return (
        <div
            className={clsx(
                'px-5 py-4',
                'bg-zinc-50 border-t border-zinc-950/10',
                'dark:bg-zinc-800 dark:border-white/10',
                className
            )}
            {...rest}
        >
            {children}
        </div>
    );
}

export default CardFooter;
