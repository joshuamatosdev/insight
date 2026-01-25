import { CSSProperties } from 'react';
import { CardFooterProps } from './Card.types';

export function CardFooter({ className, style, children }: CardFooterProps) {
  const footerStyles: CSSProperties = {
    padding: 'var(--spacing-4) var(--spacing-5)',
    backgroundColor: 'var(--color-gray-50)',
    borderTop: '1px solid var(--color-gray-200)',
    ...style,
  };

  return (
    <div className={className} style={footerStyles}>
      {children}
    </div>
  );
}

export default CardFooter;
