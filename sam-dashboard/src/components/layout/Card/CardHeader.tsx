import clsx from 'clsx';
import { CardHeaderProps } from './Card.types';

/**
 * CardHeader - Header section of a Card
 *
 * Follows Catalyst styling pattern
 */
export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'px-5 py-4',
        'bg-white border-b border-zinc-950/10',
        'dark:bg-zinc-900 dark:border-white/10',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default CardHeader;
