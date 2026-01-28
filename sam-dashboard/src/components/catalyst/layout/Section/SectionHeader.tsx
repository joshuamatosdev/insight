import { CSSProperties } from 'react';
import { SectionHeaderProps } from './Section.types';
import { Text } from '../../primitives';
import { HStack } from '../Stack';

export function SectionHeader({
  title,
  icon,
  actions,
  className,
  style,
  id,
  children,
  ...rest
}: SectionHeaderProps) {
  const headerStyles: CSSProperties = {
    padding: '1rem 0',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e4e4e7',
    ...style,
  };

  // If children are provided, render them directly instead of the default layout
  if (children !== undefined) {
    return (
      <header className={className} style={headerStyles} {...rest}>
        {children}
      </header>
    );
  }

  return (
    <header className={className} style={headerStyles} {...rest}>
      <HStack justify="between" align="center">
        <HStack spacing="sm" align="center">
          {icon !== undefined && <span aria-hidden="true">{icon}</span>}
          {title !== undefined && (
            <Text id={id} variant="heading3" color="primary">
              {title}
            </Text>
          )}
        </HStack>
        {actions !== undefined && <div role="group" aria-label="Section actions">{actions}</div>}
      </HStack>
    </header>
  );
}

export default SectionHeader;
