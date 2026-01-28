import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {Card} from './Card';
import {CardHeader} from './CardHeader';
import {CardBody} from './CardBody';
import {CardFooter} from './CardFooter';

describe('Card', () => {
    it('renders children correctly', () => {
        render(<Card>Card Content</Card>);
        expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
        render(<Card data-testid="card">Content</Card>);
        const element = screen.getByTestId('card');
        expect(element.tagName).toBe('DIV');
    });

    it('has rounded corners class', () => {
        render(<Card data-testid="card">Content</Card>);
        const element = screen.getByTestId('card');
        expect(element.className).toContain('rounded');
    });

    it('has overflow hidden class', () => {
        render(<Card data-testid="card">Content</Card>);
        const element = screen.getByTestId('card');
        expect(element.className).toContain('overflow-hidden');
    });

    it('applies custom className correctly', () => {
        render(<Card className="custom-card" data-testid="card">Content</Card>);
        const element = screen.getByTestId('card');
        expect(element.className).toContain('custom-card');
    });

    it('passes through additional HTML attributes', () => {
        render(<Card data-testid="card" id="my-card">Content</Card>);
        const element = screen.getByTestId('card');
        expect(element.id).toBe('my-card');
    });

    it('supports elevated variant (default)', () => {
        render(<Card data-testid="card">Content</Card>);
        const element = screen.getByTestId('card');
        expect(element.className).toContain('shadow');
    });

    it('supports outlined variant', () => {
        render(<Card variant="outlined" data-testid="card">Content</Card>);
        const element = screen.getByTestId('card');
        expect(element.className).toContain('border');
    });

    it('supports filled variant', () => {
        render(<Card variant="filled" data-testid="card">Content</Card>);
        const element = screen.getByTestId('card');
        expect(element.className).toContain('bg-zinc');
    });
});

describe('CardHeader', () => {
    it('renders children correctly', () => {
        render(<CardHeader>Header Content</CardHeader>);
        expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
        render(<CardHeader data-testid="header">Content</CardHeader>);
        const element = screen.getByTestId('header');
        expect(element.tagName).toBe('DIV');
    });

    it('has padding classes', () => {
        render(<CardHeader data-testid="header">Content</CardHeader>);
        const element = screen.getByTestId('header');
        // Check for px/py padding classes
        expect(element.className).toMatch(/p[xy]-\d/);
    });

    it('has border-bottom styling', () => {
        render(<CardHeader data-testid="header">Content</CardHeader>);
        const element = screen.getByTestId('header');
        expect(element.className).toContain('border-b');
    });

    it('passes through additional HTML attributes', () => {
        render(<CardHeader data-testid="header" id="my-header">Content</CardHeader>);
        const element = screen.getByTestId('header');
        expect(element.id).toBe('my-header');
    });
});

describe('CardBody', () => {
    it('renders children correctly', () => {
        render(<CardBody>Body Content</CardBody>);
        expect(screen.getByText('Body Content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
        render(<CardBody data-testid="body">Content</CardBody>);
        const element = screen.getByTestId('body');
        expect(element.tagName).toBe('DIV');
    });

    it('applies default md padding', () => {
        render(<CardBody data-testid="body">Content</CardBody>);
        const element = screen.getByTestId('body');
        expect(element.className).toContain('p-5');
    });

    it('applies none padding when specified', () => {
        render(<CardBody padding="none" data-testid="body">Content</CardBody>);
        const element = screen.getByTestId('body');
        expect(element.className).toContain('p-0');
    });

    it('applies sm padding when specified', () => {
        render(<CardBody padding="sm" data-testid="body">Content</CardBody>);
        const element = screen.getByTestId('body');
        expect(element.className).toContain('p-3');
    });

    it('applies lg padding when specified', () => {
        render(<CardBody padding="lg" data-testid="body">Content</CardBody>);
        const element = screen.getByTestId('body');
        expect(element.className).toContain('p-6');
    });

    it('passes through additional HTML attributes', () => {
        render(<CardBody data-testid="body" id="my-body">Content</CardBody>);
        const element = screen.getByTestId('body');
        expect(element.id).toBe('my-body');
    });
});

describe('CardFooter', () => {
    it('renders children correctly', () => {
        render(<CardFooter>Footer Content</CardFooter>);
        expect(screen.getByText('Footer Content')).toBeInTheDocument();
    });

    it('renders as a div element', () => {
        render(<CardFooter data-testid="footer">Content</CardFooter>);
        const element = screen.getByTestId('footer');
        expect(element.tagName).toBe('DIV');
    });

    it('has padding classes', () => {
        render(<CardFooter data-testid="footer">Content</CardFooter>);
        const element = screen.getByTestId('footer');
        expect(element.className).toMatch(/p[xy]-\d/);
    });

    it('has border-top styling', () => {
        render(<CardFooter data-testid="footer">Content</CardFooter>);
        const element = screen.getByTestId('footer');
        expect(element.className).toContain('border-t');
    });

    it('passes through additional HTML attributes', () => {
        render(<CardFooter data-testid="footer" id="my-footer">Content</CardFooter>);
        const element = screen.getByTestId('footer');
        expect(element.id).toBe('my-footer');
    });
});
