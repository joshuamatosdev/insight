import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { Badge } from '../../catalyst/badge';
import { Button } from '../../catalyst/button';
import { Heading, Subheading } from '../../catalyst/heading';
import { Text, Strong } from '../../catalyst/text';
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
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Text className="text-xs">{label}</Text>
        <Text className="text-xs font-semibold">{score}%</Text>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={clsx(
            'h-full transition-all duration-300',
            score >= 70 && 'bg-success',
            score >= 50 && score < 70 && 'bg-warning',
            score < 50 && 'bg-danger'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  const renderSummary = () => {
    if (summary === null) return null;
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Subheading>Executive Summary</Subheading>
          <Text>{summary.executiveSummary}</Text>
        </div>
        <div className="space-y-2">
          <Subheading>Key Points</Subheading>
          <ul className="space-y-1">
            {summary.keyPoints.map((point, i) => (
              <li key={i}>
                <Text className="text-sm">• {point}</Text>
              </li>
            ))}
          </ul>
        </div>
        <Text className="text-xs text-on-surface-muted">
          Confidence: {summary.confidence}%
        </Text>
      </div>
    );
  };

  const renderFitScore = () => {
    if (fitScore === null) return null;
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div
            className={clsx(
              'flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white',
              fitScore.overallScore >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
            )}
          >
            {fitScore.overallScore}
          </div>
          <div className="space-y-1">
            <Subheading>Overall Fit Score</Subheading>
            <Text className="text-sm">{fitScore.reasoning}</Text>
          </div>
        </div>

        <div className="space-y-4">
          {renderScoreBar(fitScore.naicsScore, 'NAICS Match')}
          {renderScoreBar(fitScore.pastPerformanceScore, 'Past Performance')}
          {renderScoreBar(fitScore.certificationScore, 'Certifications')}
          {renderScoreBar(fitScore.geographicScore, 'Geographic')}
        </div>

        <div className="space-y-2">
          <Subheading className="text-success">Strengths</Subheading>
          <ul className="space-y-1">
            {fitScore.strengths.map((s, i) => (
              <li key={i}>
                <Text className="text-sm">✓ {s}</Text>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Subheading className="text-danger">Gaps</Subheading>
          <ul className="space-y-1">
            {fitScore.weaknesses.map((w, i) => (
              <li key={i}>
                <Text className="text-sm">• {w}</Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  const renderRiskAssessment = () => {
    if (riskAssessment === null) return null;

    const getRiskBadgeColor = (risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
      switch (risk) {
        case 'LOW':
          return 'lime';
        case 'MEDIUM':
          return 'amber';
        case 'HIGH':
        case 'CRITICAL':
          return 'rose';
      }
    };

    const getRiskBorderColor = (severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
      switch (severity) {
        case 'LOW':
          return 'border-l-lime-500';
        case 'MEDIUM':
          return 'border-l-amber-500';
        case 'HIGH':
        case 'CRITICAL':
          return 'border-l-rose-500';
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Badge color={getRiskBadgeColor(riskAssessment.overallRisk)}>
            {riskAssessment.overallRisk} RISK
          </Badge>
        </div>

        {riskAssessment.risks.length > 0 && (
          <div className="space-y-3">
            <Subheading>Identified Risks</Subheading>
            <div className="space-y-3">
              {riskAssessment.risks.map((risk, i) => (
                <div
                  key={i}
                  className={clsx(
                    'rounded-lg border-l-4 bg-zinc-50 p-3 dark:bg-zinc-800/50',
                    getRiskBorderColor(risk.severity)
                  )}
                >
                  <Strong className="text-sm">{risk.category}</Strong>
                  <Text className="mt-1 text-sm">{risk.description}</Text>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Subheading>Mitigations</Subheading>
          <ul className="space-y-1">
            {riskAssessment.mitigations.map((m, i) => (
              <li key={i}>
                <Text className="text-sm">→ {m}</Text>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg bg-surface shadow-sm ring-1 ring-border dark:bg-zinc-800/50 dark:ring-white/10">
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">🤖</span>
            <Heading level={3}>AI Insights</Heading>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(['summary', 'fit', 'risk'] as Tab[]).map((tab) => (
              <Button
                key={tab}
                color={activeTab === tab ? 'dark/zinc' : 'white'}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'summary' ? 'Summary' : tab === 'fit' ? 'Fit Score' : 'Risks'}
              </Button>
            ))}
          </div>

          {/* Content */}
          {loading && (
            <Text className="text-sm text-on-surface-muted">Analyzing...</Text>
          )}
          {error !== null && (
            <Text className="text-sm text-danger">{error}</Text>
          )}
          {loading === false && error === null && (
            <>
              {activeTab === 'summary' && renderSummary()}
              {activeTab === 'fit' && renderFitScore()}
              {activeTab === 'risk' && renderRiskAssessment()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIInsightsPanel;
