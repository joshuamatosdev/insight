/**
 * PortalSidebar - Contract execution and client collaboration navigation
 * For managing active contracts, deliverables, compliance, and communication
 */
import {Link, useLocation} from '@tanstack/react-router';
import {
    BellIcon,
    CalendarIcon,
    CheckCircleIcon,
    Count,
    CurrencyIcon,
    FileCheckIcon,
    FileTextIcon,
    KeyIcon,
    ListUlIcon,
    PlusCircleIcon,
    ShieldIcon,
    Sidebar,
    SidebarBody,
    SidebarDivider,
    SidebarFooter,
    SidebarHeading,
    SidebarItem,
    SidebarLabel,
    SidebarSection,
    SpeedometerIcon,
    TagIcon,
    ThemeToggleCompact,
    UserIcon,
    UsersIcon,
} from '@components/catalyst';
import {DownloadIcon, LogoutIcon, RefreshIcon, Text} from '@/components';

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

export interface PortalSidebarProps {
    handleRefresh: () => void;
    handleExport: () => void;
    handleLogout: () => void;
}

export function PortalSidebar({handleRefresh, handleExport, handleLogout}: PortalSidebarProps) {
    return (
        <Sidebar>
            <SidebarBody>
                {/* Project Delivery */}
                <SidebarSection>
                    <SidebarHeading>Project Delivery</SidebarHeading>
                    <SidebarLink to="/portal">
                        <SidebarIcon>
                            <SpeedometerIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Contractor Dashboard</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/portal/sprints">
                        <SidebarIcon>
                            <ListUlIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Sprint Tracking</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/portal/milestones">
                        <SidebarIcon>
                            <CalendarIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Milestones</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/portal/scope">
                        <SidebarIcon>
                            <FileCheckIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Scope Tracker</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/portal/messaging">
                        <SidebarIcon>
                            <BellIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Messaging</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/portal/features">
                        <SidebarIcon>
                            <PlusCircleIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Feature Requests</SidebarLabel>
                    </SidebarLink>
                </SidebarSection>

                {/* Contract Management */}
                <SidebarSection>
                    <SidebarHeading>Contract Management</SidebarHeading>
                    <SidebarLink to="/contracts">
                        <SidebarIcon>
                            <FileCheckIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Contracts</SidebarLabel>
                    </SidebarLink>
                </SidebarSection>

                {/* Financial */}
                <SidebarSection>
                    <SidebarHeading>Financial</SidebarHeading>
                    <SidebarLink to="/financial">
                        <SidebarIcon>
                            <CurrencyIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Financial Dashboard</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/financial/budgets">
                        <SidebarIcon>
                            <CurrencyIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Budgets</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/financial/invoices">
                        <SidebarIcon>
                            <FileTextIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Invoices</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/financial/labor-rates">
                        <SidebarIcon>
                            <UsersIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Labor Rates</SidebarLabel>
                    </SidebarLink>
                </SidebarSection>

                {/* Compliance */}
                <SidebarSection>
                    <SidebarHeading>Compliance</SidebarHeading>
                    <SidebarLink to="/compliance">
                        <SidebarIcon>
                            <FileCheckIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Overview</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/compliance/certifications">
                        <SidebarIcon>
                            <CheckCircleIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Certifications</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/compliance/clearances">
                        <SidebarIcon>
                            <ShieldIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Security Clearances</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/compliance/sbom">
                        <SidebarIcon>
                            <ListUlIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>SBOM Dashboard</SidebarLabel>
                    </SidebarLink>
                </SidebarSection>

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
            </SidebarBody>

            <SidebarFooter>
                <SidebarSection>
                    <SidebarItem onClick={handleRefresh}>
                        <SidebarIcon>
                            <RefreshIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Refresh Data</SidebarLabel>
                    </SidebarItem>
                    <SidebarItem onClick={handleExport}>
                        <SidebarIcon>
                            <DownloadIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Export CSV</SidebarLabel>
                    </SidebarItem>
                    <div>
                        <Text>Theme</Text>
                        <ThemeToggleCompact />
                    </div>
                    <SidebarItem onClick={handleLogout}>
                        <SidebarIcon>
                            <LogoutIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Sign Out</SidebarLabel>
                    </SidebarItem>
                </SidebarSection>
            </SidebarFooter>
        </Sidebar>
    );
}
