import { useState, useEffect, useMemo, useCallback } from 'react';
import { Text, Badge, Button, CheckCircleIcon, RefreshIcon, SearchIcon, Input } from '../components/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Box,
} from '../components/layout';
import {
  SbirAward,
  SbirStats,
  formatAwardAmount,
  getAgencyFullName,
  StatCard,
  StatsGrid,
} from '../components/domain';
import { fetchSbirAwards, fetchSbirStats, triggerSbirGovIngest, searchSbirAwards } from '../services';

export function SBIRAwardsPage() {
  const [awards, setAwards] = useState<SbirAward[]>([]);
  const [stats, setStats] = useState<SbirStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isIngesting, setIsIngesting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [agencyFilter, setAgencyFilter] = useState<string>('');
  const [phaseFilter, setPhaseFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [awardsData, statsData] = await Promise.all([
        fetchSbirAwards(agencyFilter || undefined, phaseFilter || undefined),
        fetchSbirStats(),
      ]);
      setAwards(awardsData);
      setStats(statsData);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  }, [agencyFilter, phaseFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleIngest = async () => {
    try {
      setIsIngesting(true);
      setSuccessMessage(null);
      setIngestError(null);
      await triggerSbirGovIngest();
      await loadData();
      setSuccessMessage('SBIR.gov data ingested successfully!');
      // Auto-clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch {
      setIngestError('Failed to ingest SBIR.gov data');
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }
    try {
      setIsLoading(true);
      const results = await searchSbirAwards(searchQuery);
      setAwards(results);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Search failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAwards = useMemo(() => {
    return awards;
  }, [awards]);

  if (isLoading && awards.length === 0) {
    return (
      <Section id="sbir-awards">
        <SectionHeader title="SBIR.gov Awards" icon={<CheckCircleIcon size="lg" />} />
        <Box className="p-8 text-center">
          <Text variant="body" color="muted">Loading SBIR.gov awards...</Text>
        </Box>
      </Section>
    );
  }

  if (error !== null && awards.length === 0) {
    return (
      <Section id="sbir-awards">
        <SectionHeader title="SBIR.gov Awards" icon={<CheckCircleIcon size="lg" />} />
        <Card>
          <CardBody>
            <Text variant="body" color="danger">Error: {error.message}</Text>
            <Button onClick={handleIngest} className="mt-4">
              Fetch from SBIR.gov
            </Button>
          </CardBody>
        </Card>
      </Section>
    );
  }

  return (
    <Section id="sbir-awards">
      <SectionHeader title="SBIR.gov Awards Database" icon={<CheckCircleIcon size="lg" />} />

      {stats !== null && (
        <StatsGrid columns={5}>
          <StatCard variant="primary" value={stats.totalAwards} label="Total Awards" />
          <StatCard variant="info" value={stats.sbirCount} label="SBIR" />
          <StatCard variant="success" value={stats.sttrCount} label="STTR" />
          <StatCard variant="warning" value={stats.agencies.length} label="Agencies" />
          <StatCard variant="secondary" value={stats.phases.length} label="Phases" />
        </StatsGrid>
      )}

      <Card>
        <CardHeader>
          <HStack justify="between" align="center" className="flex-wrap gap-4">
            <HStack spacing="var(--spacing-2)">
              <select
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
                aria-label="Filter by agency"
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <option value="">All Agencies</option>
                {(stats?.agencies ?? []).map((a) => (
                  <option key={a} value={a}>{a} - {getAgencyFullName(a)}</option>
                ))}
              </select>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                aria-label="Filter by phase"
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <option value="">All Phases</option>
                {(stats?.phases ?? []).map((p) => (
                  <option key={p} value={p}>Phase {p}</option>
                ))}
              </select>
            </HStack>

            <HStack spacing="var(--spacing-2)">
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                style={{ width: '200px' }}
              />
              <Button variant="outline" size="sm" onClick={handleSearch}>
                <SearchIcon size="sm" />
              </Button>
            </HStack>

            <Button
              variant="primary"
              size="sm"
              onClick={handleIngest}
              disabled={isIngesting}
              leftIcon={<RefreshIcon size="sm" />}
            >
              {isIngesting ? 'Fetching...' : 'Fetch from SBIR.gov'}
            </Button>
          </HStack>
        </CardHeader>
        {successMessage !== null && (
          <Box className="p-3 bg-success-bg border-b border-success">
            <Text variant="bodySmall" color="success">{successMessage}</Text>
          </Box>
        )}
        {ingestError !== null && (
          <Box className="p-3 bg-danger-bg border-b border-danger">
            <Text variant="bodySmall" color="danger">{ingestError}</Text>
          </Box>
        )}
        <CardBody padding="none">
          {filteredAwards.length === 0 ? (
            <Box className="p-8 text-center">
              <Text variant="body" color="muted">
                No SBIR awards found. Click "Fetch from SBIR.gov" to load data.
              </Text>
            </Box>
          ) : (
            <Box style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="bg-surface-secondary sticky top-0">
                    <th className="p-3 text-left border-b border-border">
                      <Text variant="caption" weight="semibold">Award</Text>
                    </th>
                    <th className="p-3 text-left border-b border-border">
                      <Text variant="caption" weight="semibold">Firm</Text>
                    </th>
                    <th className="p-3 text-center border-b border-border">
                      <Text variant="caption" weight="semibold">Phase</Text>
                    </th>
                    <th className="p-3 text-center border-b border-border">
                      <Text variant="caption" weight="semibold">Agency</Text>
                    </th>
                    <th className="p-3 text-right border-b border-border">
                      <Text variant="caption" weight="semibold">Amount</Text>
                    </th>
                    <th className="p-3 text-center border-b border-border">
                      <Text variant="caption" weight="semibold">Year</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAwards.map((award) => (
                    <tr key={award.id} className="border-b border-border-light">
                      <td className="p-3 max-w-xs">
                        <a
                          href={award.awardLink || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none' }}
                        >
                          <Text variant="bodySmall" style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}>
                            {award.awardTitle || 'Untitled'}
                          </Text>
                        </a>
                        <HStack spacing="var(--spacing-1)" className="mt-1">
                          {award.isSbir === true && <Badge variant="info" size="sm">SBIR</Badge>}
                          {award.isSttr === true && <Badge variant="success" size="sm">STTR</Badge>}
                        </HStack>
                      </td>
                      <td className="p-3">
                        <Text variant="bodySmall">{award.firm || 'N/A'}</Text>
                        <Text variant="caption" color="muted">
                          {award.city}, {award.state}
                        </Text>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="warning" size="sm">Phase {award.phase}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="secondary" size="sm">{award.agency}</Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Text variant="bodySmall" weight="semibold">
                          {formatAwardAmount(award.awardAmount)}
                        </Text>
                      </td>
                      <td className="p-3 text-center">
                        <Text variant="bodySmall">{award.awardYear || 'N/A'}</Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </CardBody>
      </Card>

      <Text variant="caption" color="muted" className="mt-4 text-center block">
        Data source: <a href="https://www.sbir.gov" target="_blank" rel="noopener noreferrer">SBIR.gov</a> -
        Small Business Innovation Research / Small Business Technology Transfer
      </Text>
    </Section>
  );
}

export default SBIRAwardsPage;
