import {toHaveNoViolations} from 'jest-axe';
import {expect} from 'vitest';

// Extend Vitest's expect with jest-axe matchers
expect.extend(toHaveNoViolations);

// Export for use in test files
export {axe} from 'jest-axe';
