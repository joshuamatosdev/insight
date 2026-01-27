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
  ...rest
}: SectionHeaderProps) {
  const headerStyles: CSSProperties = {
    padding: 'var(--spacing-4) 0',
    marginBottom: 'var(--spacing-6)',
    borderBottom: '2px solid var(--color-gray-200)',
    ...style,
  };

  return (
    <header className={className} style={headerStyles} {...rest}>
      <HStack justify="between" align="center">
        <HStack spacing="var(--spacing-2)" align="center">
          {icon !== undefined && <span aria-hidden="true">{icon}</span>}
          <Text id={id} variant="heading3" color="primary">
            {title}
          </Text>
        </HStack>
        {actions !== undefined && <div role="group" aria-label="Section actions">{actions}</div>}
      </HStack>
    </header>
  );
}

export default SectionHeader;
