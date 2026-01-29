/**
 * SystemSidebar - Shared system-level features for all contexts
 * Contains Insights, Document Management, Administration, and Settings sections
 * Used by both ContractIntelSidebar and PortalSidebar
 */
import {Link, useLocation} from '@tanstack/react-router';
import {
    CheckCircleIcon,
    FileCheckIcon,
    FileTextIcon,
    KeyIcon,
    ShieldIcon,
    SidebarDivider,
    SidebarHeading,
    SidebarItem,
    SidebarLabel,
    SidebarSection,
    SpeedometerIcon,
    TagIcon,
    UserIcon,
    UsersIcon,
} from '@components/catalyst';

export function SidebarIcon({children}: {children: React.ReactNode}) {
    return <span data-slot="icon">{children}</span>;
}

// Wrapper for SidebarItem with Link
function SidebarLink({
    to,
    children,
    ...props
}: {
    to: string;
    children: React.ReactNode;
} & Omit<React.ComponentProps<typeof SidebarItem>, 'current'>) {
    const location = useLocation();
    const isCurrent = location.pathname === to || location.pathname.startsWith(to + '/');

    return (
        <Link to={to} className="block">
            <SidebarItem current={isCurrent} {...props}>
                {children}
            </SidebarItem>
        </Link>
    );
}

/**
 * Shared system-level sidebar sections.
 * These appear in both Contract Intelligence and Portal sidebars.
 */
export function SystemSidebarSections() {
    return (
        <>
            {/* Insights */}
            <SidebarSection>
                <SidebarHeading>Insights</SidebarHeading>
                <SidebarLink to="/analytics">
                    <SidebarIcon>
                        <SpeedometerIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Analytics</SidebarLabel>
                </SidebarLink>
                <SidebarLink to="/reports">
                    <SidebarIcon>
                        <FileTextIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Reports</SidebarLabel>
                </SidebarLink>
                <SidebarLink to="/reports/builder">
                    <SidebarIcon>
                        <FileCheckIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Report Builder</SidebarLabel>
                </SidebarLink>
            </SidebarSection>

            {/* Document Management */}
            <SidebarSection>
                <SidebarHeading>Document Management</SidebarHeading>
                <SidebarLink to="/documents">
                    <SidebarIcon>
                        <FileTextIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Documents</SidebarLabel>
                </SidebarLink>
            </SidebarSection>

            {/* Administration */}
            <SidebarSection>
                <SidebarHeading>Administration</SidebarHeading>
                <SidebarLink to="/admin/roles">
                    <SidebarIcon>
                        <ShieldIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Roles</SidebarLabel>
                </SidebarLink>
                <SidebarLink to="/admin/permissions">
                    <SidebarIcon>
                        <KeyIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Permissions</SidebarLabel>
                </SidebarLink>
                <SidebarLink to="/admin/user-roles">
                    <SidebarIcon>
                        <UsersIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>User Roles</SidebarLabel>
                </SidebarLink>
            </SidebarSection>

            <SidebarDivider />

            {/* Settings & Billing */}
            <SidebarSection>
                <SidebarHeading>Settings & Billing</SidebarHeading>
                <SidebarLink to="/settings">
                    <SidebarIcon>
                        <UserIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Settings</SidebarLabel>
                </SidebarLink>
                <SidebarLink to="/usage">
                    <SidebarIcon>
                        <SpeedometerIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Usage & Limits</SidebarLabel>
                </SidebarLink>
                <SidebarLink to="/billing">
                    <SidebarIcon>
                        <TagIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Billing</SidebarLabel>
                </SidebarLink>
                <SidebarLink to="/audit-log">
                    <SidebarIcon>
                        <FileTextIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>Audit Log</SidebarLabel>
                </SidebarLink>
            </SidebarSection>
        </>
    );
}
