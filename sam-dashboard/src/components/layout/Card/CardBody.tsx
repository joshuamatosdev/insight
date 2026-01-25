import { CSSProperties } from 'react';
import { CardBodyProps } from './Card.types';

const paddingStyles: Record<string, CSSProperties> = {
  none: { padding: 0 },
  sm: { padding: 'var(--spacing-3)' },
  md: { padding: 'var(--spacing-5)' },
  lg: { padding: 'var(--spacing-6)' },
};

export function CardBody({ padding = 'md', className, style, children }: CardBodyProps) {
  const bodyStyles: CSSProperties = {
    ...paddingStyles[padding],
    ...style,
  };

  return (
    <div className={className} style={bodyStyles}>
      {children}
    </div>
  );
}

export default CardBody;
