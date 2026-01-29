import {describe, expect, it} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {RouterTestWrapper} from '@/test/router-test-utils';
import {ClientDashboard} from './ClientDashboard';
import {PORTAL_LABELS} from '@/constants/labels';

// Wrapper for routing context
function renderWithRouter(ui: React.ReactElement): ReturnType<typeof render> {
    return render(<RouterTestWrapper>{ui}</RouterTestWrapper>);
}

describe('ClientDashboard', () => {
    describe('Header Section', () => {
        it('should render the dashboard title', () => {
            renderWithRouter(<ClientDashboard/>);

            expect(screen.getByText(PORTAL_LABELS.DASHBOARD_TITLE)).toBeInTheDocument();
        });

        it('should render the welcome message', () => {
            renderWithRouter(<ClientDashboard/>);

            expect(
                screen.getByText(PORTAL_LABELS.DASHBOARD_WELCOME)
            ).toBeInTheDocument();
        });

        it('should render Export Report button', () => {
            renderWithRouter(<ClientDashboard/>);

            expect(screen.getByRole('button', {name: /export report/i})).toBeInTheDocument();
        });

        it('should render New Submission button', () => {
            renderWithRouter(<ClientDashboard/>);

            expect(screen.getByRole('button', {name: /new submission/i})).toBeInTheDocument();
        });
    });

    describe('Quick Stats Section', () => {
        it('should render all four quick stat card labels', () => {
            renderWithRouter(<ClientDashboard/>);

            // "Active Contracts" appears in both quick stats and widget header, use getAllByText
            expect(screen.getAllByText(PORTAL_LABELS.ACTIVE_CONTRACTS).length).toBeGreaterThan(0);
            expect(screen.getByText(PORTAL_LABELS.PENDING_INVOICES)).toBeInTheDocument();
            // "Upcoming Deadlines" appears in both quick stats and widget header
            expect(screen.getAllByText(PORTAL_LABELS.UPCOMING_DEADLINES).length).toBeGreaterThan(0);
            expect(screen.getByText(PORTAL_LABELS.TOTAL_CONTRACT_VALUE)).toBeInTheDocument();
        });

        it('should display metric values after loading', async () => {
            renderWithRouter(<ClientDashboard/>);

            await waitFor(
                () => {
                    expect(screen.getByText('5')).toBeInTheDocument();
                },
                {timeout: 2000}
            );

            expect(screen.getByText('3')).toBeInTheDocument();
            expect(screen.getByText('8')).toBeInTheDocument();
            expect(screen.getByText('$2,450,000')).toBeInTheDocument();
        });

        it('should render stat icons', () => {
            renderWithRouter(<ClientDashboard/>);

            expect(screen.getByText('📋')).toBeInTheDocument();
            expect(screen.getByText('💰')).toBeInTheDocument();
            expect(screen.getByText('📅')).toBeInTheDocument();
            expect(screen.getByText('💵')).toBeInTheDocument();
        });
    });

    describe('Widget Headers', () => {
        it('should render widget headers', async () => {
            renderWithRouter(<ClientDashboard/>);

            // These should be present immediately as they're in child components
            await waitFor(
                () => {
                    expect(screen.getByText(PORTAL_LABELS.INVOICE_SUMMARY)).toBeInTheDocument();
                },
                {timeout: 1000}
            );

            expect(screen.getByText(PORTAL_LABELS.DELIVERABLE_TRACKER)).toBeInTheDocument();
            // "Upcoming Deadlines" appears in both quick stats and widget header
            expect(screen.getAllByText(PORTAL_LABELS.UPCOMING_DEADLINES).length).toBeGreaterThan(0);
        });
    });
});
