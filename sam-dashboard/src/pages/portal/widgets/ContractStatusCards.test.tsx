import {describe, expect, it} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import {ContractStatusCards} from './ContractStatusCards';

describe('ContractStatusCards', () => {
    describe('Header', () => {
        it('should render the widget title', () => {
            render(<ContractStatusCards/>);

            expect(screen.getByText('Active Contracts')).toBeInTheDocument();
        });

        it('should render View All button', () => {
            render(<ContractStatusCards/>);

            expect(screen.getByRole('button', {name: /view all/i})).toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading text initially', () => {
            render(<ContractStatusCards/>);

            expect(screen.getByText('Loading contracts...')).toBeInTheDocument();
        });
    });

    describe('Contract Display', () => {
        it('should display contracts after loading', async () => {
            render(<ContractStatusCards/>);

            await waitFor(
                () => {
                    expect(screen.getByText('FA8773-24-C-0001')).toBeInTheDocument();
                },
                {timeout: 1000}
            );

            expect(screen.getByText('W912DQ-23-D-0045')).toBeInTheDocument();
            expect(screen.getByText('GS-35F-0123X')).toBeInTheDocument();
        });

        it('should display contract titles', async () => {
            render(<ContractStatusCards/>);

            await waitFor(
                () => {
                    expect(screen.getByText('IT Infrastructure Support')).toBeInTheDocument();
                },
                {timeout: 1000}
            );

            expect(screen.getByText('Engineering Services')).toBeInTheDocument();
            expect(screen.getByText('Software Development')).toBeInTheDocument();
        });

        it('should display contract values formatted as currency', async () => {
            render(<ContractStatusCards/>);

            await waitFor(
                () => {
                    expect(screen.getByText('$850,000')).toBeInTheDocument();
                },
                {timeout: 1000}
            );

            expect(screen.getByText('$1,200,000')).toBeInTheDocument();
            expect(screen.getByText('$400,000')).toBeInTheDocument();
        });

        it('should display progress percentages', async () => {
            render(<ContractStatusCards/>);

            await waitFor(
                () => {
                    expect(screen.getByText('65%')).toBeInTheDocument();
                },
                {timeout: 1000}
            );

            expect(screen.getByText('88%')).toBeInTheDocument();
            expect(screen.getByText('45%')).toBeInTheDocument();
        });
    });
});
