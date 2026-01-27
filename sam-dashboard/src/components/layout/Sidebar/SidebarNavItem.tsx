import { CSSProperties, KeyboardEvent, useState } from 'react';
import { SidebarNavItemProps } from './Sidebar.types';

export function SidebarNavItem({
  icon,
  label,
  badge,
  isActive = false,
  onClick,
  className,
  style,
}: SidebarNavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const listItemStyles: CSSProperties = {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  };

  const itemStyles: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    padding: '0.6rem var(--spacing-6)',
    color: isActive || isHovered ? 'var(--color-white)' : 'var(--color-dark-text)',
    background: isActive
      ? 'rgba(13, 110, 253, 0.2)'
      : isHovered
        ? 'rgba(255, 255, 255, 0.1)'
        : 'transparent',
    borderLeft: `3px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
    textDecoration: 'none',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-normal)' as unknown as number,
    ...style,
  };

  const badgeContainerStyles: CSSProperties = {
    marginLeft: 'auto',
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <li style={listItemStyles} role="listitem">
      <a
        href="#"
        className={className}
        style={itemStyles}
        onClick={(e) => {
          e.preventDefault();
          onClick?.();
        }}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="menuitem"
        tabIndex={0}
        aria-current={isActive ? 'page' : undefined}
      >
        {icon !== undefined && icon !== null && (
          <span aria-hidden="true">{icon}</span>
        )}
        <span>{label}</span>
        {badge !== undefined && badge !== null && (
          <span style={badgeContainerStyles} aria-label={`${label} has notifications`}>
            {badge}
          </span>
        )}
      </a>
    </li>
  );
}

export default SidebarNavItem;
