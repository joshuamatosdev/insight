import clsx from 'clsx';
import {SectionHeaderProps} from './Section.types';
import {Text} from '../../primitives';
import {HStack} from '../Stack';

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
  // If children are provided, render them directly instead of the default layout
  if (children !== undefined) {
    return (
      <header
        className={clsx('py-4 mb-6 border-b-2 border-zinc-200', className)}
        style={style}
        {...rest}
      >
        {children}
      </header>
    );
  }

  return (
    <header
      className={clsx('py-4 mb-6 border-b-2 border-zinc-200', className)}
      style={style}
      {...rest}
    >
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
