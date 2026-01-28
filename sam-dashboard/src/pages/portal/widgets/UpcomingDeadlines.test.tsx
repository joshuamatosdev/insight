import {describe, expect, it} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {UpcomingDeadlines} from './UpcomingDeadlines';

describe('UpcomingDeadlines', () => {
    describe('Header', () => {
        it('should render the widget title', () => {
            render(<UpcomingDeadlines/>);

            expect(screen.getByText('Upcoming Deadlines')).toBeInTheDocument();
        });

        it('should render View Calendar button', () => {
            render(<UpcomingDeadlines/>);

            expect(screen.getByRole('button', {name: /view calendar/i})).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading text initially', () => {
            render(<UpcomingDeadlines/>);

            expect(screen.getByText('Loading deadlines...')).toBeInTheDocument();
        });
    });

    describe('Deadline Display', () => {
        it('should display deadline titles after loading', async () => {
            render(<UpcomingDeadlines/>);

            await waitFor(
                () => {
                    expect(screen.getByText('Monthly Status Report')).toBeInTheDocument();
                },
                {timeout: 1000}
            );

            expect(screen.getByText('Invoice Submission')).toBeInTheDocument();
            expect(screen.getByText('Quarterly Program Review')).toBeInTheDocument();
        });

        it('should display type icons after loading', async () => {
            render(<UpcomingDeadlines/>);

            await waitFor(
                () => {
                    expect(screen.getByText('📊')).toBeInTheDocument();
                },
                {timeout: 1000}
            );

            expect(screen.getByText('💰')).toBeInTheDocument();
            expect(screen.getByText('👥')).toBeInTheDocument();
            expect(screen.getByText('📦')).toBeInTheDocument();
            expect(screen.getByText('🔍')).toBeInTheDocument();
        });
    });
});
