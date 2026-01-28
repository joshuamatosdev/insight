import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {exportToCSV} from './csv';
import type {Opportunity} from '../components/domain/opportunity';

// ==================== Test Fixtures ====================

function createMockOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: 'opp-123',
    title: 'Test Opportunity',
    solicitationNumber: 'SOL-2024-001',
    type: 'solicitation',
    naicsCode: '541512',
    postedDate: '2024-01-15',
    responseDeadLine: '2024-02-15',
    url: 'https://sam.gov/opp/123',
    ...overrides,
  };
}

// ==================== Mock Setup ====================

interface MockBlobContent {
  content: string;
  type: string;
}

describe('CSV Export Service', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let capturedAnchorElement: { href: string; download: string } | null;
  let capturedBlobContent: MockBlobContent | null;

  beforeEach(() => {
    capturedAnchorElement = null;
    capturedBlobContent = null;

    // Mock URL methods
    mockCreateObjectURL = vi.fn().mockReturnValue('blob:test-url');
    mockRevokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    // Mock Blob to capture CSV content
    vi.stubGlobal(
      'Blob',
      class MockBlob {
        content: string;
        type: string;
        constructor(parts: BlobPart[], options?: BlobPropertyBag) {
          this.content = parts.join('');
          this.type = options?.type ?? '';
          capturedBlobContent = { content: this.content, type: this.type };
        }
      }
    );

    // Mock document methods
    mockClick = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();

    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') {
        const anchor = {
          href: '',
          download: '',
          click: mockClick,
        };
        capturedAnchorElement = anchor;
        return anchor as unknown as HTMLAnchorElement;
      }
      return document.createElement(tagName);
    });

    vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
    vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // ==================== exportToCSV ====================

  describe('exportToCSV()', () => {
    it('should generate valid CSV content with headers', () => {
      const opportunities = [createMockOpportunity()];

      exportToCSV(opportunities);

      expect(capturedBlobContent).not.toBeNull();
      const lines = capturedBlobContent?.content.split('\n');
      expect(lines).toBeDefined();
      expect(lines?.at(0)).toBe(
        'Title,Solicitation Number,Type,NAICS Code,Posted Date,Deadline,URL'
      );
    });

    it('should generate correct CSV row for opportunity', () => {
      const opportunities = [
        createMockOpportunity({
          title: 'Test Title',
          solicitationNumber: 'SOL-001',
          type: 'solicitation',
          naicsCode: '541512',
          postedDate: '2024-01-15',
          responseDeadLine: '2024-02-15',
          url: 'https://sam.gov/opp/1',
        }),
      ];

      exportToCSV(opportunities);

      expect(capturedBlobContent).not.toBeNull();
      const lines = capturedBlobContent?.content.split('\n');
      expect(lines?.at(1)).toBe(
        '"Test Title",SOL-001,solicitation,541512,2024-01-15,2024-02-15,https://sam.gov/opp/1'
      );
    });

    it('should handle multiple opportunities', () => {
      const opportunities = [
        createMockOpportunity({ id: '1', title: 'First' }),
        createMockOpportunity({ id: '2', title: 'Second' }),
        createMockOpportunity({ id: '3', title: 'Third' }),
      ];

      exportToCSV(opportunities);

      expect(capturedBlobContent).not.toBeNull();
      const lines = capturedBlobContent?.content.split('\n');
      // Header + 3 rows
      expect(lines?.length).toBe(4);
    });

    it('should handle empty array', () => {
      exportToCSV([]);

      expect(capturedBlobContent).not.toBeNull();
      const lines = capturedBlobContent?.content.split('\n');
      // Only header row
      expect(lines?.length).toBe(1);
      expect(lines?.at(0)).toBe(
        'Title,Solicitation Number,Type,NAICS Code,Posted Date,Deadline,URL'
      );
    });

    it('should escape double quotes in title', () => {
      const opportunities = [
        createMockOpportunity({
          title: 'Title with "quotes" inside',
        }),
      ];

      exportToCSV(opportunities);

      expect(capturedBlobContent).not.toBeNull();
      const lines = capturedBlobContent?.content.split('\n');
      // Double quotes should be escaped as ""
      expect(lines?.at(1)).toContain('"Title with ""quotes"" inside"');
    });

    it('should handle titles with commas', () => {
      const opportunities = [
        createMockOpportunity({
          title: 'Title, with, commas',
        }),
      ];

      exportToCSV(opportunities);

      expect(capturedBlobContent).not.toBeNull();
      const lines = capturedBlobContent?.content.split('\n');
      // Title should be wrapped in quotes to handle commas
      expect(lines?.at(1)).toContain('"Title, with, commas"');
    });

    it('should create blob with text/csv type', () => {
      exportToCSV([createMockOpportunity()]);

      expect(capturedBlobContent?.type).toBe('text/csv');
    });

    it('should trigger download with correct default filename', () => {
      // Mock Date to control the date part of filename
      const mockDate = new Date('2024-03-15T12:00:00Z');
      vi.setSystemTime(mockDate);

      exportToCSV([createMockOpportunity()]);

      expect(capturedAnchorElement?.download).toBe('sam-opportunities-2024-03-15.csv');

      vi.useRealTimers();
    });

    it('should use custom filename when provided', () => {
      exportToCSV([createMockOpportunity()], 'my-custom-export.csv');

      expect(capturedAnchorElement?.download).toBe('my-custom-export.csv');
    });

    it('should set anchor href to blob URL', () => {
      exportToCSV([createMockOpportunity()]);

      expect(capturedAnchorElement?.href).toBe('blob:test-url');
    });

    it('should trigger click on anchor element', () => {
      exportToCSV([createMockOpportunity()]);

      expect(mockClick).toHaveBeenCalledTimes(1);
    });

    it('should append and remove anchor from document body', () => {
      exportToCSV([createMockOpportunity()]);

      expect(mockAppendChild).toHaveBeenCalledTimes(1);
      expect(mockRemoveChild).toHaveBeenCalledTimes(1);
    });

    it('should revoke blob URL after download', () => {
      exportToCSV([createMockOpportunity()]);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:test-url');
    });

    it('should handle opportunity with missing optional fields', () => {
      const opportunities = [
        {
          id: 'opp-1',
          title: '',
          solicitationNumber: '',
          type: '',
          naicsCode: '',
          postedDate: '',
          responseDeadLine: '',
          url: '',
        } as Opportunity,
      ];

      exportToCSV(opportunities);

      expect(capturedBlobContent).not.toBeNull();
      const lines = capturedBlobContent?.content.split('\n');
      // 7 columns: Title, Solicitation Number, Type, NAICS Code, Posted Date, Deadline, URL
      // Empty title is quoted, others are empty strings separated by 6 commas
      expect(lines?.at(1)).toBe('"",,,,,,' );
    });

    it('should handle special characters in fields', () => {
      const opportunities = [
        createMockOpportunity({
          title: 'Title with\nnewline',
          solicitationNumber: 'SOL<>001',
        }),
      ];

      exportToCSV(opportunities);

      expect(capturedBlobContent).not.toBeNull();
      // Content should still be generated
      expect(capturedBlobContent?.content.length).toBeGreaterThan(0);
    });
  });
});
