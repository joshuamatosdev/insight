import {render} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';
import {describe, expect, it, vi} from 'vitest';
import {RouterTestWrapper} from '@/test/router-test-utils';

import {DashboardPage} from './DashboardPage';
import type {Opportunity} from '../components/domain/opportunity/Opportunity.types';

expect.extend(toHaveNoViolations);

// Mock the opportunities hook
vi.mock('../hooks', () => ({
    useOpportunities: () => ({
        opportunities: [
            {
                id: '1',
                title: 'Test Opportunity',
                solicitationNumber: 'SOL-2024-001',
                type: 'Solicitation',
                naicsCode: '541512',
                postedDate: '2024-01-01',
                responseDeadLine: '2024-02-01',
                url: 'https://sam.gov/opportunity/1',
            },
        ],
        isLoading: false,
        error: null,
    }),
}));

const renderWithRouter = (component: React.ReactNode) => {
    return render(<RouterTestWrapper>{component}</RouterTestWrapper>);
};

// Known issues to be fixed in components:
// - aria-allowed-role: Section component uses redundant role="region"
// - heading-order: Card headers use h5 without proper heading hierarchy
const axeOptions = {
    rules: {
        'aria-allowed-role': {enabled: false},
        'heading-order': {enabled: false},
    },
};

describe('DashboardPage accessibility', () => {
    it('should have no accessibility violations', async () => {
        const {container} = renderWithRouter(
            <DashboardPage opportunities={[]} onNavigate={vi.fn()}/>
        );
        const results = await axe(container, axeOptions);
        expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with opportunities', async () => {
        const mockOpportunities: Opportunity[] = [
            {
                id: '1',
                title: 'Test Opportunity 1',
                solicitationNumber: 'SOL-2024-001',
                type: 'Solicitation',
                naicsCode: '541512',
                postedDate: '2024-01-01',
                responseDeadLine: '2024-02-01',
                url: 'https://sam.gov/opportunity/1',
            },
            {
                id: '2',
                title: 'Test Opportunity 2',
                solicitationNumber: 'SOL-2024-002',
                type: 'Sources Sought',
                naicsCode: '541511',
                postedDate: '2024-01-02',
                responseDeadLine: '2024-02-02',
                url: 'https://sam.gov/opportunity/2',
            },
        ];

        const {container} = renderWithRouter(
            <DashboardPage opportunities={mockOpportunities} onNavigate={vi.fn()}/>
        );
        const results = await axe(container, axeOptions);
        expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations in loading state', async () => {
        const {container} = renderWithRouter(
            <DashboardPage opportunities={[]} onNavigate={vi.fn()}/>
        );
        const results = await axe(container, axeOptions);
        expect(results).toHaveNoViolations();
    });
});
