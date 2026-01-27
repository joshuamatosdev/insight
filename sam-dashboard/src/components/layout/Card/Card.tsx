import { CSSProperties } from 'react';
import { CardProps } from './Card.types';

const variantStyles: Record<string, CSSProperties> = {
  elevated: {
    backgroundColor: 'var(--color-white)',
    boxShadow: 'var(--shadow-md)',
    border: 'none',
  },
  outlined: {
    backgroundColor: 'var(--color-white)',
    boxShadow: 'none',
    border: '1px solid var(--color-gray-200)',
  },
  filled: {
    backgroundColor: 'var(--color-gray-50)',
    boxShadow: 'none',
    border: 'none',
  },
};

export function Card({
  variant = 'elevated',
  className,
  style,
  children,
  as = 'article',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...rest
}: CardProps) {
  const cardStyles: CSSProperties = {
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    transition: 'var(--transition-normal)',
    ...variantStyles[variant],
    ...style,
  };

  // Only apply role if not 'none' (allows opting out)
  const role = as !== 'none' ? as : undefined;

  return (
    <div
      className={className}
      style={cardStyles}
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
