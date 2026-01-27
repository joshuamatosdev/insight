import { useState, useMemo } from 'react';
import {
  StackedLayout,
  Sidebar,
  SidebarHeader,
  SidebarBody,
  SidebarFooter,
  SidebarSection,
  SidebarItem,
  SidebarLabel,
  SidebarHeading,
  SidebarDivider,
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
  Count,
  InlineAlert,
  ThemeToggleCompact,
  Heading,
  Text,
} from './components/catalyst';
import {
  SpeedometerIcon,
  ListUlIcon,
  SearchIcon,
  FileTextIcon,
  FileCheckIcon,
  TagIcon,
  RefreshIcon,
  DownloadIcon,
  BuildingCheckIcon,
  CheckCircleIcon,
  LogoutIcon,
  BellIcon,
  ShieldIcon,
  KeyIcon,
  UsersIcon,
  UserIcon,
  CalendarIcon,
  CurrencyIcon,
  PlusCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from './components/catalyst/primitives';
import { getOpportunityType, isSbirOpportunity } from './components/domain';
import {
  DashboardPage,
  AllOpportunitiesPage,
  SourcesSoughtPage,
  PresolicationPage,
  SolicitationPage,
  NAICSPage,
  SBIRPage,
  SBIRAwardsPage,
  AlertsPage,
  UsagePage,
  AdminRolesPage,
  PermissionsPage,
  UserRolesPage,
  ContactsPage,
  OrganizationsPage,
  InteractionsPage,
  AnalyticsDashboardPage,
  ReportsListPage,
  ReportBuilderPage,
  ContractorDashboard,
  SprintTrackingPage,
  FeatureRequestsPage,
  MessagingPage,
  MilestonesPage,
  ScopeTrackerPage,
  SettingsPage,
  AuditLogPage,
  BillingPage,
  DocumentsPage,
  PipelinePage,
  PipelineDetailPage,
  ProposalPage,
  ContractsPage,
  ContractDetailPage,
  FinancialDashboardPage,
  BudgetsPage,
  BudgetDetailPage,
  InvoicesPage,
  InvoiceDetailPage,
  LaborRatesPage,
  CompliancePage,
  CertificationsPage,
  CertificationDetailPage,
  ClearancesPage,
  SbomDashboardPage,
} from './pages';
import { useOpportunities } from './hooks';
import { exportToCSV } from './services';
import { useAuth } from './auth';

type ViewSection =
  | 'dashboard'
  | 'all-opportunities'
  | 'sources-sought'
  | 'presolicitation'
  | 'solicitation'
  | 'sbir'
  | 'sbir-awards'
  | 'alerts'
  | 'usage'
  | 'admin-roles'
  | 'admin-permissions'
  | 'admin-user-roles'
  | 'crm-contacts'
  | 'crm-organizations'
  | 'crm-interactions'
  | 'analytics'
  | 'reports-list'
  | 'reports-builder'
  | 'portal'
  | 'portal-sprints'
  | 'portal-features'
  | 'portal-messaging'
  | 'portal-milestones'
  | 'portal-scope'
  | 'settings'
  | 'audit-log'
  | 'billing'
  | 'documents'
  | 'pipeline'
  | 'contracts'
  | 'financial'
  | 'financial-budgets'
  | 'financial-invoices'
  | 'financial-labor-rates'
  | 'compliance'
  | 'certifications'
  | 'clearances'
  | 'sbom'
  | `contract-${string}`
  | `budget-${string}`
  | `invoice-${string}`
  | `certification-${string}`
  | `naics-${string}`;

function SidebarIcon({ children }: { children: React.ReactNode }) {
  return (
    <span data-slot="icon" className="size-5">
      {children}
    </span>
  );
}

export function Dashboard() {
  const { opportunities, isLoading, error, ingest } = useOpportunities();
  const { user, logout } = useAuth();
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
        <div className="flex min-h-[300px] items-center justify-center">
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
          <DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />
        );
      case 'all-opportunities':
        return <AllOpportunitiesPage opportunities={opportunities} />;
      case 'sources-sought':
        return <SourcesSoughtPage opportunities={opportunities} />;
      case 'presolicitation':
        return <PresolicationPage opportunities={opportunities} />;
      case 'solicitation':
        return <SolicitationPage opportunities={opportunities} />;
      case 'sbir':
        return <SBIRPage opportunities={opportunities} />;
      case 'sbir-awards':
        return <SBIRAwardsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'usage':
        return <UsagePage />;
      case 'admin-roles':
        return <AdminRolesPage />;
      case 'admin-permissions':
        return <PermissionsPage />;
      case 'admin-user-roles':
        return <UserRolesPage />;
      case 'crm-contacts':
        return <ContactsPage />;
      case 'crm-organizations':
        return <OrganizationsPage />;
      case 'crm-interactions':
        return <InteractionsPage />;
      case 'analytics':
        return <AnalyticsDashboardPage />;
      case 'reports-list':
        return <ReportsListPage />;
      case 'reports-builder':
        return <ReportBuilderPage />;
      case 'portal':
        return <ContractorDashboard />;
      case 'portal-sprints':
        return <SprintTrackingPage />;
      case 'portal-features':
        return <FeatureRequestsPage />;
      case 'portal-messaging':
        return <MessagingPage />;
      case 'portal-milestones':
        return <MilestonesPage />;
      case 'portal-scope':
        return <ScopeTrackerPage />;
      case 'settings':
        return <SettingsPage />;
      case 'audit-log':
        return <AuditLogPage />;
      case 'billing':
        return <BillingPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'pipeline':
        return <PipelinePage />;
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
        return <FinancialDashboardPage />;
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
        return <LaborRatesPage />;
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
        return <ClearancesPage />;
      case 'sbom':
        return <SbomDashboardPage />;
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
          return <NAICSPage naicsCode={naicsCode} opportunities={opportunities} />;
        }
        return <DashboardPage opportunities={opportunities} onNavigate={handleNavigate} />;
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
      { id: 1, title: 'New opportunity', description: 'matched your filters', isAccent: false },
      { id: 2, title: 'Deadline approaching', description: 'for 3 opportunities', isAccent: false },
      { id: 3, title: 'Data refreshed', description: 'successfully', isAccent: true },
    ];

    return (
      <aside className="hidden w-96 shrink-0 border-l border-zinc-200 xl:block dark:border-white/10">
        <div className="sticky top-0 h-screen overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <Heading level={2} className="text-base">Activity Feed</Heading>
          <Text className="mt-1">Recent updates across your pipeline</Text>
          <ul role="list" className="mt-6 space-y-6">
            {activityItems.map((item, index) => (
              <li key={item.id} className="relative flex gap-x-4">
                {index < activityItems.length - 1 && (
                  <div className="absolute -bottom-6 left-0 top-0 flex w-6 justify-center">
                    <div className="w-px bg-zinc-200 dark:bg-zinc-700" />
                  </div>
                )}
                <div className="relative flex size-6 flex-none items-center justify-center bg-white dark:bg-zinc-900">
                  <div className={
                    item.isAccent
                      ? 'size-1.5 rounded-full bg-accent ring-1 ring-accent/50'
                      : 'size-1.5 rounded-full bg-zinc-100 ring-1 ring-zinc-300 dark:bg-zinc-800 dark:ring-zinc-600'
                  } />
                </div>
                <Text className="flex-auto py-0.5 text-xs">
                  <span className="font-medium text-zinc-900 dark:text-white">{item.title}</span>{' '}
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
  const renderSidebar = () => (
    <Sidebar className="hidden w-64 shrink-0 lg:block">
      <SidebarHeader>
            <SidebarSection>
              <SidebarItem>
                <SidebarIcon>
                  <BuildingCheckIcon size="sm" />
                </SidebarIcon>
                <div className="flex flex-col">
                  <SidebarLabel className="font-semibold">Insight</SidebarLabel>
                  <Text className="text-xs">
                    {user !== null ? user.email : 'Dashboard'}
                  </Text>
                </div>
              </SidebarItem>
            </SidebarSection>
          </SidebarHeader>

          <SidebarBody>
            {/* Overview */}
            <SidebarSection>
              <SidebarHeading>Overview</SidebarHeading>
              <SidebarItem
                current={currentSection === 'dashboard'}
                onClick={() => setCurrentSection('dashboard')}
              >
                <SidebarIcon>
                  <SpeedometerIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'all-opportunities'}
                onClick={() => setCurrentSection('all-opportunities')}
              >
                <SidebarIcon>
                  <ListUlIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>All Opportunities</SidebarLabel>
                <Count value={counts.total} />
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'alerts'}
                onClick={() => setCurrentSection('alerts')}
              >
                <SidebarIcon>
                  <BellIcon size="sm" />
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
                  <SearchIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Sources Sought</SidebarLabel>
                <Count value={counts.sourcesSought} />
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'presolicitation'}
                onClick={() => setCurrentSection('presolicitation')}
              >
                <SidebarIcon>
                  <FileTextIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Presolicitation</SidebarLabel>
                <Count value={counts.presolicitation} />
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'solicitation'}
                onClick={() => setCurrentSection('solicitation')}
              >
                <SidebarIcon>
                  <FileCheckIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Solicitation</SidebarLabel>
                <Count value={counts.solicitation} />
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
                  <CheckCircleIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>SBIR / STTR (SAM.gov)</SidebarLabel>
                <Count value={counts.sbir} />
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'sbir-awards'}
                onClick={() => setCurrentSection('sbir-awards')}
              >
                <SidebarIcon>
                  <CheckCircleIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>SBIR.gov Awards</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            {/* By NAICS Code */}
            <SidebarSection>
              <SidebarHeading>By NAICS Code</SidebarHeading>
              <SidebarItem
                onClick={() => setNaicsExpanded(naicsExpanded === false)}
              >
                <SidebarIcon>
                  {naicsExpanded ? (
                    <ChevronDownIcon size="sm" />
                  ) : (
                    <ChevronRightIcon size="sm" />
                  )}
                </SidebarIcon>
                <SidebarLabel>NAICS Codes ({naicsGroups.length})</SidebarLabel>
              </SidebarItem>
              {naicsExpanded === true &&
                naicsGroups.map(([naics, count]) => (
                  <SidebarItem
                    key={naics}
                    current={currentSection === `naics-${naics}`}
                    onClick={() => setCurrentSection(`naics-${naics}`)}
                    className="ml-6"
                  >
                    <SidebarIcon>
                      <TagIcon size="sm" />
                    </SidebarIcon>
                    <SidebarLabel>{naics}</SidebarLabel>
                    <Count value={count} />
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
                  <ListUlIcon size="sm" />
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
                  <FileCheckIcon size="sm" />
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
                  <CurrencyIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Financial Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'financial-budgets' || currentSection.startsWith('budget-')}
                onClick={() => setCurrentSection('financial-budgets')}
              >
                <SidebarIcon>
                  <CurrencyIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Budgets</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'financial-invoices' || currentSection.startsWith('invoice-')}
                onClick={() => setCurrentSection('financial-invoices')}
              >
                <SidebarIcon>
                  <FileTextIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Invoices</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'financial-labor-rates'}
                onClick={() => setCurrentSection('financial-labor-rates')}
              >
                <SidebarIcon>
                  <UsersIcon size="sm" />
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
                  <UsersIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Contacts</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'crm-organizations'}
                onClick={() => setCurrentSection('crm-organizations')}
              >
                <SidebarIcon>
                  <BuildingCheckIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Organizations</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'crm-interactions'}
                onClick={() => setCurrentSection('crm-interactions')}
              >
                <SidebarIcon>
                  <CalendarIcon size="sm" />
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
                  <FileTextIcon size="sm" />
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
                  <FileCheckIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Overview</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'certifications' || currentSection.startsWith('certification-')}
                onClick={() => setCurrentSection('certifications')}
              >
                <SidebarIcon>
                  <FileCheckIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Certifications</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'clearances'}
                onClick={() => setCurrentSection('clearances')}
              >
                <SidebarIcon>
                  <ShieldIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Security Clearances</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'sbom'}
                onClick={() => setCurrentSection('sbom')}
              >
                <SidebarIcon>
                  <ListUlIcon size="sm" />
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
                  <SpeedometerIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Analytics</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'reports-list'}
                onClick={() => setCurrentSection('reports-list')}
              >
                <SidebarIcon>
                  <FileTextIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Reports</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'reports-builder'}
                onClick={() => setCurrentSection('reports-builder')}
              >
                <SidebarIcon>
                  <FileCheckIcon size="sm" />
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
                  <SpeedometerIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Contractor Dashboard</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'portal-sprints'}
                onClick={() => setCurrentSection('portal-sprints')}
              >
                <SidebarIcon>
                  <ListUlIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Sprint Tracking</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'portal-features'}
                onClick={() => setCurrentSection('portal-features')}
              >
                <SidebarIcon>
                  <PlusCircleIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Feature Requests</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'portal-messaging'}
                onClick={() => setCurrentSection('portal-messaging')}
              >
                <SidebarIcon>
                  <BellIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Messaging</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'portal-milestones'}
                onClick={() => setCurrentSection('portal-milestones')}
              >
                <SidebarIcon>
                  <CalendarIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Milestones</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'portal-scope'}
                onClick={() => setCurrentSection('portal-scope')}
              >
                <SidebarIcon>
                  <FileCheckIcon size="sm" />
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
                  <ShieldIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Roles</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'admin-permissions'}
                onClick={() => setCurrentSection('admin-permissions')}
              >
                <SidebarIcon>
                  <KeyIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Permissions</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'admin-user-roles'}
                onClick={() => setCurrentSection('admin-user-roles')}
              >
                <SidebarIcon>
                  <UsersIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>User Roles</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarDivider />

            {/* Settings & Billing */}
            <SidebarSection>
              <SidebarHeading>Settings & Billing</SidebarHeading>
              <SidebarItem
                current={currentSection === 'settings'}
                onClick={() => setCurrentSection('settings')}
              >
                <SidebarIcon>
                  <UserIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'usage'}
                onClick={() => setCurrentSection('usage')}
              >
                <SidebarIcon>
                  <SpeedometerIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Usage & Limits</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'billing'}
                onClick={() => setCurrentSection('billing')}
              >
                <SidebarIcon>
                  <TagIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Billing</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                current={currentSection === 'audit-log'}
                onClick={() => setCurrentSection('audit-log')}
              >
                <SidebarIcon>
                  <FileTextIcon size="sm" />
                </SidebarIcon>
                <SidebarLabel>Audit Log</SidebarLabel>
              </SidebarItem>
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
              <div className="flex items-center justify-between px-2 py-1">
                <Text className="text-sm">Theme</Text>
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

  return (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem>
              <SidebarIcon>
                <BuildingCheckIcon size="sm" />
              </SidebarIcon>
              <Text className="font-semibold">Insight</Text>
            </NavbarItem>
          </NavbarSection>
          <NavbarSpacer />
          <NavbarSection>
            <NavbarItem onClick={handleRefresh}>
              <RefreshIcon size="sm" />
            </NavbarItem>
            <NavbarItem onClick={handleExport}>
              <DownloadIcon size="sm" />
            </NavbarItem>
            <ThemeToggleCompact />
            <NavbarItem onClick={handleLogout}>
              <LogoutIcon size="sm" />
            </NavbarItem>
          </NavbarSection>
        </Navbar>
      }
      sidebar={renderSidebar()}
      fullWidth
    >
      <div className="flex min-h-full">
        {/* Sidebar within content area */}
        {renderSidebar()}

        {/* Page content area */}
        <div className="flex-1">
          {refreshMessage !== null && (
            <div className="mb-4">
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
