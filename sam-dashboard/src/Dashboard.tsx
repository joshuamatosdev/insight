import { useState, useMemo } from 'react';
import {
  Text,
  Badge,
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
} from './components/primitives';
import {
  AppLayout,
  MainContent,
  Sidebar,
  SidebarHeader,
  SidebarSection,
  SidebarNav,
  SidebarNavItem,
  HStack,
  Flex,
  Box,
  Stack,
} from './components/layout';
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

export function Dashboard() {
  const { opportunities, isLoading, error, ingest } = useOpportunities();
  const { user, logout } = useAuth();
  const [currentSection, setCurrentSection] = useState<ViewSection>('dashboard');
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

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
      if (o.naicsCode) {
        groups[o.naicsCode] = (groups[o.naicsCode] || 0) + 1;
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
        <Flex justify="center" align="center" style={{ minHeight: '300px' }}>
          <Text variant="body" color="muted">
            Loading opportunities...
          </Text>
        </Flex>
      );
    }

    if (error) {
      return (
        <Box
          style={{
            padding: 'var(--spacing-8)',
            textAlign: 'center',
            backgroundColor: 'var(--color-danger-light)',
            borderRadius: 'var(--radius-lg)',
          }}
        >
          <Text variant="body" color="danger">
            Error loading data: {error.message}
          </Text>
        </Box>
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

  const sidebar = (
    <Sidebar>
      <SidebarHeader>
        <HStack spacing="var(--spacing-2)" align="center">
          <BuildingCheckIcon size="lg" color="white" />
          <Stack spacing="0">
            <Text variant="heading4" color="white" weight="semibold">
              SAM.gov
            </Text>
            <Text variant="caption" color="white" style={{ opacity: 0.6 }}>
              {user !== null ? user.email : 'Dashboard'}
            </Text>
          </Stack>
        </HStack>
      </SidebarHeader>

      <SidebarSection title="Overview">
        <SidebarNav>
          <SidebarNavItem
            icon={<SpeedometerIcon size="sm" />}
            label="Dashboard"
            isActive={currentSection === 'dashboard'}
            onClick={() => setCurrentSection('dashboard')}
          />
          <SidebarNavItem
            icon={<ListUlIcon size="sm" />}
            label="All Opportunities"
            badge={<Badge variant="primary" size="sm">{counts.total}</Badge>}
            isActive={currentSection === 'all-opportunities'}
            onClick={() => setCurrentSection('all-opportunities')}
          />
          <SidebarNavItem
            icon={<BellIcon size="sm" />}
            label="Alerts"
            isActive={currentSection === 'alerts'}
            onClick={() => setCurrentSection('alerts')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="By Type">
        <SidebarNav>
          <SidebarNavItem
            icon={<SearchIcon size="sm" />}
            label="Sources Sought"
            badge={<Badge variant="info" size="sm">{counts.sourcesSought}</Badge>}
            isActive={currentSection === 'sources-sought'}
            onClick={() => setCurrentSection('sources-sought')}
          />
          <SidebarNavItem
            icon={<FileTextIcon size="sm" />}
            label="Presolicitation"
            badge={<Badge variant="warning" size="sm">{counts.presolicitation}</Badge>}
            isActive={currentSection === 'presolicitation'}
            onClick={() => setCurrentSection('presolicitation')}
          />
          <SidebarNavItem
            icon={<FileCheckIcon size="sm" />}
            label="Solicitation"
            badge={<Badge variant="success" size="sm">{counts.solicitation}</Badge>}
            isActive={currentSection === 'solicitation'}
            onClick={() => setCurrentSection('solicitation')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Innovation Programs">
        <SidebarNav>
          <SidebarNavItem
            icon={<CheckCircleIcon size="sm" />}
            label="SBIR / STTR (SAM.gov)"
            badge={<Badge variant="success" size="sm">{counts.sbir}</Badge>}
            isActive={currentSection === 'sbir'}
            onClick={() => setCurrentSection('sbir')}
          />
          <SidebarNavItem
            icon={<CheckCircleIcon size="sm" />}
            label="SBIR.gov Awards"
            isActive={currentSection === 'sbir-awards'}
            onClick={() => setCurrentSection('sbir-awards')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="By NAICS Code">
        <SidebarNav>
          {naicsGroups.map(([naics, count]) => (
            <SidebarNavItem
              key={naics}
              icon={<TagIcon size="sm" />}
              label={naics}
              badge={<Badge variant="secondary" size="sm">{count}</Badge>}
              isActive={currentSection === `naics-${naics}`}
              onClick={() => setCurrentSection(`naics-${naics}`)}
            />
          ))}
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Pipeline">
        <SidebarNav>
          <SidebarNavItem
            icon={<ListUlIcon size="sm" />}
            label="Pipeline Board"
            isActive={currentSection === 'pipeline'}
            onClick={() => setCurrentSection('pipeline')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Contract Management">
        <SidebarNav>
          <SidebarNavItem
            icon={<FileCheckIcon size="sm" />}
            label="Contracts"
            isActive={currentSection === 'contracts' || currentSection.startsWith('contract-')}
            onClick={() => setCurrentSection('contracts')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Financial">
        <SidebarNav>
          <SidebarNavItem
            icon={<CurrencyIcon size="sm" />}
            label="Financial Dashboard"
            isActive={currentSection === 'financial'}
            onClick={() => setCurrentSection('financial')}
          />
          <SidebarNavItem
            icon={<CurrencyIcon size="sm" />}
            label="Budgets"
            isActive={currentSection === 'financial-budgets' || currentSection.startsWith('budget-')}
            onClick={() => setCurrentSection('financial-budgets')}
          />
          <SidebarNavItem
            icon={<FileTextIcon size="sm" />}
            label="Invoices"
            isActive={currentSection === 'financial-invoices' || currentSection.startsWith('invoice-')}
            onClick={() => setCurrentSection('financial-invoices')}
          />
          <SidebarNavItem
            icon={<UsersIcon size="sm" />}
            label="Labor Rates"
            isActive={currentSection === 'financial-labor-rates'}
            onClick={() => setCurrentSection('financial-labor-rates')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="CRM">
        <SidebarNav>
          <SidebarNavItem
            icon={<UsersIcon size="sm" />}
            label="Contacts"
            isActive={currentSection === 'crm-contacts'}
            onClick={() => setCurrentSection('crm-contacts')}
          />
          <SidebarNavItem
            icon={<BuildingCheckIcon size="sm" />}
            label="Organizations"
            isActive={currentSection === 'crm-organizations'}
            onClick={() => setCurrentSection('crm-organizations')}
          />
          <SidebarNavItem
            icon={<CalendarIcon size="sm" />}
            label="Interactions"
            isActive={currentSection === 'crm-interactions'}
            onClick={() => setCurrentSection('crm-interactions')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Document Management">
        <SidebarNav>
          <SidebarNavItem
            icon={<FileTextIcon size="sm" />}
            label="Documents"
            isActive={currentSection === 'documents'}
            onClick={() => setCurrentSection('documents')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Compliance">
        <SidebarNav>
          <SidebarNavItem
            icon={<FileCheckIcon size="sm" />}
            label="Overview"
            isActive={currentSection === 'compliance'}
            onClick={() => setCurrentSection('compliance')}
          />
          <SidebarNavItem
            icon={<FileCheckIcon size="sm" />}
            label="Certifications"
            isActive={currentSection === 'certifications' || currentSection.startsWith('certification-')}
            onClick={() => setCurrentSection('certifications')}
          />
          <SidebarNavItem
            icon={<ShieldIcon size="sm" />}
            label="Security Clearances"
            isActive={currentSection === 'clearances'}
            onClick={() => setCurrentSection('clearances')}
          />
          <SidebarNavItem
            icon={<ListUlIcon size="sm" />}
            label="SBOM Dashboard"
            isActive={currentSection === 'sbom'}
            onClick={() => setCurrentSection('sbom')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Insights">
        <SidebarNav>
          <SidebarNavItem
            icon={<SpeedometerIcon size="sm" />}
            label="Analytics"
            isActive={currentSection === 'analytics'}
            onClick={() => setCurrentSection('analytics')}
          />
          <SidebarNavItem
            icon={<FileTextIcon size="sm" />}
            label="Reports"
            isActive={currentSection === 'reports-list'}
            onClick={() => setCurrentSection('reports-list')}
          />
          <SidebarNavItem
            icon={<FileCheckIcon size="sm" />}
            label="Report Builder"
            isActive={currentSection === 'reports-builder'}
            onClick={() => setCurrentSection('reports-builder')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Portal">
        <SidebarNav>
          <SidebarNavItem
            icon={<SpeedometerIcon size="sm" />}
            label="Contractor Dashboard"
            isActive={currentSection === 'portal'}
            onClick={() => setCurrentSection('portal')}
          />
          <SidebarNavItem
            icon={<ListUlIcon size="sm" />}
            label="Sprint Tracking"
            isActive={currentSection === 'portal-sprints'}
            onClick={() => setCurrentSection('portal-sprints')}
          />
          <SidebarNavItem
            icon={<PlusCircleIcon size="sm" />}
            label="Feature Requests"
            isActive={currentSection === 'portal-features'}
            onClick={() => setCurrentSection('portal-features')}
          />
          <SidebarNavItem
            icon={<BellIcon size="sm" />}
            label="Messaging"
            isActive={currentSection === 'portal-messaging'}
            onClick={() => setCurrentSection('portal-messaging')}
          />
          <SidebarNavItem
            icon={<CalendarIcon size="sm" />}
            label="Milestones"
            isActive={currentSection === 'portal-milestones'}
            onClick={() => setCurrentSection('portal-milestones')}
          />
          <SidebarNavItem
            icon={<FileCheckIcon size="sm" />}
            label="Scope Tracker"
            isActive={currentSection === 'portal-scope'}
            onClick={() => setCurrentSection('portal-scope')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Administration">
        <SidebarNav>
          <SidebarNavItem
            icon={<ShieldIcon size="sm" />}
            label="Roles"
            isActive={currentSection === 'admin-roles'}
            onClick={() => setCurrentSection('admin-roles')}
          />
          <SidebarNavItem
            icon={<KeyIcon size="sm" />}
            label="Permissions"
            isActive={currentSection === 'admin-permissions'}
            onClick={() => setCurrentSection('admin-permissions')}
          />
          <SidebarNavItem
            icon={<UsersIcon size="sm" />}
            label="User Roles"
            isActive={currentSection === 'admin-user-roles'}
            onClick={() => setCurrentSection('admin-user-roles')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Settings & Billing">
        <SidebarNav>
          <SidebarNavItem
            icon={<UserIcon size="sm" />}
            label="Settings"
            isActive={currentSection === 'settings'}
            onClick={() => setCurrentSection('settings')}
          />
          <SidebarNavItem
            icon={<SpeedometerIcon size="sm" />}
            label="Usage & Limits"
            isActive={currentSection === 'usage'}
            onClick={() => setCurrentSection('usage')}
          />
          <SidebarNavItem
            icon={<TagIcon size="sm" />}
            label="Billing"
            isActive={currentSection === 'billing'}
            onClick={() => setCurrentSection('billing')}
          />
          <SidebarNavItem
            icon={<FileTextIcon size="sm" />}
            label="Audit Log"
            isActive={currentSection === 'audit-log'}
            onClick={() => setCurrentSection('audit-log')}
          />
        </SidebarNav>
      </SidebarSection>

      <SidebarSection title="Actions">
        <SidebarNav>
          <SidebarNavItem
            icon={<RefreshIcon size="sm" />}
            label="Refresh Data"
            onClick={handleRefresh}
          />
          <SidebarNavItem
            icon={<DownloadIcon size="sm" />}
            label="Export CSV"
            onClick={handleExport}
          />
          <SidebarNavItem
            icon={<LogoutIcon size="sm" />}
            label="Sign Out"
            onClick={handleLogout}
          />
        </SidebarNav>
      </SidebarSection>
    </Sidebar>
  );

  return (
    <AppLayout sidebar={sidebar}>
      <MainContent>
        {refreshMessage !== null && (
          <Box
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              marginBottom: 'var(--spacing-4)',
              backgroundColor: refreshMessage.includes('Failed') ? 'var(--color-danger-light)' : 'var(--color-success-light)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${refreshMessage.includes('Failed') ? 'var(--color-danger)' : 'var(--color-success)'}`,
            }}
          >
            <Text
              variant="bodySmall"
              color={refreshMessage.includes('Failed') ? 'danger' : 'success'}
            >
              {refreshMessage}
            </Text>
          </Box>
        )}
        {renderContent()}
      </MainContent>
    </AppLayout>
  );
}

export default Dashboard;
