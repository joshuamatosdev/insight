import {KeyboardEvent} from 'react';
import clsx from 'clsx';
import {SidebarNavItemProps} from './Sidebar.types';

export function SidebarNavItem({
                                   icon,
                                   label,
                                   badge,
                                   isActive = false,
                                   onClick,
                                   className,
                                   style,
                               }: SidebarNavItemProps) {
    const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
        }
    };

    return (
        <li className="list-none m-0 p-0" role="listitem">
            <a
                href="#"
                className={clsx(
                    'flex items-center gap-3 px-4 py-2 mb-px cursor-pointer transition-all duration-150 no-underline text-sm border-l-2',
                    isActive
                        ? 'text-cyan-600 bg-cyan-50 border-l-cyan-500 font-medium'
                        : 'text-gray-500 bg-transparent border-l-transparent font-normal hover:text-gray-900 hover:bg-gray-50',
                    className
                )}
                style={style}
                onClick={(e) => {
                    e.preventDefault();
                    onClick?.();
                }}
                onKeyDown={handleKeyDown}
                role="menuitem"
                tabIndex={0}
                aria-current={isActive ? 'page' : undefined}
            >
                {icon !== undefined && icon !== null && (
                    <span
                        aria-hidden="true"
                        className={clsx(
                            'transition-colors duration-150',
                            isActive ? 'text-cyan-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}
                    >
            {icon}
          </span>
                )}
                <span>{label}</span>
                {badge !== undefined && badge !== null && (
                    <span className="ml-auto text-xs text-gray-400 font-normal" aria-label={`${label} count`}>
            {badge}
          </span>
                )}
            </a>
        </li>
    );
}

export default SidebarNavItem;
