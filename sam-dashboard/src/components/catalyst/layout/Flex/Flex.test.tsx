import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Flex} from './Flex';

describe('Flex', () => {
    it('renders children correctly', () => {
        render(<Flex>Content</Flex>);
        expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
        render(<Flex data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element.tagName).toBe('DIV');
    });

    it('applies display flex', () => {
        render(<Flex data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element).toHaveStyle({display: 'flex'});
    });

    it('applies row direction by default', () => {
        render(<Flex data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element).toHaveStyle({flexDirection: 'row'});
    });

    it('applies column direction when specified', () => {
        render(<Flex direction="column" data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element).toHaveStyle({flexDirection: 'column'});
    });

    it('applies justify-content correctly', () => {
        render(<Flex justify="between" data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element).toHaveStyle({justifyContent: 'space-between'});
    });

    it('applies align-items correctly', () => {
        render(<Flex align="center" data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element).toHaveStyle({alignItems: 'center'});
    });

    it('applies flex-wrap correctly', () => {
        render(<Flex wrap="wrap" data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element).toHaveStyle({flexWrap: 'wrap'});
    });

    it('applies gap with semantic size value', () => {
        render(<Flex gap="md" data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element).toHaveClass('gap-4');
    });

    it('applies gap with xl size value', () => {
        render(<Flex gap="xl" data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element).toHaveClass('gap-8');
    });

    it('applies className correctly', () => {
        render(<Flex className="custom-flex" data-testid="flex">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element.className).toBe('custom-flex');
    });

    it('passes through additional HTML attributes', () => {
        render(<Flex data-testid="flex" id="my-flex" title="tooltip">Content</Flex>);
        const element = screen.getByTestId('flex');
        expect(element.id).toBe('my-flex');
        expect(element.title).toBe('tooltip');
    });
});
