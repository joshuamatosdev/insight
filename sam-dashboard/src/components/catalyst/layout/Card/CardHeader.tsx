import clsx from 'clsx';
import { CardHeaderProps } from './Card.types';

/**
 * CardHeader - Header section of a Card
 *
 * Follows Catalyst styling pattern
 */
export function CardHeader({ className, children, divider = true, style, ...rest }: CardHeaderProps) {
  return (
    <div
      className={clsx(
        'px-5 py-4',
        'bg-white',
        'dark:bg-zinc-900',
        divider === true && 'border-b border-zinc-950/10 dark:border-white/10',
        className
      )}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

export default CardHeader;
