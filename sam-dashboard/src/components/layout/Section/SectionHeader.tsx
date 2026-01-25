import { CSSProperties } from 'react';
import { SectionHeaderProps } from './Section.types';
import { Text } from '../../primitives';
import { HStack } from '../Stack';

export function SectionHeader({ title, icon, actions, className, style }: SectionHeaderProps) {
  const headerStyles: CSSProperties = {
    padding: 'var(--spacing-4) 0',
    marginBottom: 'var(--spacing-6)',
    borderBottom: '2px solid var(--color-gray-200)',
    ...style,
  };

  return (
    <div className={className} style={headerStyles}>
      <HStack justify="between" align="center">
        <HStack spacing="var(--spacing-2)" align="center">
          {icon}
          <Text variant="heading3" color="primary">
            {title}
          </Text>
        </HStack>
        {actions && <div>{actions}</div>}
      </HStack>
    </div>
  );
}

export default SectionHeader;
