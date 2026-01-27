/**
 * Tests for AI Service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getOpportunitySummary,
  getFitScore,
  getRiskAssessment,
  getProposalSuggestions,
} from './aiService';
import type {
  AISummary,
  AIFitScore,
  AIRiskAssessment,
  AIProposalSuggestions,
} from './aiService';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockLocalStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    mockLocalStorage[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete mockLocalStorage[key];
  }),
  clear: vi.fn(() => {
    Object.keys(mockLocalStorage).forEach((key) => delete mockLocalStorage[key]);
  }),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockLocalStorage['token'] = 'test-token';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getOpportunitySummary', () => {
    it('fetches AI summary successfully', async () => {
      const mockSummary: AISummary = {
        executiveSummary: 'This is a contract for IT services.',
        keyPoints: ['Key point 1', 'Key point 2'],
        scopeSummary: 'Full IT support for agency',
        timeline: ['Phase 1: Q1', 'Phase 2: Q2'],
        budgetAnalysis: '$500K-$1M estimated',
        confidence: 85,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSummary),
      });

      const result = await getOpportunitySummary('opp-123');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/ai/opportunities/opp-123/summary',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockSummary);
      expect(result.confidence).toBe(85);
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getOpportunitySummary('opp-123')).rejects.toThrow(
        'Failed to get AI summary'
      );
    });
  });

  describe('getFitScore', () => {
    it('fetches fit score successfully', async () => {
      const mockFitScore: AIFitScore = {
        overallScore: 78,
        naicsScore: 90,
        pastPerformanceScore: 75,
        certificationScore: 65,
        geographicScore: 80,
        reasoning: 'Strong NAICS match with good past performance',
        strengths: ['8(a) certified', 'Local presence'],
        weaknesses: ['Limited large contract experience'],
        recommendations: ['Partner with larger firm', 'Highlight certifications'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFitScore),
      });

      const result = await getFitScore('opp-456');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/ai/opportunities/opp-456/fit-score',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockFitScore);
      expect(result.overallScore).toBe(78);
      expect(result.strengths.length).toBe(2);
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getFitScore('opp-456')).rejects.toThrow(
        'Failed to get fit score'
      );
    });
  });

  describe('getRiskAssessment', () => {
    it('fetches risk assessment successfully', async () => {
      const mockRiskAssessment: AIRiskAssessment = {
        overallRisk: 'MEDIUM',
        risks: [
          {
            category: 'Schedule',
            description: 'Tight timeline for Phase 1',
            severity: 'MEDIUM',
            mitigation: 'Request timeline extension or add resources',
          },
          {
            category: 'Technical',
            description: 'Complex integration requirements',
            severity: 'HIGH',
            mitigation: 'Engage specialist subcontractor',
          },
        ],
        mitigations: ['Add buffer time', 'Engage specialists early'],
        redFlags: ['Unrealistic schedule'],
        complianceConcerns: ['FAR 52.204-21 cybersecurity'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockRiskAssessment),
      });

      const result = await getRiskAssessment('opp-789');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/ai/opportunities/opp-789/risk-assessment',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockRiskAssessment);
      expect(result.overallRisk).toBe('MEDIUM');
      expect(result.risks.length).toBe(2);
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getRiskAssessment('opp-789')).rejects.toThrow(
        'Failed to get risk assessment'
      );
    });
  });

  describe('getProposalSuggestions', () => {
    it('fetches proposal suggestions successfully', async () => {
      const mockSuggestions: AIProposalSuggestions = {
        winThemes: ['Innovation', 'Cost efficiency', 'Local expertise'],
        discriminators: ['Unique technology', 'Faster delivery'],
        sectionSuggestions: [
          {
            section: 'Technical Approach',
            suggestion: 'Focus on automation capabilities',
            keyPoints: ['Automation', 'AI integration', 'Scalability'],
          },
          {
            section: 'Management Approach',
            suggestion: 'Emphasize experienced team',
            keyPoints: ['PM certification', 'Domain expertise'],
          },
        ],
        complianceChecklist: [
          'Section L requirements met',
          'Past performance references included',
          'Price proposal format correct',
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockSuggestions),
      });

      const result = await getProposalSuggestions('opp-101');

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/ai/opportunities/opp-101/proposal-suggestions',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
      expect(result).toEqual(mockSuggestions);
      expect(result.winThemes.length).toBe(3);
      expect(result.sectionSuggestions.length).toBe(2);
    });

    it('throws error when fetch fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      await expect(getProposalSuggestions('opp-101')).rejects.toThrow(
        'Failed to get proposal suggestions'
      );
    });
  });
});
