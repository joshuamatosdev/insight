import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {RootFrame} from './RootFrame';

describe('RootFrame', () => {
    it('renders children content', () => {
        render(
            <RootFrame>
                <div data-testid="test-content">Test Content</div>
            </RootFrame>
        );

        expect(screen.getByTestId('test-content')).toBeInTheDocument();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('applies custom className to inner frame', () => {
        const {container} = render(
            <RootFrame className="custom-class">
                <div>Content</div>
            </RootFrame>
        );

        const innerFrame = container.querySelector('.custom-class');
        expect(innerFrame).toBeInTheDocument();
    });

    it('has dark outer frame with padding', () => {
        const {container} = render(
            <RootFrame>
                <div>Content</div>
            </RootFrame>
        );

        const outerFrame = container.firstChild as HTMLElement;
        expect(outerFrame).toHaveClass('min-h-screen');
        expect(outerFrame).toHaveClass('bg-zinc-950');
        expect(outerFrame).toHaveClass('p-2');
        expect(outerFrame).toHaveClass('sm:p-3');
    });

    it('has white inner frame with rounded corners', () => {
        const {container} = render(
            <RootFrame>
                <div>Content</div>
            </RootFrame>
        );

        const innerFrame = container.querySelector('.bg-white') as HTMLElement;
        expect(innerFrame).toBeInTheDocument();
        expect(innerFrame).toHaveClass('rounded-2xl');
        expect(innerFrame).toHaveClass('sm:rounded-3xl');
        expect(innerFrame).toHaveClass('overflow-hidden');
    });

    it('supports dark mode with dark inner background', () => {
        const {container} = render(
            <RootFrame>
                <div>Content</div>
            </RootFrame>
        );

        const innerFrame = container.querySelector('.dark\\:bg-zinc-900');
        expect(innerFrame).toBeInTheDocument();
    });

    it('applies correct height calculations', () => {
        const {container} = render(
            <RootFrame>
                <div>Content</div>
            </RootFrame>
        );

        const innerFrame = container.querySelector('.min-h-\\[calc\\(100vh-1rem\\)\\]') as HTMLElement;
        expect(innerFrame).toBeInTheDocument();
        expect(innerFrame).toHaveClass('sm:min-h-[calc(100vh-1.5rem)]');
    });
});
