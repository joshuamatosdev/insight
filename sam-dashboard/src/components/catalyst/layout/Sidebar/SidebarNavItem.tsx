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
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    marginBottom: '1px',
    color: isActive ? '#0891b2' : isHovered ? '#111827' : '#6b7280',
    background: isActive
      ? '#ecfeff'
      : isHovered
        ? '#f9fafb'
        : 'transparent',
    borderLeft: `2px solid ${isActive ? '#06b6d4' : 'transparent'}`,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: isActive ? 500 : 400,
    ...style,
  };

  const badgeContainerStyles: CSSProperties = {
    marginLeft: 'auto',
    fontSize: '0.75rem',
    color: '#9ca3af',
    fontWeight: 400,
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
          <span
            aria-hidden="true"
            style={{
              color: isActive ? '#06b6d4' : isHovered ? '#6b7280' : '#9ca3af',
              transition: 'color 0.15s ease',
            }}
          >
            {icon}
          </span>
        )}
        <span>{label}</span>
        {badge !== undefined && badge !== null && (
          <span style={badgeContainerStyles} aria-label={`${label} count`}>
            {badge}
          </span>
        )}
      </a>
    </li>
  );
}

export default SidebarNavItem;
