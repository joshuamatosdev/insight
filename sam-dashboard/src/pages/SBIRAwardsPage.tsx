import { useState, useEffect, useMemo } from 'react';
import { Text, Badge, Button, CheckCircleIcon, RefreshIcon, SearchIcon, Input } from '../components/primitives';
import {
  Section,
  SectionHeader,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Stack,
  Grid,
  GridItem,
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

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [awardsData, statsData] = await Promise.all([
        fetchSbirAwards(agencyFilter || undefined, phaseFilter || undefined),
        fetchSbirStats(),
      ]);
      setAwards(awardsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [agencyFilter, phaseFilter]);

  const handleIngest = async () => {
    try {
      setIsIngesting(true);
      await triggerSbirGovIngest();
      await loadData();
      alert('SBIR.gov data ingested successfully!');
    } catch (err) {
      alert('Failed to ingest SBIR.gov data');
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAwards = useMemo(() => {
    return awards;
  }, [awards]);

  if (isLoading && !awards.length) {
    return (
      <Section id="sbir-awards">
        <SectionHeader title="SBIR.gov Awards" icon={<CheckCircleIcon size="lg" />} />
        <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
          <Text variant="body" color="muted">Loading SBIR.gov awards...</Text>
        </div>
      </Section>
    );
  }

  if (error && !awards.length) {
    return (
      <Section id="sbir-awards">
        <SectionHeader title="SBIR.gov Awards" icon={<CheckCircleIcon size="lg" />} />
        <Card>
          <CardBody>
            <Text variant="body" color="danger">Error: {error.message}</Text>
            <Button onClick={handleIngest} style={{ marginTop: 'var(--spacing-4)' }}>
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

      {stats && (
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
          <HStack justify="between" align="center" style={{ flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
            <HStack spacing="var(--spacing-2)">
              <select
                value={agencyFilter}
                onChange={(e) => setAgencyFilter(e.target.value)}
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <option value="">All Agencies</option>
                {stats?.agencies.map((a) => (
                  <option key={a} value={a}>{a} - {getAgencyFullName(a)}</option>
                ))}
              </select>
              <select
                value={phaseFilter}
                onChange={(e) => setPhaseFilter(e.target.value)}
                style={{
                  padding: 'var(--spacing-2) var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <option value="">All Phases</option>
                {stats?.phases.map((p) => (
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
        <CardBody padding="none">
          {filteredAwards.length === 0 ? (
            <div style={{ padding: 'var(--spacing-8)', textAlign: 'center' }}>
              <Text variant="body" color="muted">
                No SBIR awards found. Click "Fetch from SBIR.gov" to load data.
              </Text>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-secondary)', position: 'sticky', top: 0 }}>
                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                      <Text variant="caption" weight="semibold">Award</Text>
                    </th>
                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'left', borderBottom: '1px solid var(--color-border)' }}>
                      <Text variant="caption" weight="semibold">Firm</Text>
                    </th>
                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
                      <Text variant="caption" weight="semibold">Phase</Text>
                    </th>
                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
                      <Text variant="caption" weight="semibold">Agency</Text>
                    </th>
                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'right', borderBottom: '1px solid var(--color-border)' }}>
                      <Text variant="caption" weight="semibold">Amount</Text>
                    </th>
                    <th style={{ padding: 'var(--spacing-3)', textAlign: 'center', borderBottom: '1px solid var(--color-border)' }}>
                      <Text variant="caption" weight="semibold">Year</Text>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAwards.map((award) => (
                    <tr key={award.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                      <td style={{ padding: 'var(--spacing-3)', maxWidth: '300px' }}>
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
                        <HStack spacing="var(--spacing-1)" style={{ marginTop: 'var(--spacing-1)' }}>
                          {award.isSbir && <Badge variant="info" size="sm">SBIR</Badge>}
                          {award.isSttr && <Badge variant="success" size="sm">STTR</Badge>}
                        </HStack>
                      </td>
                      <td style={{ padding: 'var(--spacing-3)' }}>
                        <Text variant="bodySmall">{award.firm || 'N/A'}</Text>
                        <Text variant="caption" color="muted">
                          {award.city}, {award.state}
                        </Text>
                      </td>
                      <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                        <Badge variant="warning" size="sm">Phase {award.phase}</Badge>
                      </td>
                      <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                        <Badge variant="secondary" size="sm">{award.agency}</Badge>
                      </td>
                      <td style={{ padding: 'var(--spacing-3)', textAlign: 'right' }}>
                        <Text variant="bodySmall" weight="semibold">
                          {formatAwardAmount(award.awardAmount)}
                        </Text>
                      </td>
                      <td style={{ padding: 'var(--spacing-3)', textAlign: 'center' }}>
                        <Text variant="bodySmall">{award.awardYear || 'N/A'}</Text>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>

      <Text variant="caption" color="muted" style={{ marginTop: 'var(--spacing-4)', textAlign: 'center', display: 'block' }}>
        Data source: <a href="https://www.sbir.gov" target="_blank" rel="noopener noreferrer">SBIR.gov</a> - 
        Small Business Innovation Research / Small Business Technology Transfer
      </Text>
    </Section>
  );
}

export default SBIRAwardsPage;
