import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {StatCard} from './StatCard';
import {StatsGrid} from './StatsGrid';

describe('StatCard', () => {
    it('renders value correctly', () => {
        render(<StatCard value={42} label="Total"/>);
        expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('renders label correctly', () => {
        render(<StatCard value={42} label="Total Items"/>);
        expect(screen.getByText('Total Items')).toBeInTheDocument();
    });

    it('renders icon when provided', () => {
        render(
            <StatCard
                value={42}
                label="Total"
                icon={<span data-testid="icon">📊</span>}
            />
        );
        expect(screen.getByTestId('icon')).toBeInTheDocument();
    });

    it('applies className correctly', () => {
        const {container} = render(
            <StatCard value={42} label="Total"/>
        );
        const element = container.querySelector('div');
        expect(element).toHaveClass('custom-stat');
    });

    it('renders with flat grid styling without card borders', () => {
        const {container} = render(<StatCard value={42} label="Total"/>);
        const element = container.querySelector('div');
        // Should NOT have card styling (bg-white, border, shadow, rounded)
        expect(element).not.toHaveClass('bg-white');
        expect(element).not.toHaveClass('rounded-lg');
        expect(element).not.toHaveClass('shadow-sm');
        // Should have border-t for top border
        expect(element).toHaveClass('border-t');
    });

    it('renders string value', () => {
        render(<StatCard value="$1,234" label="Revenue"/>);
        expect(screen.getByText('$1,234')).toBeInTheDocument();
    });

    it('renders change information when provided', () => {
        render(
            <StatCard
                value={42}
                label="Total"
                change={{value: '+12.5%', type: 'positive'}}
            />
        );
        expect(screen.getByText('+12.5%')).toBeInTheDocument();
    });

    it('renders negative change with appropriate styling', () => {
        render(
            <StatCard
                value={42}
                label="Total"
                change={{value: '-8.3%', type: 'negative'}}
            />
        );
        expect(screen.getByText('-8.3%')).toBeInTheDocument();
    });

    it('uses semantic HTML with dt/dd elements', () => {
        const {container} = render(<StatCard value={42} label="Total"/>);
        expect(container.querySelector('dt')).toBeInTheDocument();
        expect(container.querySelector('dd')).toBeInTheDocument();
    });

    it('applies large value typography', () => {
        const {container} = render(<StatCard value={42} label="Total"/>);
        const valueElement = container.querySelector('dd');
        expect(valueElement).toHaveClass('text-3xl/10', 'font-medium', 'tracking-tight');
    });
});

describe('StatsGrid', () => {
    it('renders children correctly', () => {
        render(
            <StatsGrid>
                <StatCard value={1} label="One"/>
                <StatCard value={2} label="Two"/>
            </StatsGrid>
        );
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('renders as semantic dl element', () => {
        const {container} = render(
            <StatsGrid>
                <StatCard value={1} label="One"/>
            </StatsGrid>
        );
        expect(container.querySelector('dl')).toBeInTheDocument();
    });

    it('applies grid layout', () => {
        const {container} = render(
            <StatsGrid>
                <StatCard value={1} label="One"/>
            </StatsGrid>
        );
        const dlElement = container.querySelector('dl');
        expect(dlElement).toHaveClass('grid');
    });

    it('applies default 4 column layout', () => {
        const {container} = render(
            <StatsGrid>
                <StatCard value={1} label="One"/>
            </StatsGrid>
        );
        const dlElement = container.querySelector('dl');
        expect(dlElement).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-4');
    });

    it('applies custom column count', () => {
        const {container} = render(
            <StatsGrid columns={3}>
                <StatCard value={1} label="One"/>
            </StatsGrid>
        );
        const dlElement = container.querySelector('dl');
        expect(dlElement).toHaveClass('sm:grid-cols-2', 'lg:grid-cols-3');
    });

    it('applies border dividers between items', () => {
        const {container} = render(
            <StatsGrid columns={4}>
                <StatCard value={1} label="One"/>
                <StatCard value={2} label="Two"/>
                <StatCard value={3} label="Three"/>
                <StatCard value={4} label="Four"/>
            </StatsGrid>
        );
        const items = container.querySelectorAll('div[class*="border-t"]');
        expect(items.length).toBeGreaterThan(0);
    });

    it('wraps grid in container with top/bottom borders', () => {
        const {container} = render(
            <StatsGrid>
                <StatCard value={1} label="One"/>
            </StatsGrid>
        );
        const wrapper = container.querySelector('div[class*="border-b"]');
        expect(wrapper).toBeInTheDocument();
        expect(wrapper).toHaveClass('border-b');
    });
});
