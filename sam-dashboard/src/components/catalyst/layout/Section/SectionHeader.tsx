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
    padding: '1rem 0',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #e4e4e7',
    ...style,
  };

  return (
    <header className={className} style={headerStyles} {...rest}>
      <HStack justify="between" align="center">
        <HStack spacing="sm" align="center">
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
