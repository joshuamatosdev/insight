import {createFileRoute, Outlet, redirect} from '@tanstack/react-router';
import {useMemo, useState} from 'react';
import {useAuth} from '@/auth';
import {useOpportunities} from '@/hooks';
import {
  BuildingCheckIcon,
  DownloadIcon,
  getOpportunityType,
  isSbirOpportunity,
  LogoutIcon,
  RefreshIcon,
  Text,
} from '@/components';
import {exportToCSV} from '@/services';
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
  StackedLayout,
  ThemeToggleCompact,
} from '@components/catalyst';
import {SidebarIcon} from '@/app/RenderSidebar';
import {AuthenticatedSidebar} from './components/AuthenticatedSidebar';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({context, location}) => {
    if (context.auth.isAuthenticated !== true) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const {user, logout} = useAuth();
  const {opportunities, ingest} = useOpportunities();
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);
  const [naicsExpanded, setNaicsExpanded] = useState(false);

  // Calculate counts for sidebar
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

  return (
    <StackedLayout
      navbar={
        <Navbar>
          <NavbarSection>
            <NavbarItem>
              <SidebarIcon>
                <BuildingCheckIcon size="sm" />
              </SidebarIcon>
              <Text>Insight</Text>
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
      desktopSidebar={
        <AuthenticatedSidebar
          user={user}
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
        {refreshMessage !== null && (
          <div className="mb-4">
            <div
              className={`p-3 rounded ${
                refreshMessage.includes('Failed')
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {refreshMessage}
            </div>
          </div>
        )}
        <div style={{marginRight: '30px'}}>
          <Outlet />
        </div>
      </div>
    </StackedLayout>
  );
}
