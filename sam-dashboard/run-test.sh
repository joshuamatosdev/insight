#!/bin/bash
export NODE_ENV=test
npx vitest run src/components/catalyst/tooltip.test.tsx --reporter=verbose
