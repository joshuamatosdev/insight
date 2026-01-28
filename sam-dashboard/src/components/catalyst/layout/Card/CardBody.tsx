import clsx from 'clsx';
import { CardBodyProps, CardPadding } from './Card.types';

/**
 * CardBody - Main content section of a Card
 *
 * Follows Catalyst styling pattern
 */

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
  xl: 'p-8',
};

export function CardBody({ padding = 'md', className, children, ...rest }: CardBodyProps) {
  return (
    <div
      className={clsx(
        paddingClasses[padding],
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export default CardBody;
