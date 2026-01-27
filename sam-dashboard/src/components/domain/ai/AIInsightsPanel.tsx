import { useState, useEffect } from 'react';
import { Card, CardBody, Stack, Flex, Box } from '../../layout';
import { Text, Button } from '../../primitives';
import {
  AISummary,
  AIFitScore,
  AIRiskAssessment,
  getOpportunitySummary,
  getFitScore,
  getRiskAssessment,
} from '../../../services/aiService';

interface AIInsightsPanelProps {
  opportunityId: string;
}

type Tab = 'summary' | 'fit' | 'risk';

/**
 * Panel displaying AI-generated insights for an opportunity.
 */
export function AIInsightsPanel({ opportunityId }: AIInsightsPanelProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [fitScore, setFitScore] = useState<AIFitScore | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<AIRiskAssessment | null>(null);

  const loadData = async (tab: Tab) => {
    setLoading(true);
    setError(null);

    try {
      switch (tab) {
        case 'summary':
          if (summary === null) {
            const data = await getOpportunitySummary(opportunityId);
            setSummary(data);
          }
          break;
        case 'fit':
          if (fitScore === null) {
            const data = await getFitScore(opportunityId);
            setFitScore(data);
          }
          break;
        case 'risk':
          if (riskAssessment === null) {
            const data = await getRiskAssessment(opportunityId);
            setRiskAssessment(data);
          }
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, opportunityId]);

  const renderScoreBar = (score: number, label: string) => (
    <Stack spacing="var(--spacing-1)">
      <Flex justify="space-between">
        <Text variant="caption">{label}</Text>
        <Text variant="caption" style={{ fontWeight: 600 }}>{score}%</Text>
      </Flex>
      <Box
        style={{
          height: '8px',
          backgroundColor: 'var(--color-gray-200)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <Box
          style={{
            width: `${score}%`,
            height: '100%',
            backgroundColor: score >= 70 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)',
            transition: 'width 0.3s ease',
          }}
        />
      </Box>
    </Stack>
  );

  const renderSummary = () => {
    if (summary === null) return null;
    return (
      <Stack spacing="var(--spacing-4)">
        <Box>
          <Text variant="body" style={{ fontWeight: 600 }}>Executive Summary</Text>
          <Text variant="body">{summary.executiveSummary}</Text>
        </Box>
        <Box>
          <Text variant="body" style={{ fontWeight: 600 }}>Key Points</Text>
          <Stack spacing="var(--spacing-1)">
            {summary.keyPoints.map((point, i) => (
              <Text key={i} variant="caption">• {point}</Text>
            ))}
          </Stack>
        </Box>
        <Text variant="caption" color="muted">
          Confidence: {summary.confidence}%
        </Text>
      </Stack>
    );
  };

  const renderFitScore = () => {
    if (fitScore === null) return null;
    return (
      <Stack spacing="var(--spacing-4)">
        <Flex align="center" gap="md">
          <Box
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: fitScore.overallScore >= 70 ? 'var(--color-success)' : 'var(--color-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
            }}
          >
            {fitScore.overallScore}
          </Box>
          <Stack spacing="0">
            <Text variant="heading4">Overall Fit Score</Text>
            <Text variant="caption" color="muted">{fitScore.reasoning}</Text>
          </Stack>
        </Flex>

        <Stack spacing="var(--spacing-2)">
          {renderScoreBar(fitScore.naicsScore, 'NAICS Match')}
          {renderScoreBar(fitScore.pastPerformanceScore, 'Past Performance')}
          {renderScoreBar(fitScore.certificationScore, 'Certifications')}
          {renderScoreBar(fitScore.geographicScore, 'Geographic')}
        </Stack>

        <Box>
          <Text variant="body" style={{ fontWeight: 600, color: 'var(--color-success)' }}>Strengths</Text>
          <Stack spacing="var(--spacing-1)">
            {fitScore.strengths.map((s, i) => (
              <Text key={i} variant="caption">✓ {s}</Text>
            ))}
          </Stack>
        </Box>

        <Box>
          <Text variant="body" style={{ fontWeight: 600, color: 'var(--color-danger)' }}>Gaps</Text>
          <Stack spacing="var(--spacing-1)">
            {fitScore.weaknesses.map((w, i) => (
              <Text key={i} variant="caption">• {w}</Text>
            ))}
          </Stack>
        </Box>
      </Stack>
    );
  };

  const renderRiskAssessment = () => {
    if (riskAssessment === null) return null;
    const riskColor = {
      LOW: 'var(--color-success)',
      MEDIUM: 'var(--color-warning)',
      HIGH: 'var(--color-danger)',
      CRITICAL: 'var(--color-danger)',
    };
    return (
      <Stack spacing="var(--spacing-4)">
        <Flex align="center" gap="sm">
          <Box
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              backgroundColor: riskColor[riskAssessment.overallRisk],
              borderRadius: '4px',
              color: 'white',
              fontWeight: 600,
            }}
          >
            {riskAssessment.overallRisk} RISK
          </Box>
        </Flex>

        {riskAssessment.risks.length > 0 && (
          <Box>
            <Text variant="body" style={{ fontWeight: 600 }}>Identified Risks</Text>
            <Stack spacing="var(--spacing-2)">
              {riskAssessment.risks.map((risk, i) => (
                <Box
                  key={i}
                  style={{
                    padding: 'var(--spacing-2)',
                    backgroundColor: 'var(--color-gray-50)',
                    borderRadius: '4px',
                    borderLeft: `3px solid ${riskColor[risk.severity]}`,
                  }}
                >
                  <Text variant="caption" style={{ fontWeight: 600 }}>{risk.category}</Text>
                  <Text variant="caption">{risk.description}</Text>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <Box>
          <Text variant="body" style={{ fontWeight: 600 }}>Mitigations</Text>
          <Stack spacing="var(--spacing-1)">
            {riskAssessment.mitigations.map((m, i) => (
              <Text key={i} variant="caption">→ {m}</Text>
            ))}
          </Stack>
        </Box>
      </Stack>
    );
  };

  return (
    <Card variant="bordered">
      <CardBody padding="md">
        <Stack spacing="var(--spacing-4)">
          <Flex align="center" gap="sm">
            <Text style={{ fontSize: '20px' }}>🤖</Text>
            <Text variant="heading5">AI Insights</Text>
          </Flex>

          {/* Tabs */}
          <Flex gap="sm">
            {(['summary', 'fit', 'risk'] as Tab[]).map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'summary' ? 'Summary' : tab === 'fit' ? 'Fit Score' : 'Risks'}
              </Button>
            ))}
          </Flex>

          {/* Content */}
          {loading && <Text variant="caption" color="muted">Analyzing...</Text>}
          {error !== null && <Text variant="caption" style={{ color: 'var(--color-danger)' }}>{error}</Text>}
          {loading === false && error === null && (
            <>
              {activeTab === 'summary' && renderSummary()}
              {activeTab === 'fit' && renderFitScore()}
              {activeTab === 'risk' && renderRiskAssessment()}
            </>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default AIInsightsPanel;
