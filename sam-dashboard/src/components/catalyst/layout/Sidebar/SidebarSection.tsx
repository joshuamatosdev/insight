import {useId} from 'react';
import clsx from 'clsx';
import {SidebarSectionProps} from './Sidebar.types';

export function SidebarSection({title, className, style, children}: SidebarSectionProps) {
    const titleId = useId();
    const hasTitle = title !== undefined && title !== null && title.length > 0;

    return (
        <section
            className={clsx('pt-6 pb-2', className)}
            style={style}
            aria-labelledby={hasTitle ? titleId : undefined}
            role="group"
        >
            {hasTitle && (
                <div
                    id={titleId}
                    className="px-4 pb-2 text-[0.6875rem] font-semibold uppercase tracking-wider text-gray-400"
                >
                    {title}
                </div>
            )}
            {children}
        </section>
    );
}

export default SidebarSection;
