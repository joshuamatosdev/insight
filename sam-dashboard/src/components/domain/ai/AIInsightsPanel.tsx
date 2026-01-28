import {useEffect, useState} from 'react';

import {Badge} from '../../catalyst/primitives/badge';
import {Button} from '../../catalyst/primitives/button';
import {Heading, Subheading} from '../../catalyst/primitives/heading';
import {Strong, Text} from '../../catalyst/primitives/text';
import {
    AIFitScore,
    AIRiskAssessment,
    AISummary,
    getFitScore,
    getOpportunitySummary,
    getRiskAssessment,
} from '../../../services/aiService';

interface AIInsightsPanelProps {
    opportunityId: string;
}

type Tab = 'summary' | 'fit' | 'risk';

/**
 * Panel displaying AI-generated insights for an opportunity.
 */
export function AIInsightsPanel({opportunityId}: AIInsightsPanelProps): React.ReactElement {
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
        <div>
            <div>
                <Text>{label}</Text>
                <Text>{score}%</Text>
            </div>
            <div>
                <div
                    style={{width: `${score}%`}}
                />
            </div>
        </div>
    );

    const renderSummary = () => {
        if (summary === null) return null;
        return (
            <div>
                <div>
                    <Subheading>Executive Summary</Subheading>
                    <Text>{summary.executiveSummary}</Text>
                </div>
                <div>
                    <Subheading>Key Points</Subheading>
                    <ul>
                        {summary.keyPoints.map((point, i) => (
                            <li key={i}>
                                <Text>• {point}</Text>
                            </li>
                        ))}
                    </ul>
                </div>
                <Text>
                    Confidence: {summary.confidence}%
                </Text>
            </div>
        );
    };

    const renderFitScore = () => {
        if (fitScore === null) return null;
        return (
            <div>
                <div>
                    <div
                    >
                        {fitScore.overallScore}
                    </div>
                    <div>
                        <Subheading>Overall Fit Score</Subheading>
                        <Text>{fitScore.reasoning}</Text>
                    </div>
                </div>

                <div>
                    {renderScoreBar(fitScore.naicsScore, 'NAICS Match')}
                    {renderScoreBar(fitScore.pastPerformanceScore, 'Past Performance')}
                    {renderScoreBar(fitScore.certificationScore, 'Certifications')}
                    {renderScoreBar(fitScore.geographicScore, 'Geographic')}
                </div>

                <div>
                    <Subheading>Strengths</Subheading>
                    <ul>
                        {fitScore.strengths.map((s, i) => (
                            <li key={i}>
                                <Text>✓ {s}</Text>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <Subheading>Gaps</Subheading>
                    <ul>
                        {fitScore.weaknesses.map((w, i) => (
                            <li key={i}>
                                <Text>• {w}</Text>
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
                    return 'yellow';
                case 'HIGH':
                case 'CRITICAL':
                    return 'red';
            }
        };

        const getRiskBorderColor = (severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL') => {
            switch (severity) {
                case 'LOW':
                    return 'border-l-lime-500';
                case 'MEDIUM':
                    return 'border-l-warning';
                case 'HIGH':
                case 'CRITICAL':
                    return 'border-l-danger';
            }
        };

        return (
            <div>
                <div>
                    <Badge color={getRiskBadgeColor(riskAssessment.overallRisk)}>
                        {riskAssessment.overallRisk} RISK
                    </Badge>
                </div>

                {riskAssessment.risks.length > 0 && (
                    <div>
                        <Subheading>Identified Risks</Subheading>
                        <div>
                            {riskAssessment.risks.map((risk, i) => (
                                <div
                                    key={i}
                                >
                                    <Strong>{risk.category}</Strong>
                                    <Text>{risk.description}</Text>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <Subheading>Mitigations</Subheading>
                    <ul>
                        {riskAssessment.mitigations.map((m, i) => (
                            <li key={i}>
                                <Text>→ {m}</Text>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    return (
        <div>
            <div>
                <div>
                    <div>
                        <span>🤖</span>
                        <Heading level={3}>AI Insights</Heading>
                    </div>

                    {/* Tabs */}
                    <div>
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
                        <Text>Analyzing...</Text>
                    )}
                    {error !== null && (
                        <Text>{error}</Text>
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
