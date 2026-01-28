import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ScreenReaderOnly} from './ScreenReaderOnly';

describe('ScreenReaderOnly', () => {
    it('renders visually hidden content', () => {
        render(<ScreenReaderOnly>Hidden text</ScreenReaderOnly>);

        const element = screen.getByText('Hidden text');
        expect(element).toBeInTheDocument();
        expect(element).toHaveStyle({position: 'absolute'});
        expect(element).toHaveStyle({width: '1px'});
        expect(element).toHaveStyle({height: '1px'});
    });

    it('renders as span by default', () => {
        render(<ScreenReaderOnly>Hidden text</ScreenReaderOnly>);

        const element = screen.getByText('Hidden text');
        expect(element.tagName).toBe('SPAN');
    });

    it('renders as custom element when specified', () => {
        render(<ScreenReaderOnly as="div">Hidden text</ScreenReaderOnly>);

        const element = screen.getByText('Hidden text');
        expect(element.tagName).toBe('DIV');
    });

    it('adds tabIndex for focusable elements', () => {
        render(<ScreenReaderOnly focusable>Skip link</ScreenReaderOnly>);

        const element = screen.getByText('Skip link');
        expect(element).toHaveAttribute('tabindex', '0');
    });
});
