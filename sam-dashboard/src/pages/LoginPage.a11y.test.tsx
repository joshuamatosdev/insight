import {render} from '@testing-library/react';
import {axe, toHaveNoViolations} from 'jest-axe';
import {describe, expect, it, vi} from 'vitest';
import {RouterTestWrapper} from '@/test/router-test-utils';

import {LoginPage} from './LoginPage';

expect.extend(toHaveNoViolations);

// Mock the auth hook
vi.mock('../auth', () => ({
    useAuth: () => ({
        login: vi.fn(),
        isLoading: false,
        error: null,
    }),
}));

const renderWithRouter = (component: React.ReactNode) => {
    return render(<RouterTestWrapper>{component}</RouterTestWrapper>);
};

describe('LoginPage accessibility', () => {
    it('should have no accessibility violations', async () => {
        const {container} = renderWithRouter(<LoginPage/>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('should have no accessibility violations with error state', async () => {
        vi.mock('../auth', () => ({
            useAuth: () => ({
                login: vi.fn(),
                isLoading: false,
                error: 'Invalid credentials',
            }),
        }));

        const {container} = renderWithRouter(<LoginPage/>);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
