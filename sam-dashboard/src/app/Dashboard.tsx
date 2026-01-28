import {useOpportunities} from "@/hooks";
import {useAuth} from "@/auth";
import {useMemo, useState} from "react";
import {
    BuildingCheckIcon,
    DownloadIcon,
    getOpportunityType,
    Heading,
    InlineAlert,
    isSbirOpportunity,
    LogoutIcon,
    RefreshIcon,
    Text
} from "@/components";
import {exportToCSV} from "@/services";
import {
    AdminRolesPage,
    AlertsPage,
    AllOpportunitiesPage,
    AnalyticsDashboardPage,
    AuditLogPage,
    BillingPage,
    BudgetDetailPage,
    BudgetsPage,
    CertificationDetailPage,
    CertificationsPage,
    ClearancesPage,
    CompliancePage,
    ContactsPage,
    ContractDetailPage,
    ContractorDashboard,
    ContractsPage,
    DashboardPage,
    DocumentsPage,
    FeatureRequestsPage,
    FinancialDashboardPage,
    InteractionsPage,
    InvoiceDetailPage,
    InvoicesPage,
    LaborRatesPage,
    MessagingPage,
    MilestonesPage,
    NAICSPage,
    OrganizationsPage,
    PermissionsPage,
    PipelinePage,
    PresolicationPage,
    ReportBuilderPage,
    ReportsListPage,
    SBIRAwardsPage,
    SBIRPage,
    SbomDashboardPage,
    ScopeTrackerPage,
    SettingsPage,
    SolicitationPage,
    SourcesSoughtPage,
    SprintTrackingPage,
    UsagePage,
    UserRolesPage
} from "@/pages";
import {Navbar, NavbarItem, NavbarSection, NavbarSpacer, StackedLayout, ThemeToggleCompact} from "@components/catalyst";
import {ViewSection} from "@/app/viewsection.ts";
import {RenderSidebar, SidebarIcon} from "@/app/RenderSidebar.tsx";

export function Dashboard() {
    const {opportunities, isLoading, error, ingest} = useOpportunities();
    const {user, logout} = useAuth();
    const [currentSection, setCurrentSection] = useState<ViewSection>('dashboard');
    const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
    const [naicsExpanded, setNaicsExpanded] = useState(false);

    // Calculate counts
    const counts = useMemo(() => {
        const sourcesSought = opportunities.filter(
            (o) => getOpportunityType(o.type) === 'sources-sought'
        ).length;
        const presolicitation = opportunities.filter(
            (o) => getOpportunityType(o.type) === 'presolicitation'
        ).length;
        const solicitation = opportunities.filter(
            (o) => getOpportunityType(o.type) === 'solicitation'
        ).length;
        const sbir = opportunities.filter(isSbirOpportunity).length;

        return {
            total: opportunities.length,
            sourcesSought,
            presolicitation,
            solicitation,
            sbir,
        };
    }, [opportunities]);

    // Get unique NAICS codes with counts
    const naicsGroups = useMemo(() => {
        const groups: Record<string, number> = {};
        opportunities.forEach((o) => {
            if (o.naicsCode !== undefined && o.naicsCode !== null) {
                groups[o.naicsCode] = (groups[o.naicsCode] ?? 0) + 1;
            }
        });
        return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
    }, [opportunities]);

    const handleRefresh = async () => {
        setRefreshMessage(null);
        try {
            await ingest();
            setRefreshMessage('Data refreshed successfully!');
            setTimeout(() => setRefreshMessage(null), 5000);
        } catch {
            setRefreshMessage('Failed to refresh data');
        }
    };

    const handleExport = () => {
        exportToCSV(opportunities);
    };

    const handleLogout = () => {
        logout();
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div>
                    <Text>Loading opportunities...</Text>
                </div>
            );
        }

        if (error !== undefined && error !== null) {
            return (
                <InlineAlert color="error">
                    Error loading data: {error.message}
                </InlineAlert>
            );
        }

        const handleNavigate = (section: string) => setCurrentSection(section as ViewSection);

        switch (currentSection) {
            case 'dashboard':
                return (
                    <DashboardPage opportunities={opportunities} onNavigate={handleNavigate}/>
                );
            case 'all-opportunities':
                return <AllOpportunitiesPage opportunities={opportunities}/>;
            case 'sources-sought':
                return <SourcesSoughtPage opportunities={opportunities}/>;
            case 'presolicitation':
                return <PresolicationPage opportunities={opportunities}/>;
            case 'solicitation':
                return <SolicitationPage opportunities={opportunities}/>;
            case 'sbir':
                return <SBIRPage opportunities={opportunities}/>;
            case 'sbir-awards':
                return <SBIRAwardsPage/>;
            case 'alerts':
                return <AlertsPage/>;
            case 'usage':
                return <UsagePage/>;
            case 'admin-roles':
                return <AdminRolesPage/>;
            case 'admin-permissions':
                return <PermissionsPage/>;
            case 'admin-user-roles':
                return <UserRolesPage/>;
            case 'crm-contacts':
                return <ContactsPage/>;
            case 'crm-organizations':
                return <OrganizationsPage/>;
            case 'crm-interactions':
                return <InteractionsPage/>;
            case 'analytics':
                return <AnalyticsDashboardPage/>;
            case 'reports-list':
                return <ReportsListPage/>;
            case 'reports-builder':
                return <ReportBuilderPage/>;
            case 'portal':
                return <ContractorDashboard/>;
            case 'portal-sprints':
                return <SprintTrackingPage/>;
            case 'portal-features':
                return <FeatureRequestsPage/>;
            case 'portal-messaging':
                return <MessagingPage/>;
            case 'portal-milestones':
                return <MilestonesPage/>;
            case 'portal-scope':
                return <ScopeTrackerPage/>;
            case 'settings':
                return <SettingsPage/>;
            case 'audit-log':
                return <AuditLogPage/>;
            case 'billing':
                return <BillingPage/>;
            case 'documents':
                return <DocumentsPage/>;
            case 'pipeline':
                return <PipelinePage/>;
            case 'contracts':
                return (
                    <ContractsPage
                        onContractSelect={(contractId) => {
                            setSelectedContractId(contractId);
                            setCurrentSection(`contract-${contractId}` as ViewSection);
                        }}
                    />
                );
            case 'financial':
                return <FinancialDashboardPage/>;
            case 'financial-budgets':
                return (
                    <BudgetsPage
                        onViewBudget={(id) => setCurrentSection(`budget-${id}` as ViewSection)}
                    />
                );
            case 'financial-invoices':
                return (
                    <InvoicesPage
                        onViewInvoice={(id) => setCurrentSection(`invoice-${id}` as ViewSection)}
                    />
                );
            case 'financial-labor-rates':
                return <LaborRatesPage/>;
            case 'compliance':
                return (
                    <CompliancePage
                        onNavigate={(section) => setCurrentSection(section as ViewSection)}
                    />
                );
            case 'certifications':
                return (
                    <CertificationsPage
                        onViewDetails={(cert) =>
                            setCurrentSection(`certification-${cert.id}` as ViewSection)
                        }
                    />
                );
            case 'clearances':
                return <ClearancesPage/>;
            case 'sbom':
                return <SbomDashboardPage/>;
            default:
                if (currentSection.startsWith('contract-')) {
                    const contractId = currentSection.replace('contract-', '');
                    return (
                        <ContractDetailPage
                            contractId={contractId}
                            onBack={() => {
                                setSelectedContractId(null);
                                setCurrentSection('contracts');
                            }}
                        />
                    );
                }
                if (currentSection.startsWith('budget-')) {
                    const budgetId = currentSection.replace('budget-', '');
                    return (
                        <BudgetDetailPage
                            budgetId={budgetId}
                            onBack={() => setCurrentSection('financial-budgets')}
                        />
                    );
                }
                if (currentSection.startsWith('invoice-')) {
                    const invoiceId = currentSection.replace('invoice-', '');
                    return (
                        <InvoiceDetailPage
                            invoiceId={invoiceId}
                            onBack={() => setCurrentSection('financial-invoices')}
                        />
                    );
                }
                if (currentSection.startsWith('certification-')) {
                    const certificationId = currentSection.replace('certification-', '');
                    return (
                        <CertificationDetailPage
                            certificationId={certificationId}
                            onBack={() => setCurrentSection('certifications')}
                        />
                    );
                }
                if (currentSection.startsWith('naics-')) {
                    const naicsCode = currentSection.replace('naics-', '');
                    return <NAICSPage naicsCode={naicsCode} opportunities={opportunities}/>;
                }
                return <DashboardPage opportunities={opportunities} onNavigate={handleNavigate}/>;
        }
    };

    // Activity feed for secondary column
    const renderSecondaryColumn = () => {
        // Only show secondary column on dashboard view
        if (currentSection !== 'dashboard') {
            return null;
        }

        // Activity feed items - placeholder data
        const activityItems = [
            {id: 1, title: 'New opportunity', description: 'matched your filters', isAccent: false},
            {id: 2, title: 'Deadline approaching', description: 'for 3 opportunities', isAccent: false},
            {id: 3, title: 'Data refreshed', description: 'successfully', isAccent: true},
        ];

        return (
            <aside>
                <div>
                    <Heading level={2}>Activity Feed</Heading>
                    <Text>Recent updates across your pipeline</Text>
                    <ul role="list">
                        {activityItems.map((item, index) => (
                            <li key={item.id}>
                                {index < activityItems.length - 1 && (
                                    <div>
                                        <div/>
                                    </div>
                                )}
                                <div>
                                    <div/>
                                </div>
                                <Text>
                                    <span>{item.title}</span>{' '}
                                    {item.description}
                                </Text>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
        );
    };

    // Render the sidebar as content (not as shell prop)


    return (
        <StackedLayout
            navbar={
                <Navbar>
                    <NavbarSection>
                        <NavbarItem>
                            <SidebarIcon>
                                <BuildingCheckIcon size="sm"/>
                            </SidebarIcon>
                            <Text>Insight</Text>
                        </NavbarItem>
                    </NavbarSection>
                    <NavbarSpacer/>
                    <NavbarSection>
                        <NavbarItem onClick={handleRefresh}>
                            <RefreshIcon size="sm"/>
                        </NavbarItem>
                        <NavbarItem onClick={handleExport}>
                            <DownloadIcon size="sm"/>
                        </NavbarItem>
                        <ThemeToggleCompact/>
                        <NavbarItem onClick={handleLogout}>
                            <LogoutIcon size="sm"/>
                        </NavbarItem>
                    </NavbarSection>
                </Navbar>
            }


            desktopSidebar={
                <RenderSidebar
                    user={user}
                    currentSection={currentSection}
                    setCurrentSection={setCurrentSection}
                    counts={counts}
                    naicsExpanded={naicsExpanded}
                    setNaicsExpanded={setNaicsExpanded}
                    naicsGroups={naicsGroups}
                    handleRefresh={handleRefresh}
                    handleExport={handleExport}
                    handleLogout={handleLogout}
                />
            }
            fullWidth
        >
            <div>
                {/* Page content area */}
                <div style={{ marginRight: '30px'}}>
                    {refreshMessage !== null && (
                        <div>
                            <InlineAlert
                                color={refreshMessage.includes('Failed') ? 'error' : 'success'}
                            >
                                {refreshMessage}
                            </InlineAlert>
                        </div>
                    )}
                    {renderContent()}
                </div>

                {/* Secondary column (activity feed) */}
                {renderSecondaryColumn()}
            </div>
        </StackedLayout>
    );
}

export default Dashboard;