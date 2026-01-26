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
} from './pages';
import { useOpportunities } from './hooks';
import { exportToCSV } from './services';

type ViewSection =
  | 'dashboard'
  | 'all-opportunities'
  | 'sources-sought'
  | 'presolicitation'
  | 'solicitation'
  | 'sbir'
  | 'sbir-awards'
  | `naics-${string}`;

function App() {
  const { opportunities, isLoading, error, ingest } = useOpportunities();
  const [currentSection, setCurrentSection] = useState<ViewSection>('dashboard');
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

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
      default:
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
              Opportunities Dashboard
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

export default App;
