import { CSSProperties, useState } from 'react';
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

  return (
    <a
      className={className}
      style={itemStyles}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {icon}
      <span>{label}</span>
      {badge && <span style={badgeContainerStyles}>{badge}</span>}
    </a>
  );
}

export default SidebarNavItem;
