/**
 * AI Analysis service for contract and opportunity intelligence.
 */

const API_BASE = '/ai';

export interface AISummary {
    executiveSummary: string;
    keyPoints: string[];
    scopeSummary: string;
    timeline: string[];
    budgetAnalysis: string;
    confidence: number;
}

export interface AIFitScore {
    overallScore: number;
    naicsScore: number;
    pastPerformanceScore: number;
    certificationScore: number;
    geographicScore: number;
    reasoning: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
}

export interface AIRisk {
    category: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    mitigation: string;
}

export interface AIRiskAssessment {
    overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    risks: AIRisk[];
    mitigations: string[];
    redFlags: string[];
    complianceConcerns: string[];
}

export interface AISectionSuggestion {
    section: string;
    suggestion: string;
    keyPoints: string[];
}

export interface AIProposalSuggestions {
    winThemes: string[];
    discriminators: string[];
    sectionSuggestions: AISectionSuggestion[];
    complianceChecklist: string[];
}

/**
 * Get AI-generated summary of an opportunity.
 */
export async function getOpportunitySummary(opportunityId: string): Promise<AISummary> {
    const response = await fetch(`${API_BASE}/opportunities/${opportunityId}/summary`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to get AI summary');
    }

    return response.json();
}

/**
 * Get fit score for an opportunity.
 */
export async function getFitScore(opportunityId: string): Promise<AIFitScore> {
    const response = await fetch(`${API_BASE}/opportunities/${opportunityId}/fit-score`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to get fit score');
    }

    return response.json();
}

/**
 * Get risk assessment for an opportunity.
 */
export async function getRiskAssessment(opportunityId: string): Promise<AIRiskAssessment> {
    const response = await fetch(`${API_BASE}/opportunities/${opportunityId}/risk-assessment`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to get risk assessment');
    }

    return response.json();
}

/**
 * Get proposal suggestions for an opportunity.
 */
export async function getProposalSuggestions(opportunityId: string): Promise<AIProposalSuggestions> {
    const response = await fetch(`${API_BASE}/opportunities/${opportunityId}/proposal-suggestions`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to get proposal suggestions');
    }

    return response.json();
}
