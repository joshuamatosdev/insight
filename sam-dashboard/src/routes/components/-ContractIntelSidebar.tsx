/**
 * ContractIntelSidebar - Contract Intelligence navigation
 * For federal/DoD opportunity discovery and pursuit
 */
import {Link, useLocation} from '@tanstack/react-router';
import {
    BellIcon,
    CalendarIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    Count,
    FileCheckIcon,
    FileTextIcon,
    ListUlIcon,
    SearchIcon,
    Sidebar,
    SidebarBody,
    SidebarFooter,
    SidebarHeading,
    SidebarItem,
    SidebarLabel,
    SidebarSection,
    SpeedometerIcon,
    TagIcon,
    ThemeToggleCompact,
    UsersIcon,
} from '@components/catalyst';
import {BuildingCheckIcon, DownloadIcon, LogoutIcon, RefreshIcon, Text} from '@/components';
import {SystemSidebarSections} from './-SystemSidebar';

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

export interface ContractIntelSidebarProps {
    counts: {
        total: number;
        sourcesSought: number;
        presolicitation: number;
        solicitation: number;
        sbir: number;
    };
    naicsExpanded: boolean;
    setNaicsExpanded: (expanded: boolean) => void;
    naicsGroups: [string, number][];
    handleRefresh: () => void;
    handleExport: () => void;
    handleLogout: () => void;
}

export function ContractIntelSidebar({
    counts,
    naicsExpanded,
    setNaicsExpanded,
    naicsGroups,
    handleRefresh,
    handleExport,
    handleLogout,
}: ContractIntelSidebarProps) {
    return (
        <Sidebar>
            <SidebarBody>
                {/* Overview */}
                <SidebarSection>
                    <SidebarHeading>Overview</SidebarHeading>
                    <SidebarLink to="/">
                        <SidebarIcon>
                            <SpeedometerIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Dashboard</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/opportunities">
                        <SidebarIcon>
                            <ListUlIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>All Opportunities</SidebarLabel>
                        <Count value={counts.total} />
                    </SidebarLink>
                    <SidebarLink to="/alerts">
                        <SidebarIcon>
                            <BellIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Alerts</SidebarLabel>
                    </SidebarLink>
                </SidebarSection>

                {/* By Type */}
                <SidebarSection>
                    <SidebarHeading>By Type</SidebarHeading>
                    <SidebarLink to="/opportunities/sources-sought">
                        <SidebarIcon>
                            <SearchIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Sources Sought</SidebarLabel>
                        <Count value={counts.sourcesSought} />
                    </SidebarLink>
                    <SidebarLink to="/opportunities/presolicitation">
                        <SidebarIcon>
                            <FileTextIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Presolicitation</SidebarLabel>
                        <Count value={counts.presolicitation} />
                    </SidebarLink>
                    <SidebarLink to="/opportunities/solicitation">
                        <SidebarIcon>
                            <FileCheckIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Solicitation</SidebarLabel>
                        <Count value={counts.solicitation} />
                    </SidebarLink>
                </SidebarSection>

                {/* Innovation Programs */}
                <SidebarSection>
                    <SidebarHeading>Innovation Programs</SidebarHeading>
                    <SidebarLink to="/sbir">
                        <SidebarIcon>
                            <CheckCircleIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>SBIR / STTR (SAM.gov)</SidebarLabel>
                        <Count value={counts.sbir} />
                    </SidebarLink>
                    <SidebarLink to="/sbir/awards">
                        <SidebarIcon>
                            <CheckCircleIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>SBIR.gov Awards</SidebarLabel>
                    </SidebarLink>
                </SidebarSection>

                {/* By NAICS Code */}
                <SidebarSection>
                    <SidebarHeading>By NAICS Code</SidebarHeading>
                    <SidebarItem onClick={() => setNaicsExpanded(!naicsExpanded)}>
                        <SidebarIcon>
                            {naicsExpanded ? <ChevronDownIcon size="sm" /> : <ChevronRightIcon size="sm" />}
                        </SidebarIcon>
                        <SidebarLabel>NAICS Codes ({naicsGroups.length})</SidebarLabel>
                    </SidebarItem>
                    {naicsExpanded &&
                        naicsGroups.map(([naics, count]) => (
                            <SidebarLink key={naics} to={`/naics/${naics}`}>
                                <SidebarIcon>
                                    <TagIcon size="sm" />
                                </SidebarIcon>
                                <SidebarLabel>{naics}</SidebarLabel>
                                <Count value={count} />
                            </SidebarLink>
                        ))}
                </SidebarSection>

                {/* Pipeline */}
                <SidebarSection>
                    <SidebarHeading>Pipeline</SidebarHeading>
                    <SidebarLink to="/pipeline">
                        <SidebarIcon>
                            <ListUlIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Pipeline Board</SidebarLabel>
                    </SidebarLink>
                </SidebarSection>

                {/* CRM */}
                <SidebarSection>
                    <SidebarHeading>CRM</SidebarHeading>
                    <SidebarLink to="/crm/contacts">
                        <SidebarIcon>
                            <UsersIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Contacts</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/crm/organizations">
                        <SidebarIcon>
                            <BuildingCheckIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Organizations</SidebarLabel>
                    </SidebarLink>
                    <SidebarLink to="/crm/interactions">
                        <SidebarIcon>
                            <CalendarIcon size="sm" />
                        </SidebarIcon>
                        <SidebarLabel>Interactions</SidebarLabel>
                    </SidebarLink>
                </SidebarSection>

                {/* System-level features (shared across all contexts) */}
                <SystemSidebarSections />
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
