import { CSSProperties } from 'react';
import { CardHeaderProps } from './Card.types';

export function CardHeader({ className, style, children }: CardHeaderProps) {
  const headerStyles: CSSProperties = {
    padding: 'var(--spacing-4) var(--spacing-5)',
    backgroundColor: 'var(--color-white)',
    borderBottom: '1px solid var(--color-gray-200)',
    ...style,
  };

  return (
    <div className={className} style={headerStyles}>
      {children}
    </div>
  );
}

export default CardHeader;
