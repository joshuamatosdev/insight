import {
    BellIcon,
    CalendarIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    Count,
    CurrencyIcon,
    FileCheckIcon,
    FileTextIcon,
    KeyIcon,
    ListUlIcon,
    PlusCircleIcon,
    SearchIcon,
    ShieldIcon,
    Sidebar,
    SidebarBody,
    SidebarDivider,
    SidebarFooter,
    SidebarHeader,
    SidebarHeading,
    SidebarItem,
    SidebarLabel,
    SidebarSection,
    SpeedometerIcon,
    TagIcon,
    ThemeToggleCompact,
    UserIcon,
    UsersIcon
} from "@components/catalyst";
import {BuildingCheckIcon, DownloadIcon, LogoutIcon, RefreshIcon, Text} from "@/components";
import type { ViewSection } from "./viewsection";
import {Dispatch, SetStateAction} from "react";

export function SidebarIcon({children}: { children: React.ReactNode }) {
    return (
        <span data-slot="icon" className="size-5">
      {children}
    </span>
    );
}

export interface RenderSidebarProps {
    user: { email: string } | null;
    currentSection: ViewSection;
    setCurrentSection: Dispatch<SetStateAction<ViewSection>>;
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

export const RenderSidebar = ({
    user,
    currentSection,
    setCurrentSection,
    counts,
    naicsExpanded,
    setNaicsExpanded,
    naicsGroups,
    handleRefresh,
    handleExport,
    handleLogout,
}: RenderSidebarProps) => (
    <Sidebar className="h-full w-64 overflow-y-auto border-r border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
        {/*<SidebarHeader>*/}
        {/*    <SidebarSection>*/}
        {/*        <SidebarItem>*/}
        {/*            <SidebarIcon>*/}
        {/*                <BuildingCheckIcon size="sm"/>*/}
        {/*            </SidebarIcon>*/}
        {/*            <div className="flex flex-col">*/}
        {/*                <SidebarLabel className="font-semibold">Insight</SidebarLabel>*/}
        {/*                <Text className="text-xs">*/}
        {/*                    {user !== null ? user.email : 'Dashboard'}*/}
        {/*                </Text>*/}
        {/*            </div>*/}
        {/*        </SidebarItem>*/}
        {/*    </SidebarSection>*/}
        {/*</SidebarHeader>*/}

        <SidebarBody>
            {/* Overview */}
            <SidebarSection>
                <SidebarHeading>Overview</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'dashboard'}
                    onClick={() => setCurrentSection('dashboard')}
                >
                    <SidebarIcon>
                        <SpeedometerIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Dashboard</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'all-opportunities'}
                    onClick={() => setCurrentSection('all-opportunities')}
                >
                    <SidebarIcon>
                        <ListUlIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>All Opportunities</SidebarLabel>
                    <Count value={counts.total}/>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'alerts'}
                    onClick={() => setCurrentSection('alerts')}
                >
                    <SidebarIcon>
                        <BellIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Alerts</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* By Type */}
            <SidebarSection>
                <SidebarHeading>By Type</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'sources-sought'}
                    onClick={() => setCurrentSection('sources-sought')}
                >
                    <SidebarIcon>
                        <SearchIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Sources Sought</SidebarLabel>
                    <Count value={counts.sourcesSought}/>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'presolicitation'}
                    onClick={() => setCurrentSection('presolicitation')}
                >
                    <SidebarIcon>
                        <FileTextIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Presolicitation</SidebarLabel>
                    <Count value={counts.presolicitation}/>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'solicitation'}
                    onClick={() => setCurrentSection('solicitation')}
                >
                    <SidebarIcon>
                        <FileCheckIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Solicitation</SidebarLabel>
                    <Count value={counts.solicitation}/>
                </SidebarItem>
            </SidebarSection>

            {/* Innovation Programs */}
            <SidebarSection>
                <SidebarHeading>Innovation Programs</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'sbir'}
                    onClick={() => setCurrentSection('sbir')}
                >
                    <SidebarIcon>
                        <CheckCircleIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>SBIR / STTR (SAM.gov)</SidebarLabel>
                    <Count value={counts.sbir}/>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'sbir-awards'}
                    onClick={() => setCurrentSection('sbir-awards')}
                >
                    <SidebarIcon>
                        <CheckCircleIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>SBIR.gov Awards</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* By NAICS Code */}
            <SidebarSection>
                <SidebarHeading>By NAICS Code</SidebarHeading>
                <SidebarItem
                    onClick={() => setNaicsExpanded(!naicsExpanded)}
                >
                    <SidebarIcon>
                        {naicsExpanded ? (
                            <ChevronDownIcon size="sm"/>
                        ) : (
                            <ChevronRightIcon size="sm"/>
                        )}
                    </SidebarIcon>
                    <SidebarLabel>NAICS Codes ({naicsGroups.length})</SidebarLabel>
                </SidebarItem>
                {naicsExpanded &&
                    naicsGroups.map(([naics, count]) => (
                        <SidebarItem
                            key={naics}
                            current={currentSection === `naics-${naics}`}
                            onClick={() => setCurrentSection(`naics-${naics}`)}
                            className="ml-6"
                        >
                            <SidebarIcon>
                                <TagIcon size="sm"/>
                            </SidebarIcon>
                            <SidebarLabel>{naics}</SidebarLabel>
                            <Count value={count}/>
                        </SidebarItem>
                    ))}
            </SidebarSection>

            {/* Pipeline */}
            <SidebarSection>
                <SidebarHeading>Pipeline</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'pipeline'}
                    onClick={() => setCurrentSection('pipeline')}
                >
                    <SidebarIcon>
                        <ListUlIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Pipeline Board</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* Contract Management */}
            <SidebarSection>
                <SidebarHeading>Contract Management</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'contracts' || currentSection.startsWith('contract-')}
                    onClick={() => setCurrentSection('contracts')}
                >
                    <SidebarIcon>
                        <FileCheckIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Contracts</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* Financial */}
            <SidebarSection>
                <SidebarHeading>Financial</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'financial'}
                    onClick={() => setCurrentSection('financial')}
                >
                    <SidebarIcon>
                        <CurrencyIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Financial Dashboard</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'financial-budgets' || currentSection.startsWith('budget-')}
                    onClick={() => setCurrentSection('financial-budgets')}
                >
                    <SidebarIcon>
                        <CurrencyIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Budgets</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'financial-invoices' || currentSection.startsWith('invoice-')}
                    onClick={() => setCurrentSection('financial-invoices')}
                >
                    <SidebarIcon>
                        <FileTextIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Invoices</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'financial-labor-rates'}
                    onClick={() => setCurrentSection('financial-labor-rates')}
                >
                    <SidebarIcon>
                        <UsersIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Labor Rates</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* CRM */}
            <SidebarSection>
                <SidebarHeading>CRM</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'crm-contacts'}
                    onClick={() => setCurrentSection('crm-contacts')}
                >
                    <SidebarIcon>
                        <UsersIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Contacts</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'crm-organizations'}
                    onClick={() => setCurrentSection('crm-organizations')}
                >
                    <SidebarIcon>
                        <BuildingCheckIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Organizations</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'crm-interactions'}
                    onClick={() => setCurrentSection('crm-interactions')}
                >
                    <SidebarIcon>
                        <CalendarIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Interactions</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* Document Management */}
            <SidebarSection>
                <SidebarHeading>Document Management</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'documents'}
                    onClick={() => setCurrentSection('documents')}
                >
                    <SidebarIcon>
                        <FileTextIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Documents</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* Compliance */}
            <SidebarSection>
                <SidebarHeading>Compliance</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'compliance'}
                    onClick={() => setCurrentSection('compliance')}
                >
                    <SidebarIcon>
                        <FileCheckIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Overview</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'certifications' || currentSection.startsWith('certification-')}
                    onClick={() => setCurrentSection('certifications')}
                >
                    <SidebarIcon>
                        <FileCheckIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Certifications</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'clearances'}
                    onClick={() => setCurrentSection('clearances')}
                >
                    <SidebarIcon>
                        <ShieldIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Security Clearances</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'sbom'}
                    onClick={() => setCurrentSection('sbom')}
                >
                    <SidebarIcon>
                        <ListUlIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>SBOM Dashboard</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* Insights */}
            <SidebarSection>
                <SidebarHeading>Insights</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'analytics'}
                    onClick={() => setCurrentSection('analytics')}
                >
                    <SidebarIcon>
                        <SpeedometerIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Analytics</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'reports-list'}
                    onClick={() => setCurrentSection('reports-list')}
                >
                    <SidebarIcon>
                        <FileTextIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Reports</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'reports-builder'}
                    onClick={() => setCurrentSection('reports-builder')}
                >
                    <SidebarIcon>
                        <FileCheckIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Report Builder</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* Portal */}
            <SidebarSection>
                <SidebarHeading>Portal</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'portal'}
                    onClick={() => setCurrentSection('portal')}
                >
                    <SidebarIcon>
                        <SpeedometerIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Contractor Dashboard</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'portal-sprints'}
                    onClick={() => setCurrentSection('portal-sprints')}
                >
                    <SidebarIcon>
                        <ListUlIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Sprint Tracking</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'portal-features'}
                    onClick={() => setCurrentSection('portal-features')}
                >
                    <SidebarIcon>
                        <PlusCircleIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Feature Requests</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'portal-messaging'}
                    onClick={() => setCurrentSection('portal-messaging')}
                >
                    <SidebarIcon>
                        <BellIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Messaging</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'portal-milestones'}
                    onClick={() => setCurrentSection('portal-milestones')}
                >
                    <SidebarIcon>
                        <CalendarIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Milestones</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'portal-scope'}
                    onClick={() => setCurrentSection('portal-scope')}
                >
                    <SidebarIcon>
                        <FileCheckIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Scope Tracker</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            {/* Administration */}
            <SidebarSection>
                <SidebarHeading>Administration</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'admin-roles'}
                    onClick={() => setCurrentSection('admin-roles')}
                >
                    <SidebarIcon>
                        <ShieldIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Roles</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'admin-permissions'}
                    onClick={() => setCurrentSection('admin-permissions')}
                >
                    <SidebarIcon>
                        <KeyIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Permissions</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'admin-user-roles'}
                    onClick={() => setCurrentSection('admin-user-roles')}
                >
                    <SidebarIcon>
                        <UsersIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>User Roles</SidebarLabel>
                </SidebarItem>
            </SidebarSection>

            <SidebarDivider/>

            {/* Settings & Billing */}
            <SidebarSection>
                <SidebarHeading>Settings & Billing</SidebarHeading>
                <SidebarItem
                    current={currentSection === 'settings'}
                    onClick={() => setCurrentSection('settings')}
                >
                    <SidebarIcon>
                        <UserIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Settings</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'usage'}
                    onClick={() => setCurrentSection('usage')}
                >
                    <SidebarIcon>
                        <SpeedometerIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Usage & Limits</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'billing'}
                    onClick={() => setCurrentSection('billing')}
                >
                    <SidebarIcon>
                        <TagIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Billing</SidebarLabel>
                </SidebarItem>
                <SidebarItem
                    current={currentSection === 'audit-log'}
                    onClick={() => setCurrentSection('audit-log')}
                >
                    <SidebarIcon>
                        <FileTextIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Audit Log</SidebarLabel>
                </SidebarItem>
            </SidebarSection>
        </SidebarBody>

        <SidebarFooter>
            <SidebarSection>
                <SidebarItem onClick={handleRefresh}>
                    <SidebarIcon>
                        <RefreshIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Refresh Data</SidebarLabel>
                </SidebarItem>
                <SidebarItem onClick={handleExport}>
                    <SidebarIcon>
                        <DownloadIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Export CSV</SidebarLabel>
                </SidebarItem>
                <div className="flex items-center justify-between px-2 py-1">
                    <Text className="text-sm">Theme</Text>
                    <ThemeToggleCompact/>
                </div>
                <SidebarItem onClick={handleLogout}>
                    <SidebarIcon>
                        <LogoutIcon size="sm"/>
                    </SidebarIcon>
                    <SidebarLabel>Sign Out</SidebarLabel>
                </SidebarItem>
            </SidebarSection>
        </SidebarFooter>
    </Sidebar>
);